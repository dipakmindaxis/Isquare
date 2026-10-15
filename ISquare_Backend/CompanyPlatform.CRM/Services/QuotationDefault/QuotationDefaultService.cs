using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Quotation;
using CompanyPlatform.Core.Repository;
using QuotationDefaultModel =
    CompanyPlatform.Core.Models.CRM.Company.QuotationDefault;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public class QuotationDefaultService : IQuotationDefaultService
    {
        private readonly IRepositories<QuotationDefaultModel> _repository;
        private readonly ILogger<QuotationDefaultService> _logger;

        public QuotationDefaultService(
            IRepositories<QuotationDefaultModel> repository,
            ILogger<QuotationDefaultService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        // ENTITY TO DTO
        private static QuotationDefaultDto MapToDto(
            QuotationDefaultModel item)
        {
            return new QuotationDefaultDto
            {
                QuotationDefaultId = item.QuotationDefaultId,
                DefaultDeliveryPeriod = item.DefaultDeliveryPeriod,
                PaymentTermId = item.PaymentTermId,
                StandardWarranty = item.StandardWarranty,
                QuotationValidity = item.QuotationValidity,
                StandardTermsAndConditions =
                    item.StandardTermsAndConditions,
                CompanyName = item.CompanyName,
                GSTNumber = item.GSTNumber,
                CompanyAddress = item.CompanyAddress,
                CompanyLogoPath = item.CompanyLogoPath,
                BankName = item.BankName,
                AccountNumber = item.AccountNumber,
                IFSCCode = item.IFSCCode,
                AccountHolderName = item.AccountHolderName,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        // GET ALL
        public async Task<IEnumerable<QuotationDefaultDto>> GetAllAsync()
        {
            _logger.LogInformation(
                "Fetching quotation default settings.");

            var items = await _repository.GetAll();

            return items
                .Where(x => !x.IsDeleted)
                .OrderBy(x => x.QuotationDefaultId)
                .Select(MapToDto)
                .ToList();
        }

        // GET BY ID
        public async Task<QuotationDefaultDto?> GetByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching quotation defaults with ID: {Id}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return null;

            return MapToDto(item);
        }

        // CREATE
        public async Task<QuotationDefaultDto> CreateAsync(
            QuotationDefaultDto dto)
        {
            _logger.LogInformation(
                "Creating quotation default settings.");

            Validate(dto);

            var items = await _repository.GetAll();

            if (items.Any(x => !x.IsDeleted && x.IsActive))
            {
                throw new InvalidOperationException(
                    "An active quotation default record already exists. " +
                    "Update the existing record instead.");
            }

            var item = new QuotationDefaultModel
            {
                DefaultDeliveryPeriod = dto.DefaultDeliveryPeriod,
                PaymentTermId = dto.PaymentTermId,
                StandardWarranty = dto.StandardWarranty,
                QuotationValidity = dto.QuotationValidity,
                StandardTermsAndConditions =
                    dto.StandardTermsAndConditions,
                CompanyName = dto.CompanyName,
                GSTNumber = dto.GSTNumber,
                CompanyAddress = dto.CompanyAddress,
                CompanyLogoPath = dto.CompanyLogoPath,
                BankName = dto.BankName,
                AccountNumber = dto.AccountNumber,
                IFSCCode = dto.IFSCCode,
                AccountHolderName = dto.AccountHolderName,
                IsActive = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.Create(item);

            return MapToDto(item);
        }

        // UPDATE
        public async Task<bool> UpdateAsync(
            int id, QuotationDefaultDto dto)
        {
            _logger.LogInformation(
                "Updating quotation defaults with ID: {Id}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return false;

            Validate(dto);

            item.DefaultDeliveryPeriod = dto.DefaultDeliveryPeriod;
            item.PaymentTermId = dto.PaymentTermId;
            item.StandardWarranty = dto.StandardWarranty;
            item.QuotationValidity = dto.QuotationValidity;
            item.StandardTermsAndConditions =
                dto.StandardTermsAndConditions;
            item.CompanyName = dto.CompanyName;
            item.GSTNumber = dto.GSTNumber;
            item.CompanyAddress = dto.CompanyAddress;
            item.CompanyLogoPath = dto.CompanyLogoPath;
            item.BankName = dto.BankName;
            item.AccountNumber = dto.AccountNumber;
            item.IFSCCode = dto.IFSCCode;
            item.AccountHolderName = dto.AccountHolderName;
            item.IsActive = dto.IsActive;
            item.UpdatedAt = DateTime.UtcNow;

            await _repository.Update(item);

            return true;
        }

        // DELETE - SOFT DELETE
        public async Task<bool> DeleteAsync(int id)
        {
            _logger.LogInformation(
                "Deleting quotation defaults with ID: {Id}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return false;

            item.IsDeleted = true;
            item.IsActive = false;
            item.UpdatedAt = DateTime.UtcNow;

            await _repository.Update(item);

            return true;
        }

        // VALIDATION
        private static void Validate(QuotationDefaultDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.DefaultDeliveryPeriod))
                throw new ArgumentException(
                    "Default delivery period is required.");

            if (string.IsNullOrWhiteSpace(dto.StandardWarranty))
                throw new ArgumentException(
                    "Standard warranty is required.");

            if (string.IsNullOrWhiteSpace(dto.QuotationValidity))
                throw new ArgumentException(
                    "Quotation validity is required.");

            if (dto.PaymentTermId.HasValue &&
                dto.PaymentTermId.Value <= 0)
            {
                throw new ArgumentException(
                    "PaymentTermId must be a valid positive ID.");
            }
        }
    }
}