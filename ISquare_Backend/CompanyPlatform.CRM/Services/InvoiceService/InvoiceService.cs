using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.Company;
using InvoiceItemEntity = CompanyPlatform.Core.Models.CRM.Company.InvoiceItem;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Services.Email;
using CompanyPlatform.CRM.DTO.Invoice;
using PayrollManagementAPI.Services.Email;

namespace CompanyPlatform.CRM.Services.InvoiceService
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IRepositories<Invoice> _repository;
        private readonly IRepositories<InvoiceItemEntity> _itemRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.Company> _companyRepository;
        private readonly IEmailService _emailService;
        private readonly IOptions<SmtpSettings> _smtpSettings;
        private readonly ILogger<InvoiceService> _logger;
        private static readonly SemaphoreSlim _invoiceLock = new SemaphoreSlim(1, 1);

        public InvoiceService(
            IRepositories<Invoice> repository,
            IRepositories<InvoiceItemEntity> itemRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.Company> companyRepository,
            IEmailService emailService,
            IOptions<SmtpSettings> smtpSettings,
            ILogger<InvoiceService> logger)
        {
            _repository = repository;
            _itemRepository = itemRepository;
            _companyRepository = companyRepository;
            _emailService = emailService;
            _smtpSettings = smtpSettings;
            _logger = logger;
        }

        public async Task<string> GetNextInvoiceNumberAsync(string docType = "Invoice")
        {
            await _invoiceLock.WaitAsync();
            try
            {
                bool isProforma = string.Equals(docType, "Proforma", StringComparison.OrdinalIgnoreCase) ||
                                  string.Equals(docType, "Proforma Number", StringComparison.OrdinalIgnoreCase);

                string prefix = isProforma ? "PRO/" : "MAIPL/";
                var invoices = await _repository.GetAll();
                int maxNumber = 0;
                var existingSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                foreach (var inv in invoices)
                {
                    if (string.IsNullOrWhiteSpace(inv.InvoiceNumber))
                        continue;

                    var code = inv.InvoiceNumber.Trim();
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
                _invoiceLock.Release();
            }
        }

        public async Task<IEnumerable<InvoiceDto>> GetAllInvoicesAsync()
        {
            _logger.LogInformation("Fetching all invoices.");

            var invoices = await _repository.GetAll();

            return invoices
                .Where(x => x.IsDeleted == false)
                .Select(x => new InvoiceDto
                {
                    InvoiceId = x.InvoiceId,
                    CompanyId = x.CompanyId,
                    InvoiceNumber = x.InvoiceNumber,
                    InvoiceDate = x.InvoiceDate,
                    ClientTypeId = x.ClientTypeId,
                    GSTNumber = x.GSTNumber,
                    SubTotal = x.SubTotal,
                    GSTAmount = x.GSTAmount,
                    TotalAmount = x.TotalAmount,
                    InvoiceStatus = x.InvoiceStatus,
                    CreatedBy = x.CreatedBy,
                    CreatedDate = x.CreatedDate,
                    UpdatedBy = x.UpdatedBy,
                    UpdatedDate = x.UpdatedDate,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<InvoiceDto?> GetInvoiceByIdAsync(int id)
        {
            _logger.LogInformation("Fetching invoice by ID: {InvoiceId}", id);

            var invoice = await _repository.GetByIdAsync(id);

            if (invoice == null || invoice.IsDeleted)
            {
                _logger.LogWarning("Invoice with ID: {InvoiceId} not found.", id);
                return null;
            }

            return new InvoiceDto
            {
                InvoiceId = invoice.InvoiceId,
                CompanyId = invoice.CompanyId,
                InvoiceNumber = invoice.InvoiceNumber,
                InvoiceDate = invoice.InvoiceDate,
                ClientTypeId = invoice.ClientTypeId,
                GSTNumber = invoice.GSTNumber,
                SubTotal = invoice.SubTotal,
                GSTAmount = invoice.GSTAmount,
                TotalAmount = invoice.TotalAmount,
                InvoiceStatus = invoice.InvoiceStatus,
                CreatedBy = invoice.CreatedBy,
                CreatedDate = invoice.CreatedDate,
                UpdatedBy = invoice.UpdatedBy,
                UpdatedDate = invoice.UpdatedDate,
                IsActive = invoice.IsActive,
                IsDeleted = invoice.IsDeleted
            };
        }

        public async Task<InvoiceDto> CreateInvoiceAsync(InvoiceDto dto)
        {
            _logger.LogInformation(
                "Creating new invoice with number: {InvoiceNumber}",
                dto.InvoiceNumber);

            if (string.IsNullOrWhiteSpace(dto.InvoiceNumber))
            {
                dto.InvoiceNumber = await GetNextInvoiceNumberAsync("Invoice");
            }
            else
            {
                var invoices = await _repository.GetAll();
                bool exists = invoices.Any(x => !x.IsDeleted && string.Equals(x.InvoiceNumber?.Trim(), dto.InvoiceNumber.Trim(), StringComparison.OrdinalIgnoreCase));
                if (exists)
                {
                    string docType = dto.InvoiceNumber.StartsWith("PRO/", StringComparison.OrdinalIgnoreCase) ? "Proforma" : "Invoice";
                    dto.InvoiceNumber = await GetNextInvoiceNumberAsync(docType);
                }
            }

            var invoice = new Invoice
            {
                CompanyId = dto.CompanyId,
                InvoiceNumber = dto.InvoiceNumber,
                InvoiceDate = dto.InvoiceDate,
                ClientTypeId = dto.ClientTypeId,
                GSTNumber = dto.GSTNumber,
                SubTotal = dto.SubTotal,
                GSTAmount = dto.GSTAmount,
                TotalAmount = dto.TotalAmount,
                InvoiceStatus = dto.InvoiceStatus,

                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,

                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(invoice);

            dto.InvoiceId = invoice.InvoiceId;
            dto.InvoiceNumber = invoice.InvoiceNumber;
            dto.IsActive = invoice.IsActive;
            dto.IsDeleted = invoice.IsDeleted;

            _logger.LogInformation(
                "Successfully created invoice with ID: {InvoiceId} and Number: {InvoiceNumber}",
                invoice.InvoiceId,
                invoice.InvoiceNumber);

            return dto;
        }

        public async Task<bool> UpdateInvoiceAsync(InvoiceDto dto)
        {
            _logger.LogInformation("Attempting to update invoice with ID: {InvoiceId}", dto.InvoiceId);

            var invoice = await _repository.GetByIdAsync(dto.InvoiceId);

            if (invoice == null || invoice.IsDeleted)
            {
                _logger.LogWarning("Update failed. Invoice with ID: {InvoiceId} not found.", dto.InvoiceId);
                return false;
            }

            invoice.CompanyId = dto.CompanyId;
            if (!string.IsNullOrWhiteSpace(dto.InvoiceNumber))
            {
                invoice.InvoiceNumber = dto.InvoiceNumber;
            }
            invoice.InvoiceDate = dto.InvoiceDate;
            invoice.ClientTypeId = dto.ClientTypeId;
            invoice.GSTNumber = dto.GSTNumber;
            invoice.SubTotal = dto.SubTotal;
            invoice.GSTAmount = dto.GSTAmount;
            invoice.TotalAmount = dto.TotalAmount;
            invoice.InvoiceStatus = dto.InvoiceStatus;

            invoice.UpdatedBy = dto.UpdatedBy;
            invoice.UpdatedDate = DateTime.Now;

            invoice.IsActive = dto.IsActive;

            await _repository.Update(invoice);

            _logger.LogInformation("Successfully updated invoice with ID: {InvoiceId}", dto.InvoiceId);
            return true;
        }

        public async Task<bool> DeleteInvoiceAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate invoice with ID: {InvoiceId}", id);

            var invoice = await _repository.GetByIdAsync(id);

            if (invoice == null)
            {
                _logger.LogWarning("Delete failed. Invoice with ID: {InvoiceId} not found.", id);
                return false;
            }

            invoice.IsDeleted = true;
            invoice.IsActive = false;

            await _repository.Update(invoice);

            _logger.LogInformation("Successfully deleted invoice with ID: {InvoiceId}", id);
            return true;
        }

        private async Task<string> ResolveClientEmailAsync(int companyId)
        {
            await Task.CompletedTask;
            return string.Empty;
        }

        private async Task SendInvoiceEmailsAsync(InvoiceDto invoice, int userId)
        {
            string adminEmail = _smtpSettings.Value?.SenderEmail?.Trim() ?? "info@mindaxiss.com";
            string clientEmail = await ResolveClientEmailAsync(invoice.CompanyId);

            var comp = await _companyRepository.GetByIdAsync(invoice.CompanyId);
            string companyName = comp?.CompanyName ?? $"Company #{invoice.CompanyId}";

            string subjectClient = $"Tax Invoice {invoice.InvoiceNumber} from MindAxis Innovation Pvt Ltd";
            string subjectAdmin  = $"New Tax Invoice {invoice.InvoiceNumber} created for {companyName}";

            // 100% Body provided directly by Frontend (Clean backend transport)
            string bodyClient = !string.IsNullOrWhiteSpace(invoice.EmailBody)
                ? invoice.EmailBody
                : $"<p>Dear <strong>{companyName}</strong>,</p><p>Please find attached your Tax Invoice <strong>{invoice.InvoiceNumber}</strong> for amount &#8377;{invoice.TotalAmount:N2}.</p>";

            string bodyAdmin = !string.IsNullOrWhiteSpace(invoice.AdminEmailBody)
                ? invoice.AdminEmailBody
                : bodyClient;

            if (!string.IsNullOrWhiteSpace(clientEmail))
            {
                try
                {
                    await _emailService.SendEmailAsync(clientEmail, subjectClient, bodyClient);
                    _logger.LogInformation("Tax Invoice email sent successfully to Client: {ClientEmail}", clientEmail);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send Tax Invoice email to Client: {ClientEmail}", clientEmail);
                }
            }

            if (!string.IsNullOrWhiteSpace(adminEmail))
            {
                try
                {
                    await _emailService.SendEmailAsync(adminEmail, subjectAdmin, bodyAdmin);
                    _logger.LogInformation("Tax Invoice notification email sent successfully to Admin: {AdminEmail}", adminEmail);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send Tax Invoice notification email to Admin: {AdminEmail}", adminEmail);
                }
            }
        }
    }
}