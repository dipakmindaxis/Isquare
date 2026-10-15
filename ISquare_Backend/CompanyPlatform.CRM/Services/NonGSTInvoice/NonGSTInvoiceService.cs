using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Services.Email;
using CompanyPlatform.CRM.DTO.NonGSTInvoice;
using PayrollManagementAPI.Services.Email;
using NonGSTInvoiceEntity = CompanyPlatform.Core.Models.CRM.Company.NonGSTInvoice;
using NonGSTInvoiceItemEntity = CompanyPlatform.Core.Models.CRM.Company.NonGSTInvoiceItem;

namespace CompanyPlatform.CRM.Services.NonGSTInvoice
{
    public class NonGSTInvoiceService : INonGSTInvoiceService
    {
        private readonly IRepositories<NonGSTInvoiceEntity> _invoiceRepository;
        private readonly IRepositories<NonGSTInvoiceItemEntity> _itemRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.Company> _companyRepository;
        private readonly IEmailService _emailService;
        private readonly IOptions<SmtpSettings> _smtpSettings;
        private readonly ILogger<NonGSTInvoiceService> _logger;

        public NonGSTInvoiceService(
            IRepositories<NonGSTInvoiceEntity> invoiceRepository,
            IRepositories<NonGSTInvoiceItemEntity> itemRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.Company> companyRepository,
            IEmailService emailService,
            IOptions<SmtpSettings> smtpSettings,
            ILogger<NonGSTInvoiceService> logger)
        {
            _invoiceRepository = invoiceRepository;
            _itemRepository = itemRepository;
            _companyRepository = companyRepository;
            _emailService = emailService;
            _smtpSettings = smtpSettings;
            _logger = logger;
        }

        public async Task<IEnumerable<NonGSTInvoiceDto>> GetAllNonGSTInvoicesAsync()
        {
            _logger.LogInformation("Fetching all active Non-GST Invoices.");

            var invoices = await _invoiceRepository.FindByCondition(x => !x.IsDeleted);
            var result = new List<NonGSTInvoiceDto>();

            foreach (var inv in invoices)
            {
                var dto = await MapToDtoAsync(inv);
                result.Add(dto);
            }

            return result;
        }

        public async Task<NonGSTInvoiceDto?> GetNonGSTInvoiceByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Non-GST Invoice by ID: {Id}", id);

            var invoice = await _invoiceRepository.GetByIdAsync(id);

            if (invoice == null || invoice.IsDeleted)
            {
                _logger.LogWarning("Non-GST Invoice with ID: {Id} not found or deleted.", id);
                return null;
            }

            return await MapToDtoAsync(invoice);
        }

        public async Task<NonGSTInvoiceDto> CreateNonGSTInvoiceAsync(CreateNonGSTInvoiceDto dto)
        {
            _logger.LogInformation("Creating Non-GST Invoice for Company ID: {CompanyId}", dto.CompanyId);

            var company = await _companyRepository.GetByIdAsync(dto.CompanyId);
            if (company == null || company.IsDeleted)
            {
                _logger.LogWarning("Company ID {CompanyId} is invalid or deleted.", dto.CompanyId);
                throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist or is inactive.");
            }

            decimal calculatedTotal = 0;
            var processedItems = new List<(string? services, string description, decimal quantity, decimal rate, decimal amount)>();

            foreach (var item in dto.Items ?? new List<CreateNonGSTInvoiceItemDto>())
            {
                decimal amount = item.Quantity * item.Rate;
                calculatedTotal += amount;

                processedItems.Add((item.Services, item.Description, item.Quantity, item.Rate, amount));
            }

            decimal totalAmount = dto.TotalAmount > 0 ? dto.TotalAmount : calculatedTotal;

            var invoice = new NonGSTInvoiceEntity
            {
                InvoiceNo = string.IsNullOrWhiteSpace(dto.InvoiceNo) ? $"NGI-{DateTime.Now:yyyyMMddHHmmss}" : dto.InvoiceNo.Trim(),
                InvoiceDate = dto.InvoiceDate,
                CompanyId = dto.CompanyId,
                TotalAmount = totalAmount,
                AmountInWords = dto.AmountInWords,
                Remarks = dto.Remarks,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Invoice" : dto.Status,
                IsActive = true,
                IsDeleted = false,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now
            };

            await _invoiceRepository.Create(invoice);

            foreach (var item in processedItems)
            {
                var itemEntity = new NonGSTInvoiceItemEntity
                {
                    NonGSTInvoiceId = invoice.NonGSTInvoiceId,
                    Services = item.services,
                    Description = item.description,
                    Quantity = item.quantity,
                    Rate = item.rate,
                    Amount = item.amount,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedBy = dto.CreatedBy,
                    CreatedDate = DateTime.Now
                };

                await _itemRepository.Create(itemEntity);
            }

            _logger.LogInformation("Successfully created Non-GST Invoice with ID: {NonGSTInvoiceId}", invoice.NonGSTInvoiceId);

            var createdInvoiceDto = await MapToDtoAsync(invoice);
            createdInvoiceDto.EmailBody = dto.EmailBody;
            createdInvoiceDto.AdminEmailBody = dto.AdminEmailBody;

            return createdInvoiceDto;
        }

