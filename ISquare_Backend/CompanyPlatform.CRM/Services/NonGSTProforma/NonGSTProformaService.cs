using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Services.Email;
using CompanyPlatform.CRM.DTO.NonGSTProforma;
using PayrollManagementAPI.Services.Email;
using NonGSTProformaEntity = CompanyPlatform.Core.Models.CRM.Company.NonGSTProforma;
using NonGSTProformaItemEntity = CompanyPlatform.Core.Models.CRM.Company.NonGSTProformaItem;

namespace CompanyPlatform.CRM.Services.NonGSTProforma
{
    public class NonGSTProformaService : INonGSTProformaService
    {
        private readonly IRepositories<NonGSTProformaEntity> _proformaRepository;
        private readonly IRepositories<NonGSTProformaItemEntity> _itemRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.Company> _companyRepository;
        private readonly IEmailService _emailService;
        private readonly IOptions<SmtpSettings> _smtpSettings;
        private readonly ILogger<NonGSTProformaService> _logger;

        public NonGSTProformaService(
            IRepositories<NonGSTProformaEntity> proformaRepository,
            IRepositories<NonGSTProformaItemEntity> itemRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.Company> companyRepository,
            IEmailService emailService,
            IOptions<SmtpSettings> smtpSettings,
            ILogger<NonGSTProformaService> logger)
        {
            _proformaRepository = proformaRepository;
            _itemRepository = itemRepository;
            _companyRepository = companyRepository;
            _emailService = emailService;
            _smtpSettings = smtpSettings;
            _logger = logger;
        }

        public async Task<IEnumerable<NonGSTProformaDto>> GetAllNonGSTProformasAsync()
        {
            _logger.LogInformation("Fetching all active Non-GST Proformas.");

            var proformas = await _proformaRepository.FindByCondition(x => !x.IsDeleted);
            var result = new List<NonGSTProformaDto>();

            foreach (var p in proformas)
            {
                var dto = await MapToDtoAsync(p);
                result.Add(dto);
            }

            return result;
        }

        public async Task<NonGSTProformaDto?> GetNonGSTProformaByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Non-GST Proforma by ID: {Id}", id);

            var proforma = await _proformaRepository.GetByIdAsync(id);

            if (proforma == null || proforma.IsDeleted)
            {
                _logger.LogWarning("Non-GST Proforma with ID: {Id} not found or deleted.", id);
                return null;
            }

            return await MapToDtoAsync(proforma);
        }

        public async Task<NonGSTProformaDto> CreateNonGSTProformaAsync(CreateNonGSTProformaDto dto)
        {
            _logger.LogInformation("Creating Non-GST Proforma for Company ID: {CompanyId}", dto.CompanyId);

            var company = await _companyRepository.GetByIdAsync(dto.CompanyId);
            if (company == null || company.IsDeleted)
            {
                _logger.LogWarning("Company ID {CompanyId} is invalid or deleted.", dto.CompanyId);
                throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist or is inactive.");
            }

            decimal calculatedTotal = 0;
            var processedItems = new List<NonGSTProformaItemDto>();

            int srNoCounter = 1;
            foreach (var item in dto.Items ?? new List<NonGSTProformaItemDto>())
            {
                decimal amount = item.Quantity * item.Rate;
                decimal itemTotal = amount;
                calculatedTotal += itemTotal;

                item.SrNo = item.SrNo > 0 ? item.SrNo : srNoCounter++;
                item.Amount = amount;
                item.TotalAmount = itemTotal;
                processedItems.Add(item);
            }

            decimal totalAmount = dto.TotalAmount > 0 ? dto.TotalAmount : calculatedTotal;

            var proforma = new NonGSTProformaEntity
            {
                ProformaNo = string.IsNullOrWhiteSpace(dto.ProformaNo) ? $"NGP-{DateTime.Now:yyyyMMddHHmmss}" : dto.ProformaNo.Trim(),
                ProformaDate = dto.ProformaDate,
                CompanyId = dto.CompanyId,
                TotalAmount = totalAmount,
                AmountInWords = dto.AmountInWords,
                Remarks = dto.Remarks,
                TermsAndConditions = dto.TermsAndConditions,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Pending" : dto.Status,
                IsActive = true,
                IsDeleted = false,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now
            };

            await _proformaRepository.Create(proforma);

            foreach (var itemDto in processedItems)
            {
                var itemEntity = new NonGSTProformaItemEntity
                {
                    NonGSTProformaId = proforma.NonGSTProformaId,
                    SrNo = itemDto.SrNo,
                    Services = itemDto.Services,
                    Description = itemDto.Description,
                    Quantity = itemDto.Quantity,
                    Rate = itemDto.Rate,
                    Amount = itemDto.Amount,
                    TotalAmount = itemDto.TotalAmount,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedBy = dto.CreatedBy,
                    CreatedDate = DateTime.Now
                };

                await _itemRepository.Create(itemEntity);
            }

            _logger.LogInformation("Successfully created Non-GST Proforma with ID: {NonGSTProformaId}", proforma.NonGSTProformaId);

            var createdProformaDto = await MapToDtoAsync(proforma);
            createdProformaDto.EmailBody = dto.EmailBody;
            createdProformaDto.AdminEmailBody = dto.AdminEmailBody;

            return createdProformaDto;
        }

