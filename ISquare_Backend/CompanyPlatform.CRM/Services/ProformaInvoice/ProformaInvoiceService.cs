using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Services.Email;
using CompanyPlatform.CRM.DTO.ProformaInvoice;
using PayrollManagementAPI.Services.Email;
using ProformaInvoiceEntity = CompanyPlatform.Core.Models.CRM.Company.ProformaInvoice;
using ProformaInvoiceItemEntity = CompanyPlatform.Core.Models.CRM.Company.ProformaInvoiceItem;

namespace CompanyPlatform.CRM.Services.ProformaInvoice
{
    public class ProformaInvoiceService : IProformaInvoiceService
    {
        private readonly IRepositories<ProformaInvoiceEntity> _proformaRepository;
        private readonly IRepositories<ProformaInvoiceItemEntity> _itemRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.Company> _companyRepository;
        private readonly IEmailService _emailService;
        private readonly IOptions<SmtpSettings> _smtpSettings;
        private readonly ILogger<ProformaInvoiceService> _logger;
        private static readonly System.Threading.SemaphoreSlim _proformaLock = new System.Threading.SemaphoreSlim(1, 1);

        public ProformaInvoiceService(
            IRepositories<ProformaInvoiceEntity> proformaRepository,
            IRepositories<ProformaInvoiceItemEntity> itemRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.Company> companyRepository,
            IEmailService emailService,
            IOptions<SmtpSettings> smtpSettings,
            ILogger<ProformaInvoiceService> logger)
        {
            _proformaRepository = proformaRepository;
            _itemRepository = itemRepository;
            _companyRepository = companyRepository;
            _emailService = emailService;
            _smtpSettings = smtpSettings;
            _logger = logger;
        }

        public async Task<string> GetNextProformaNumberAsync()
        {
            await _proformaLock.WaitAsync();
            try
            {
                string prefix = "PRO/";
                var proformas = await _proformaRepository.GetAll();
                int maxNumber = 0;
                var existingSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                foreach (var p in proformas)
                {
                    if (string.IsNullOrWhiteSpace(p.ProformaNo))
                        continue;

                    var code = p.ProformaNo.Trim();
                    existingSet.Add(code);

                    if (code.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                    {
                        var numPart = code.Substring(prefix.Length);
                        if (int.TryParse(numPart, out int numVal))
                        {
                            if (numVal > maxNumber)
                            {
                                maxNumber = numVal;
                            }
                        }
                    }
                }

                int nextNumber = maxNumber + 1;
                string candidate = $"{prefix}{nextNumber}";

                while (existingSet.Contains(candidate))
                {
                    nextNumber++;
                    candidate = $"{prefix}{nextNumber}";
                }

                return candidate;
            }
            finally
            {
                _proformaLock.Release();
            }
        }

        public async Task<IEnumerable<ProformaInvoiceDto>> GetAllProformaInvoicesAsync()
        {
            _logger.LogInformation("Fetching all active proforma invoices.");
            var proformas = await _proformaRepository.GetAll();
            var activeProformas = proformas.Where(p => !p.IsDeleted).ToList();

            var result = new List<ProformaInvoiceDto>();
            foreach (var proforma in activeProformas)
            {
                var dto = await MapToDtoAsync(proforma);
                result.Add(dto);
            }

            return result;
        }

        public async Task<ProformaInvoiceDto?> GetProformaInvoiceByIdAsync(int id)
        {
            _logger.LogInformation("Fetching proforma invoice by ID: {ProformaId}", id);
            var proforma = await _proformaRepository.GetByIdAsync(id);

            if (proforma == null || proforma.IsDeleted)
            {
                _logger.LogWarning("Proforma invoice with ID: {ProformaId} not found or is deleted.", id);
                return null;
            }

            return await MapToDtoAsync(proforma);
        }

        public async Task<ProformaInvoiceDto> CreateProformaInvoiceAsync(CreateProformaInvoiceDto dto)
        {
            string proformaNo = dto.ProformaNo?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(proformaNo))
            {
                proformaNo = await GetNextProformaNumberAsync();
            }

            _logger.LogInformation("Creating proforma invoice with No: {ProformaNo} for CompanyId: {CompanyId}", proformaNo, dto.CompanyId);

            var company = await _companyRepository.GetByIdAsync(dto.CompanyId);
            if (company == null || company.IsDeleted || !company.IsActive)
            {
                _logger.LogWarning("Create failed. Company with ID {CompanyId} is not found, deleted, or inactive.", dto.CompanyId);
                throw new InvalidOperationException($"Company with ID {dto.CompanyId} is invalid or inactive.");
            }

            var proformaEntity = new ProformaInvoiceEntity
            {
                ProformaNo = proformaNo,
                ProformaDate = dto.ProformaDate,
                CompanyId = dto.CompanyId,
                ReverseCharge = dto.ReverseCharge,
                TotalAmountBeforeTax = dto.TotalAmountBeforeTax,
                TotalCGSTAmount = dto.TotalCGSTAmount,
                TotalSGSTAmount = dto.TotalSGSTAmount,
                TotalTaxAmount = dto.TotalTaxAmount,
                TotalAmountAfterTax = dto.TotalAmountAfterTax,
                GSTOnReverseCharge = dto.GSTOnReverseCharge,
                AmountInWords = dto.AmountInWords,
                Remarks = dto.Remarks,
                TermsAndConditions = dto.TermsAndConditions,
                IsActive = true,
                IsDeleted = false,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now
            };

            await _proformaRepository.Create(proformaEntity);

            if (dto.Items != null && dto.Items.Any())
            {
                var itemEntities = dto.Items.Select(item => new ProformaInvoiceItemEntity
                {
                    ProformaId = proformaEntity.ProformaId,
                    SrNo = item.SrNo,
                    Services = item.Services,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    Rate = item.Rate,
                    Amount = item.Amount,
                    TaxableValue = item.TaxableValue,
                    CGSTRate = item.CGSTRate,
                    CGSTAmount = item.CGSTAmount,
                    SGSTRate = item.SGSTRate,
                    SGSTAmount = item.SGSTAmount,
                    TotalAmount = item.TotalAmount,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedBy = dto.CreatedBy,
                    CreatedDate = DateTime.Now
                }).ToList();

                await _itemRepository.AddRangeAsync(itemEntities);
                await _itemRepository.SaveChangesAsync();
            }

            _logger.LogInformation("Successfully created proforma invoice with ID: {ProformaId}", proformaEntity.ProformaId);

            var createdProformaDto = await GetProformaInvoiceByIdAsync(proformaEntity.ProformaId);
            if (createdProformaDto != null)
            {
                createdProformaDto.EmailBody = dto.EmailBody;
                createdProformaDto.AdminEmailBody = dto.AdminEmailBody;
            }

            return createdProformaDto!;
        }