        public async Task<bool> UpdateNonGSTInvoiceAsync(int id, UpdateNonGSTInvoiceDto dto)
        {
            _logger.LogInformation("Updating Non-GST Invoice with ID: {Id}", id);

            var invoice = await _invoiceRepository.GetByIdAsync(id);

            if (invoice == null || invoice.IsDeleted)
            {
                _logger.LogWarning("Update failed. Non-GST Invoice with ID: {Id} not found.", id);
                return false;
            }

            var company = await _companyRepository.GetByIdAsync(dto.CompanyId);
            if (company == null || company.IsDeleted)
            {
                _logger.LogWarning("Company ID {CompanyId} is invalid or deleted.", dto.CompanyId);
                throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist or is inactive.");
            }

            if (!string.IsNullOrWhiteSpace(dto.InvoiceNo))
            {
                invoice.InvoiceNo = dto.InvoiceNo.Trim();
            }
            invoice.InvoiceDate = dto.InvoiceDate;
            invoice.CompanyId = dto.CompanyId;
            invoice.AmountInWords = dto.AmountInWords;
            invoice.Remarks = dto.Remarks;
            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                invoice.Status = dto.Status;
            }
            invoice.UpdatedBy = dto.UpdatedBy;
            invoice.UpdatedDate = DateTime.Now;

            var existingItems = (await _itemRepository.FindByCondition(i => i.NonGSTInvoiceId == id && !i.IsDeleted)).ToList();
            var incomingItems = dto.Items ?? new List<NonGSTInvoiceItemDto>();

            decimal calculatedTotal = 0;
            var incomingItemIds = new HashSet<int>();

            foreach (var itemDto in incomingItems)
            {
                decimal amount = itemDto.Quantity * itemDto.Rate;
                calculatedTotal += amount;

                if (itemDto.NonGSTInvoiceItemId > 0)
                {
                    incomingItemIds.Add(itemDto.NonGSTInvoiceItemId);
                    var existingItem = existingItems.FirstOrDefault(x => x.NonGSTInvoiceItemId == itemDto.NonGSTInvoiceItemId);

                    if (existingItem != null)
                    {
                        existingItem.Services = itemDto.Services;
                        existingItem.Description = itemDto.Description;
                        existingItem.Quantity = itemDto.Quantity;
                        existingItem.Rate = itemDto.Rate;
                        existingItem.Amount = amount;
                        existingItem.UpdatedBy = dto.UpdatedBy;
                        existingItem.UpdatedDate = DateTime.Now;

                        await _itemRepository.Update(existingItem);
                    }
                }
                else
                {
                    var newItemEntity = new NonGSTInvoiceItemEntity
                    {
                        NonGSTInvoiceId = id,
                        Services = itemDto.Services,
                        Description = itemDto.Description,
                        Quantity = itemDto.Quantity,
                        Rate = itemDto.Rate,
                        Amount = amount,
                        IsActive = true,
                        IsDeleted = false,
                        CreatedBy = dto.UpdatedBy ?? 0,
                        CreatedDate = DateTime.Now
                    };

                    await _itemRepository.Create(newItemEntity);
                }
            }

            foreach (var existingItem in existingItems)
            {
                if (!incomingItemIds.Contains(existingItem.NonGSTInvoiceItemId))
                {
                    existingItem.IsDeleted = true;
                    existingItem.IsActive = false;
                    existingItem.UpdatedBy = dto.UpdatedBy;
                    existingItem.UpdatedDate = DateTime.Now;

                    await _itemRepository.Update(existingItem);
                }
            }

            invoice.TotalAmount = dto.TotalAmount > 0 ? dto.TotalAmount : calculatedTotal;
            await _invoiceRepository.Update(invoice);