        public async Task<bool> UpdateNonGSTProformaAsync(int id, UpdateNonGSTProformaDto dto)
        {
            _logger.LogInformation("Updating Non-GST Proforma with ID: {Id}", id);

            var proforma = await _proformaRepository.GetByIdAsync(id);

            if (proforma == null || proforma.IsDeleted)
            {
                _logger.LogWarning("Update failed. Non-GST Proforma with ID: {Id} not found.", id);
                return false;
            }

            var company = await _companyRepository.GetByIdAsync(dto.CompanyId);
            if (company == null || company.IsDeleted)
            {
                _logger.LogWarning("Company ID {CompanyId} is invalid or deleted.", dto.CompanyId);
                throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist or is inactive.");
            }

            proforma.ProformaNo = dto.ProformaNo;
            proforma.ProformaDate = dto.ProformaDate;
            proforma.CompanyId = dto.CompanyId;
            proforma.TotalAmount = dto.TotalAmount;
            proforma.AmountInWords = dto.AmountInWords;
            proforma.Remarks = dto.Remarks;
            proforma.TermsAndConditions = dto.TermsAndConditions;
            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                proforma.Status = dto.Status;
            }
            proforma.UpdatedBy = dto.UpdatedBy;
            proforma.UpdatedDate = DateTime.Now;

            var existingItems = (await _itemRepository.FindByCondition(i => i.NonGSTProformaId == id && !i.IsDeleted)).ToList();
            var incomingItems = dto.Items ?? new List<NonGSTProformaItemDto>();

            decimal calculatedTotal = 0;
            int srNoCounter = 1;

            var incomingItemIds = new HashSet<int>();