        public async Task<bool> UpdateProformaInvoiceAsync(int id, UpdateProformaInvoiceDto dto)
        {
            _logger.LogInformation("Attempting to update proforma invoice with ID: {ProformaId}", id);
            var itemToUpdate = await _proformaRepository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsDeleted)
            {
                _logger.LogWarning("Update failed. Proforma invoice with ID: {ProformaId} not found or is deleted.", id);
                return false;
            }

            var company = await _companyRepository.GetByIdAsync(dto.CompanyId);
            if (company == null || company.IsDeleted || !company.IsActive)
            {
                _logger.LogWarning("Update failed. Company with ID {CompanyId} is not found, deleted, or inactive.", dto.CompanyId);
                return false;
            }

            itemToUpdate.ProformaNo = dto.ProformaNo;
            itemToUpdate.ProformaDate = dto.ProformaDate;
            itemToUpdate.CompanyId = dto.CompanyId;
            itemToUpdate.ReverseCharge = dto.ReverseCharge;
            itemToUpdate.TotalAmountBeforeTax = dto.TotalAmountBeforeTax;
            itemToUpdate.TotalCGSTAmount = dto.TotalCGSTAmount;
            itemToUpdate.TotalSGSTAmount = dto.TotalSGSTAmount;
            itemToUpdate.TotalTaxAmount = dto.TotalTaxAmount;
            itemToUpdate.TotalAmountAfterTax = dto.TotalAmountAfterTax;
            itemToUpdate.GSTOnReverseCharge = dto.GSTOnReverseCharge;
            itemToUpdate.AmountInWords = dto.AmountInWords;
            itemToUpdate.Remarks = dto.Remarks;
            itemToUpdate.TermsAndConditions = dto.TermsAndConditions;
            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                itemToUpdate.Status = dto.Status;
            }
            itemToUpdate.UpdatedBy = dto.UpdatedBy;
            itemToUpdate.UpdatedDate = DateTime.Now;

            await _proformaRepository.Update(itemToUpdate);

            var existingItems = (await _itemRepository.FindByCondition(i => i.ProformaId == id && !i.IsDeleted)).ToList();
            var incomingItemIds = dto.Items?
                .Where(i => i.ProformaItemId > 0)
                .Select(i => i.ProformaItemId)
                .ToHashSet() ?? new HashSet<int>();

