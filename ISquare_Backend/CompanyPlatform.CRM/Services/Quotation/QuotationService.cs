using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Quotation;
using CompanyPlatform.Core.Repository;
using QuotationModel =
    CompanyPlatform.Core.Models.CRM.Company.Quotation;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public class QuotationService : IQuotationService
    {
        private readonly IRepositories<QuotationModel> _repository;
        private readonly ILogger<QuotationService> _logger;

        public QuotationService(
            IRepositories<QuotationModel> repository,
            ILogger<QuotationService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        // GENERATE QUOTATION NUMBER
        private async Task<string> GenerateNextQuotationNumberAsync()
        {
            var quotations = await _repository.GetAll();

            int year = DateTime.UtcNow.Year;
            int maxNumber = 0;

            string prefix = $"QT-{year}-";

            foreach (var quotation in quotations)
            {
                if (string.IsNullOrWhiteSpace(quotation.QuotationNumber))
                    continue;

                var number = quotation.QuotationNumber.Trim();

                if (number.StartsWith(
                    prefix,
                    StringComparison.OrdinalIgnoreCase))
                {
                    var numberPart = number.Substring(prefix.Length);

                    if (int.TryParse(numberPart, out int currentNumber))
                    {
                        if (currentNumber > maxNumber)
                            maxNumber = currentNumber;
                    }
                }
            }

            return $"{prefix}{maxNumber + 1:D3}";
        }

        // DTO MAPPING
        private static QuotationDto MapToDto(QuotationModel quotation)
        {
            return new QuotationDto
            {
                QuotationId = quotation.QuotationId,
                QuotationNumber = quotation.QuotationNumber,
                CustomerId = quotation.CustomerId,
                EnquiryId = quotation.EnquiryId,
                QuotationDate = quotation.QuotationDate,
                RevisionNumber = quotation.RevisionNumber,
                Status = quotation.Status,
                ApprovalStatus = quotation.ApprovalStatus,
                Subtotal = quotation.Subtotal,
                DiscountAmount = quotation.DiscountAmount,
                TaxableAmount = quotation.TaxableAmount,
                TaxAmount = quotation.TaxAmount,
                FreightCharges = quotation.FreightCharges,
                InstallationCharges = quotation.InstallationCharges,
                OtherCharges = quotation.OtherCharges,
                GrandTotal = quotation.GrandTotal,
                DeliveryPeriod = quotation.DeliveryPeriod,
                PaymentTermId = quotation.PaymentTermId,
                Warranty = quotation.Warranty,
                ValidUntil = quotation.ValidUntil,
                TermsAndConditions = quotation.TermsAndConditions,
                IsActive = quotation.IsActive,
                IsDeleted = quotation.IsDeleted
            };
        }

        // GET ALL
        public async Task<IEnumerable<QuotationDto>>
            GetAllQuotationsAsync()
        {
            _logger.LogInformation("Fetching active quotations.");

            var quotations = await _repository.GetAll();

            return quotations
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.CreatedAt)
                .Select(MapToDto)
                .ToList();
        }

        // GET BY ID
        public async Task<QuotationDto?> GetQuotationByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching quotation with ID: {QuotationId}", id);

            var quotation = await _repository.GetByIdAsync(id);

            if (quotation == null || quotation.IsDeleted)
                return null;

            return MapToDto(quotation);
        }

        // CREATE
        public async Task<QuotationDto> CreateQuotationAsync(
            QuotationDto dto)
        {
            _logger.LogInformation(
                "Creating quotation for Customer ID: {CustomerId}",
                dto.CustomerId);

            var quotationNumber =
                await GenerateNextQuotationNumberAsync();

            var quotation = new QuotationModel
            {
                QuotationNumber = quotationNumber,
                CustomerId = dto.CustomerId,
                EnquiryId = dto.EnquiryId,
                QuotationDate = DateTime.UtcNow,
                RevisionNumber = 0,
                Status = "Draft",
                ApprovalStatus = "NotRequired",

                Subtotal = dto.Subtotal,
                DiscountAmount = dto.DiscountAmount,
                TaxableAmount = dto.TaxableAmount,
                TaxAmount = dto.TaxAmount,

                FreightCharges = dto.FreightCharges,
                InstallationCharges = dto.InstallationCharges,
                OtherCharges = dto.OtherCharges,
                GrandTotal = dto.GrandTotal,

                DeliveryPeriod = dto.DeliveryPeriod,
                PaymentTermId = dto.PaymentTermId,
                Warranty = dto.Warranty,
                ValidUntil = dto.ValidUntil,
                TermsAndConditions = dto.TermsAndConditions,

                IsActive = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.Create(quotation);

            return MapToDto(quotation);
        }

        // UPDATE
        public async Task<bool> UpdateQuotationAsync(
            int id, QuotationDto dto)
        {
            _logger.LogInformation(
                "Updating quotation with ID: {QuotationId}", id);

            var quotation = await _repository.GetByIdAsync(id);

            if (quotation == null || quotation.IsDeleted)
                return false;

            // Update status if provided and valid, otherwise preserve current status.
            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                ValidateStatus(dto.Status);
                quotation.Status = NormalizeStatus(dto.Status);
            }

            quotation.CustomerId = dto.CustomerId;
            quotation.EnquiryId = dto.EnquiryId;

            quotation.Subtotal = dto.Subtotal;
            quotation.DiscountAmount = dto.DiscountAmount;
            quotation.TaxableAmount = dto.TaxableAmount;
            quotation.TaxAmount = dto.TaxAmount;

            quotation.FreightCharges = dto.FreightCharges;
            quotation.InstallationCharges = dto.InstallationCharges;
            quotation.OtherCharges = dto.OtherCharges;
            quotation.GrandTotal = dto.GrandTotal;

            quotation.DeliveryPeriod = dto.DeliveryPeriod;
            quotation.PaymentTermId = dto.PaymentTermId;
            quotation.Warranty = dto.Warranty;
            quotation.ValidUntil = dto.ValidUntil;
            quotation.TermsAndConditions = dto.TermsAndConditions;

            quotation.IsActive = dto.IsActive;
            quotation.UpdatedAt = DateTime.UtcNow;

            await _repository.Update(quotation);

            return true;
        }

        // UPDATE STATUS
        public async Task<QuotationDto?> UpdateStatusAsync(
            int id, string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Status is required.");

            ValidateStatus(status);

            _logger.LogInformation(
                "Updating status of quotation with ID: {QuotationId} to {Status}",
                id, status);

            var quotation = await _repository.GetByIdAsync(id);

            if (quotation == null || quotation.IsDeleted)
                return null;

            quotation.Status = NormalizeStatus(status);
            quotation.UpdatedAt = DateTime.UtcNow;

            await _repository.Update(quotation);

            return MapToDto(quotation);
        }

        private static readonly HashSet<string> ValidStatuses =
            new(StringComparer.OrdinalIgnoreCase)
            {
                "Draft",
                "Sent",
                "UnderReview",
                "Approved",
                "Won",
                "Lost",
                "Cancelled",
                "Revised",
                "Expired"
            };

        private static void ValidateStatus(string status)
        {
            if (!ValidStatuses.Contains(status.Trim()))
            {
                throw new ArgumentException(
                    $"Invalid status '{status}'. Allowed statuses are: {string.Join(", ", ValidStatuses)}.");
            }
        }

        private static string NormalizeStatus(string status)
        {
            var trimmed = status.Trim();
            foreach (var valid in ValidStatuses)
            {
                if (valid.Equals(trimmed, StringComparison.OrdinalIgnoreCase))
                    return valid;
            }
            return trimmed;
        }

        // DELETE - SOFT DELETE
        public async Task<bool> DeleteQuotationAsync(int id)
        {
            _logger.LogInformation(
                "Deleting quotation with ID: {QuotationId}", id);

            var quotation = await _repository.GetByIdAsync(id);

            if (quotation == null || quotation.IsDeleted)
                return false;

            quotation.IsDeleted = true;
            quotation.IsActive = false;
            quotation.UpdatedAt = DateTime.UtcNow;

            await _repository.Update(quotation);

            return true;
        }
    }
}