            foreach (var itemDto in incomingItems)
            {
                decimal amount = itemDto.Quantity * itemDto.Rate;
                decimal itemTotal = amount;
                calculatedTotal += itemTotal;

                int srNo = itemDto.SrNo > 0 ? itemDto.SrNo : srNoCounter++;

                if (itemDto.NonGSTProformaItemId > 0)
                {
                    incomingItemIds.Add(itemDto.NonGSTProformaItemId);
                    var existingItem = existingItems.FirstOrDefault(x => x.NonGSTProformaItemId == itemDto.NonGSTProformaItemId);

                    if (existingItem != null)
                    {
                        existingItem.SrNo = srNo;
                        existingItem.Services = itemDto.Services;
                        existingItem.Description = itemDto.Description;
                        existingItem.Quantity = itemDto.Quantity;
                        existingItem.Rate = itemDto.Rate;
                        existingItem.Amount = amount;
                        existingItem.TotalAmount = itemTotal;
                        existingItem.UpdatedBy = dto.UpdatedBy;
                        existingItem.UpdatedDate = DateTime.Now;

                        await _itemRepository.Update(existingItem);
                    }
                }
                else
                {
                    var newItemEntity = new NonGSTProformaItemEntity
                    {
                        NonGSTProformaId = id,
                        SrNo = srNo,
                        Services = itemDto.Services,
                        Description = itemDto.Description,
                        Quantity = itemDto.Quantity,
                        Rate = itemDto.Rate,
                        Amount = amount,
                        TotalAmount = itemTotal,
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
                if (!incomingItemIds.Contains(existingItem.NonGSTProformaItemId))
                {
                    existingItem.IsDeleted = true;
                    existingItem.IsActive = false;
                    existingItem.UpdatedBy = dto.UpdatedBy;
                    existingItem.UpdatedDate = DateTime.Now;

                    await _itemRepository.Update(existingItem);
                }
            }

            proforma.TotalAmount = dto.TotalAmount > 0 ? dto.TotalAmount : calculatedTotal;
            await _proformaRepository.Update(proforma);

            _logger.LogInformation("Successfully updated Non-GST Proforma with ID: {Id}", id);
            return true;
        }

        public async Task<NonGSTProformaDto?> UpdatePublicResponseAsync(string proformaNo, string status)
        {
            var normalizedProformaNo = proformaNo.Trim();
            var proforma = (await _proformaRepository.FindByCondition(p =>
                !p.IsDeleted && p.ProformaNo.ToLower() == normalizedProformaNo.ToLower())).FirstOrDefault();

            if (proforma == null)
            {
                _logger.LogWarning("Public response failed. Non-GST Proforma {ProformaNo} was not found.", normalizedProformaNo);
                return null;
            }

            proforma.Status = status;
            proforma.UpdatedDate = DateTime.Now;
            await _proformaRepository.Update(proforma);

            _logger.LogInformation("Recorded public {Status} response for Non-GST Proforma {ProformaNo}.", status, proforma.ProformaNo);
            return await MapToDtoAsync(proforma);
        }

        public async Task<bool> DeleteNonGSTProformaAsync(int id)
        {
            _logger.LogInformation("Soft-deleting Non-GST Proforma with ID: {Id}", id);

            var proforma = await _proformaRepository.GetByIdAsync(id);

            if (proforma == null || proforma.IsDeleted)
            {
                _logger.LogWarning("Delete failed. Non-GST Proforma with ID: {Id} not found.", id);
                return false;
            }

            proforma.IsDeleted = true;
            proforma.IsActive = false;
            proforma.UpdatedDate = DateTime.Now;

            await _proformaRepository.Update(proforma);

            var childItems = await _itemRepository.FindByCondition(i => i.NonGSTProformaId == id && !i.IsDeleted);
            foreach (var item in childItems)
            {
                item.IsDeleted = true;
                item.IsActive = false;
                item.UpdatedDate = DateTime.Now;
                await _itemRepository.Update(item);
            }

            _logger.LogInformation("Successfully soft-deleted Non-GST Proforma with ID: {Id}", id);
            return true;
        }

        private async Task<NonGSTProformaDto> MapToDtoAsync(NonGSTProformaEntity p)
        {
            string? companyName = null;

            var company = await _companyRepository.GetByIdAsync(p.CompanyId);
            if (company != null && !company.IsDeleted)
            {
                companyName = company.CompanyName;
            }

            var items = await _itemRepository.FindByCondition(i => i.NonGSTProformaId == p.NonGSTProformaId && !i.IsDeleted);

            var itemDtos = items
                .OrderBy(i => i.SrNo)
                .Select(i => new NonGSTProformaItemDto
                {
                    NonGSTProformaItemId = i.NonGSTProformaItemId,
                    NonGSTProformaId = i.NonGSTProformaId,
                    SrNo = i.SrNo,
                    Services = i.Services,
                    Description = i.Description,
                    Quantity = i.Quantity,
                    Rate = i.Rate,
                    Amount = i.Amount,
                    TotalAmount = i.TotalAmount
                })
                .ToList();

            return new NonGSTProformaDto
            {
                NonGSTProformaId = p.NonGSTProformaId,
                ProformaNo = p.ProformaNo,
                ProformaDate = p.ProformaDate,
                CompanyId = p.CompanyId,
                CompanyName = companyName,
                Address = null,
                State = null,
                Items = itemDtos,
                TotalAmount = p.TotalAmount,
                AmountInWords = p.AmountInWords,
                Remarks = p.Remarks,
                TermsAndConditions = p.TermsAndConditions,
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

        private async Task SendProformaEmailsAsync(NonGSTProformaDto proforma, int userId)
        {
            string adminEmail = _smtpSettings.Value?.SenderEmail?.Trim() ?? "info@mindaxiss.com";
            string clientEmail = await ResolveClientEmailAsync(proforma.CompanyId);

            string subjectClient = $"Non-GST Proforma Invoice {proforma.ProformaNo} from MindAxis Innovation Pvt Ltd";
            string subjectAdmin  = $"New Non-GST Proforma {proforma.ProformaNo} created for {proforma.CompanyName}";

            string bodyClient = !string.IsNullOrWhiteSpace(proforma.EmailBody) ? proforma.EmailBody : string.Empty;
            string bodyAdmin  = !string.IsNullOrWhiteSpace(proforma.AdminEmailBody) ? proforma.AdminEmailBody : (!string.IsNullOrWhiteSpace(proforma.EmailBody) ? proforma.EmailBody : string.Empty);

            if (!string.IsNullOrWhiteSpace(clientEmail))
            {
                try
                {
                    await _emailService.SendEmailAsync(clientEmail, subjectClient, bodyClient);
                    _logger.LogInformation("Non-GST Proforma email sent successfully to Client: {ClientEmail}", clientEmail);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send Non-GST Proforma email to Client: {ClientEmail}", clientEmail);
                }
            }

            if (!string.IsNullOrWhiteSpace(adminEmail))
            {
                try
                {
                    await _emailService.SendEmailAsync(adminEmail, subjectAdmin, bodyAdmin);
                    _logger.LogInformation("Non-GST Proforma notification email sent successfully to Admin: {AdminEmail}", adminEmail);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send Non-GST Proforma notification email to Admin: {AdminEmail}", adminEmail);
                }
            }
        }
    }
}
