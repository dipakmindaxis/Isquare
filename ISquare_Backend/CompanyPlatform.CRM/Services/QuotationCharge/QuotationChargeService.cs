using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Quotation;
using CompanyPlatform.Core.Repository;

using QuotationChargeModel =
    CompanyPlatform.Core.Models.CRM.Company.QuotationCharge;

using QuotationModel =
    CompanyPlatform.Core.Models.CRM.Company.Quotation;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public class QuotationChargeService : IQuotationChargeService
    {
        private readonly IRepositories<QuotationChargeModel>
            _chargeRepository;

        private readonly IRepositories<QuotationModel>
            _quotationRepository;

        private readonly ILogger<QuotationChargeService> _logger;

        public QuotationChargeService(
            IRepositories<QuotationChargeModel> chargeRepository,
            IRepositories<QuotationModel> quotationRepository,
            ILogger<QuotationChargeService> logger)
        {
            _chargeRepository = chargeRepository;
            _quotationRepository = quotationRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<QuotationChargeDto>> GetAllAsync()
        {
            var charges = await _chargeRepository.GetAll();

            return charges
                .Where(x => !x.IsDeleted)
                .OrderBy(x => x.QuotationId)
                .ThenBy(x => x.QuotationChargeId)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<QuotationChargeDto?> GetByIdAsync(int id)
        {
            var charge = await _chargeRepository.GetByIdAsync(id);

            if (charge == null || charge.IsDeleted)
                return null;

            return MapToDto(charge);
        }

        public async Task<IEnumerable<QuotationChargeDto>>
            GetByQuotationIdAsync(int quotationId)
        {
            var charges = await _chargeRepository.GetAll();

            return charges
                .Where(x =>
                    x.QuotationId == quotationId &&
                    !x.IsDeleted)
                .OrderBy(x => x.QuotationChargeId)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<QuotationChargeDto> CreateAsync(
            CreateQuotationChargeDto dto)
        {
            ValidateDto(dto);

            var quotation =
                await _quotationRepository.GetByIdAsync(dto.QuotationId);

            if (quotation == null || quotation.IsDeleted)
                throw new KeyNotFoundException("Quotation not found.");

            var charge = new QuotationChargeModel
            {
                QuotationId = dto.QuotationId,
                ChargeName = dto.ChargeName.Trim(),
                Description = dto.Description,
                ChargeType = dto.ChargeType.Trim(),
                ChargeAmount = dto.ChargeAmount,
                TaxRate = dto.TaxRate,
                IsTaxable = dto.IsTaxable,
                IsActive = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            CalculateAmounts(charge, quotation.Subtotal);

            await _chargeRepository.Create(charge);

            _logger.LogInformation(
                "Created charge {ChargeName} for quotation {QuotationId}",
                charge.ChargeName,
                charge.QuotationId);

            return MapToDto(charge);
        }

        public async Task<QuotationChargeDto?> UpdateAsync(
            int id,
            CreateQuotationChargeDto dto)
        {
            ValidateDto(dto);

            var charge = await _chargeRepository.GetByIdAsync(id);

            if (charge == null || charge.IsDeleted)
                return null;

            var quotation =
                await _quotationRepository.GetByIdAsync(dto.QuotationId);

            if (quotation == null || quotation.IsDeleted)
                throw new KeyNotFoundException("Quotation not found.");

            charge.QuotationId = dto.QuotationId;
            charge.ChargeName = dto.ChargeName.Trim();
            charge.Description = dto.Description;
            charge.ChargeType = dto.ChargeType.Trim();
            charge.ChargeAmount = dto.ChargeAmount;
            charge.TaxRate = dto.TaxRate;
            charge.IsTaxable = dto.IsTaxable;
            charge.UpdatedAt = DateTime.UtcNow;

            CalculateAmounts(charge, quotation.Subtotal);

            await _chargeRepository.Update(charge);

            return MapToDto(charge);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var charge = await _chargeRepository.GetByIdAsync(id);

            if (charge == null || charge.IsDeleted)
                return false;

            charge.IsDeleted = true;
            charge.IsActive = false;
            charge.UpdatedAt = DateTime.UtcNow;

            await _chargeRepository.Update(charge);

            return true;
        }

        private static void ValidateDto(CreateQuotationChargeDto dto)
        {
            if (dto.QuotationId <= 0)
                throw new ArgumentException("Valid QuotationId is required.");

            if (string.IsNullOrWhiteSpace(dto.ChargeName))
                throw new ArgumentException("ChargeName is required.");

            if (dto.ChargeAmount < 0)
                throw new ArgumentException(
                    "ChargeAmount cannot be negative.");

            if (dto.TaxRate < 0 || dto.TaxRate > 100)
                throw new ArgumentException(
                    "TaxRate must be between 0 and 100.");

            if (!dto.ChargeType.Equals(
                    "Fixed",
                    StringComparison.OrdinalIgnoreCase) &&
                !dto.ChargeType.Equals(
                    "Percentage",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException(
                    "ChargeType must be Fixed or Percentage.");
            }
        }

        private static void CalculateAmounts(
            QuotationChargeModel charge,
            decimal quotationSubtotal)
        {
            decimal baseAmount = charge.ChargeType.Equals(
                "Percentage",
                StringComparison.OrdinalIgnoreCase)
                    ? quotationSubtotal * charge.ChargeAmount / 100m
                    : charge.ChargeAmount;

            baseAmount = Math.Round(
                baseAmount, 2, MidpointRounding.AwayFromZero);

            charge.TaxAmount = charge.IsTaxable
                ? Math.Round(
                    baseAmount * charge.TaxRate / 100m,
                    2,
                    MidpointRounding.AwayFromZero)
                : 0m;

            charge.TotalAmount = baseAmount + charge.TaxAmount;
        }

        private static QuotationChargeDto MapToDto(
            QuotationChargeModel model)
        {
            return new QuotationChargeDto
            {
                QuotationChargeId = model.QuotationChargeId,
                QuotationId = model.QuotationId,
                ChargeName = model.ChargeName,
                Description = model.Description,
                ChargeType = model.ChargeType,
                ChargeAmount = model.ChargeAmount,
                TaxRate = model.TaxRate,
                TaxAmount = model.TaxAmount,
                TotalAmount = model.TotalAmount,
                IsTaxable = model.IsTaxable,
                IsActive = model.IsActive
            };
        }
    }
}