            _logger.LogInformation("Successfully updated Non-GST Invoice with ID: {Id}", id);
            return true;
        }

        public async Task<bool> DeleteNonGSTInvoiceAsync(int id)
        {
            _logger.LogInformation("Soft-deleting Non-GST Invoice with ID: {Id}", id);

            var invoice = await _invoiceRepository.GetByIdAsync(id);

            if (invoice == null || invoice.IsDeleted)
            {
                _logger.LogWarning("Delete failed. Non-GST Invoice with ID: {Id} not found.", id);
                return false;
            }

            invoice.IsDeleted = true;
            invoice.IsActive = false;
            invoice.UpdatedDate = DateTime.Now;

            await _invoiceRepository.Update(invoice);

            var childItems = await _itemRepository.FindByCondition(i => i.NonGSTInvoiceId == id && !i.IsDeleted);
            foreach (var item in childItems)
            {
                item.IsDeleted = true;
                item.IsActive = false;
                item.UpdatedDate = DateTime.Now;
                await _itemRepository.Update(item);
            }

            _logger.LogInformation("Successfully soft-deleted Non-GST Invoice with ID: {Id}", id);
            return true;
        }

        private async Task<NonGSTInvoiceDto> MapToDtoAsync(NonGSTInvoiceEntity p)
        {
            string? companyName = null;

            var company = await _companyRepository.GetByIdAsync(p.CompanyId);
            if (company != null && !company.IsDeleted)
            {
                companyName = company.CompanyName;
            }

            var items = await _itemRepository.FindByCondition(i => i.NonGSTInvoiceId == p.NonGSTInvoiceId && !i.IsDeleted);

            var itemDtos = items
                .Select(i => new NonGSTInvoiceItemDto
                {
                    NonGSTInvoiceItemId = i.NonGSTInvoiceItemId,
                    NonGSTInvoiceId = i.NonGSTInvoiceId,
                    Services = i.Services,
                    Description = i.Description,
                    Quantity = i.Quantity,
                    Rate = i.Rate,
                    Amount = i.Amount
                })
                .ToList();

            return new NonGSTInvoiceDto
            {
                NonGSTInvoiceId = p.NonGSTInvoiceId,
                InvoiceNo = p.InvoiceNo,
                InvoiceDate = p.InvoiceDate,
                CompanyId = p.CompanyId,
                CompanyName = companyName,
                Address = null,
                State = null,
                Items = itemDtos,
                TotalAmount = p.TotalAmount,
                AmountInWords = p.AmountInWords,
                Remarks = p.Remarks,
                Status = p.Status,
                CreatedBy = p.CreatedBy,
                CreatedDate = p.CreatedDate,
                UpdatedBy = p.UpdatedBy,
                UpdatedDate = p.UpdatedDate,
                IsActive = p.IsActive,
                IsDeleted = p.IsDeleted
            };
        }

        private async Task<string> ResolveClientEmailAsync(int companyId)
        {
            await Task.CompletedTask;
            return string.Empty;
        }

        private async Task SendInvoiceEmailsAsync(NonGSTInvoiceDto invoice, int userId)
        {
            string adminEmail = _smtpSettings.Value?.SenderEmail?.Trim() ?? "info@mindaxiss.com";
            string clientEmail = await ResolveClientEmailAsync(invoice.CompanyId);

            string subjectClient = $"Invoice {invoice.InvoiceNo} from MindAxis Innovation Pvt Ltd";
            string subjectAdmin  = $"New Non-GST Invoice {invoice.InvoiceNo} created for {invoice.CompanyName}";

            // 100% Body provided directly by Frontend (Clean backend transport)
            string bodyClient = !string.IsNullOrWhiteSpace(invoice.EmailBody)
                ? invoice.EmailBody
                : $"<p>Dear <strong>{invoice.CompanyName}</strong>,</p><p>Please find attached your Invoice <strong>{invoice.InvoiceNo}</strong> for amount &#8377;{invoice.TotalAmount:N2}.</p>";

            string bodyAdmin = !string.IsNullOrWhiteSpace(invoice.AdminEmailBody)
                ? invoice.AdminEmailBody
                : bodyClient;

            if (!string.IsNullOrWhiteSpace(clientEmail))
            {
                try
                {
                    await _emailService.SendEmailAsync(clientEmail, subjectClient, bodyClient);
                    _logger.LogInformation("Non-GST Invoice email sent successfully to Client: {ClientEmail}", clientEmail);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send Non-GST Invoice email to Client: {ClientEmail}", clientEmail);
                }
            }

            if (!string.IsNullOrWhiteSpace(adminEmail))
            {
                try
                {
                    await _emailService.SendEmailAsync(adminEmail, subjectAdmin, bodyAdmin);
                    _logger.LogInformation("Non-GST Invoice notification email sent successfully to Admin: {AdminEmail}", adminEmail);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send Non-GST Invoice notification email to Admin: {AdminEmail}", adminEmail);
                }
            }
        }
    }
}