            foreach (var existingItem in existingItems)
            {
                if (!incomingItemIds.Contains(existingItem.ProformaItemId))
                {
                    existingItem.IsDeleted = true;
                    existingItem.UpdatedBy = dto.UpdatedBy;
                    existingItem.UpdatedDate = DateTime.Now;
                    await _itemRepository.Update(existingItem);
                }
            }

            if (dto.Items != null)
            {
                foreach (var itemDto in dto.Items)
                {
                    if (itemDto.ProformaItemId > 0)
                    {
                        var item = existingItems.FirstOrDefault(i => i.ProformaItemId == itemDto.ProformaItemId);
                        if (item != null)
                        {
                            item.SrNo = itemDto.SrNo;
                            item.Services = itemDto.Services;
                            item.Description = itemDto.Description;
                            item.Quantity = itemDto.Quantity;
                            item.Rate = itemDto.Rate;
                            item.Amount = itemDto.Amount;
                            item.TaxableValue = itemDto.TaxableValue;
                            item.CGSTRate = itemDto.CGSTRate;
                            item.CGSTAmount = itemDto.CGSTAmount;
                            item.SGSTRate = itemDto.SGSTRate;
                            item.SGSTAmount = itemDto.SGSTAmount;
                            item.TotalAmount = itemDto.TotalAmount;
                            item.IsActive = itemDto.IsActive;
                            item.UpdatedBy = dto.UpdatedBy;
                            item.UpdatedDate = DateTime.Now;

                            await _itemRepository.Update(item);
                        }
                    }
                    else
                    {
                        var newItem = new ProformaInvoiceItemEntity
                        {
                            ProformaId = id,
                            SrNo = itemDto.SrNo,
                            Services = itemDto.Services,
                            Description = itemDto.Description,
                            Quantity = itemDto.Quantity,
                            Rate = itemDto.Rate,
                            Amount = itemDto.Amount,
                            TaxableValue = itemDto.TaxableValue,
                            CGSTRate = itemDto.CGSTRate,
                            CGSTAmount = itemDto.CGSTAmount,
                            SGSTRate = itemDto.SGSTRate,
                            SGSTAmount = itemDto.SGSTAmount,
                            TotalAmount = itemDto.TotalAmount,
                            IsActive = true,
                            IsDeleted = false,
                            CreatedBy = dto.UpdatedBy ?? 0,
                            CreatedDate = DateTime.Now
                        };

                        await _itemRepository.Create(newItem);
                    }
                }
            }

            _logger.LogInformation("Successfully updated proforma invoice with ID: {ProformaId}", id);
            return true;
        }

        public async Task<ProformaInvoiceDto?> UpdatePublicResponseAsync(string proformaNo, string status)
        {
            var normalizedProformaNo = proformaNo.Trim();
            var proforma = (await _proformaRepository.FindByCondition(p =>
                !p.IsDeleted && p.ProformaNo.ToLower() == normalizedProformaNo.ToLower())).FirstOrDefault();

            if (proforma == null)
            {
                _logger.LogWarning("Public response failed. Proforma invoice {ProformaNo} was not found.", normalizedProformaNo);
                return null;
            }

            proforma.Status = status;
            proforma.UpdatedDate = DateTime.Now;
            await _proformaRepository.Update(proforma);

            _logger.LogInformation("Recorded public {Status} response for Proforma invoice {ProformaNo}.", status, proforma.ProformaNo);
            return await MapToDtoAsync(proforma);
        }

        public async Task<bool> DeleteProformaInvoiceAsync(int id)
        {
            _logger.LogInformation("Attempting to soft-delete proforma invoice with ID: {ProformaId}", id);
            var itemToDelete = await _proformaRepository.GetByIdAsync(id);

            if (itemToDelete == null || itemToDelete.IsDeleted)
            {
                _logger.LogWarning("Delete failed. Proforma invoice with ID: {ProformaId} not found or already deleted.", id);
                return false;
            }

            itemToDelete.IsDeleted = true;
            itemToDelete.UpdatedDate = DateTime.Now;
            await _proformaRepository.Update(itemToDelete);

            var items = await _itemRepository.FindByCondition(i => i.ProformaId == id && !i.IsDeleted);
            foreach (var item in items)
            {
                item.IsDeleted = true;
                item.UpdatedDate = DateTime.Now;
                await _itemRepository.Update(item);
            }

            _logger.LogInformation("Successfully soft-deleted proforma invoice with ID: {ProformaId}", id);
            return true;
        }

        private async Task<ProformaInvoiceDto> MapToDtoAsync(ProformaInvoiceEntity proforma)
        {
            var company = await _companyRepository.GetByIdAsync(proforma.CompanyId);
            string companyName = company?.CompanyName ?? string.Empty;

            var items = await _itemRepository.FindByCondition(i => i.ProformaId == proforma.ProformaId && !i.IsDeleted);
            var itemDtos = items
                .OrderBy(i => i.SrNo)
                .Select(i => new ProformaInvoiceItemDto
                {
                    ProformaItemId = i.ProformaItemId,
                    ProformaId = i.ProformaId,
                    SrNo = i.SrNo,
                    Services = i.Services,
                    Description = i.Description,
                    Quantity = i.Quantity,
                    Rate = i.Rate,
                    Amount = i.Amount,
                    TaxableValue = i.TaxableValue,
                    CGSTRate = i.CGSTRate,
                    CGSTAmount = i.CGSTAmount,
                    SGSTRate = i.SGSTRate,
                    SGSTAmount = i.SGSTAmount,
                    TotalAmount = i.TotalAmount,
                    IsActive = i.IsActive,
                    IsDeleted = i.IsDeleted
                }).ToList();

            return new ProformaInvoiceDto
            {
                ProformaId = proforma.ProformaId,
                ProformaNo = proforma.ProformaNo,
                ProformaDate = proforma.ProformaDate,
                CompanyId = proforma.CompanyId,
                CompanyName = companyName,
                Address = string.Empty,
                GSTIN = string.Empty,
                State = string.Empty,
                ReverseCharge = proforma.ReverseCharge,
                Items = itemDtos,
                TotalAmountBeforeTax = proforma.TotalAmountBeforeTax,
                TotalCGSTAmount = proforma.TotalCGSTAmount,
                TotalSGSTAmount = proforma.TotalSGSTAmount,
                TotalTaxAmount = proforma.TotalTaxAmount,
                TotalAmountAfterTax = proforma.TotalAmountAfterTax,
                GSTOnReverseCharge = proforma.GSTOnReverseCharge,
                AmountInWords = proforma.AmountInWords,
                Remarks = proforma.Remarks,
                TermsAndConditions = proforma.TermsAndConditions,
                Status = proforma.Status,
                IsActive = proforma.IsActive,
                IsDeleted = proforma.IsDeleted,
                CreatedBy = proforma.CreatedBy,
                CreatedDate = proforma.CreatedDate,
                UpdatedBy = proforma.UpdatedBy,
                UpdatedDate = proforma.UpdatedDate
            };
        }

        private async Task<string> ResolveClientEmailAsync(int companyId)
        {
            await Task.CompletedTask;
            return string.Empty;
        }

        private async Task SendProformaEmailsAsync(ProformaInvoiceDto proforma, int userId)
        {
            string adminEmail = _smtpSettings.Value?.SenderEmail?.Trim() ?? "info@mindaxiss.com";
            string clientEmail = await ResolveClientEmailAsync(proforma.CompanyId);

            string subjectClient = $"Proforma Invoice {proforma.ProformaNo} from MindAxis Innovation Pvt Ltd";
            string subjectAdmin  = $"New Proforma {proforma.ProformaNo} created for {proforma.CompanyName}";

            string bodyClient = !string.IsNullOrWhiteSpace(proforma.EmailBody) ? proforma.EmailBody : string.Empty;
            string bodyAdmin  = !string.IsNullOrWhiteSpace(proforma.AdminEmailBody) ? proforma.AdminEmailBody : (!string.IsNullOrWhiteSpace(proforma.EmailBody) ? proforma.EmailBody : string.Empty);

            if (!string.IsNullOrWhiteSpace(clientEmail))
            {
                try
                {
                    await _emailService.SendEmailAsync(clientEmail, subjectClient, bodyClient);
                    _logger.LogInformation("Proforma email sent successfully to Client: {ClientEmail}", clientEmail);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send Proforma email to Client: {ClientEmail}", clientEmail);
                }
            }

            if (!string.IsNullOrWhiteSpace(adminEmail))
            {
                try
                {
                    await _emailService.SendEmailAsync(adminEmail, subjectAdmin, bodyAdmin);
                    _logger.LogInformation("Proforma notification email sent successfully to Admin: {AdminEmail}", adminEmail);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send Proforma notification email to Admin: {AdminEmail}", adminEmail);
                }
            }
        }
    }
}
