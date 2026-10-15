using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Quotation;
using CompanyPlatform.Core.Repository;

using QuotationRevisionModel =
    CompanyPlatform.Core.Models.CRM.Company.QuotationRevision;

using QuotationModel =
    CompanyPlatform.Core.Models.CRM.Company.Quotation;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public class QuotationRevisionService : IQuotationRevisionService
    {
        private readonly IRepositories<QuotationRevisionModel>
            _revisionRepository;

        private readonly IRepositories<QuotationModel>
            _quotationRepository;

        private readonly ILogger<QuotationRevisionService> _logger;

        public QuotationRevisionService(
            IRepositories<QuotationRevisionModel> revisionRepository,
            IRepositories<QuotationModel> quotationRepository,
            ILogger<QuotationRevisionService> logger)
        {
            _revisionRepository = revisionRepository;
            _quotationRepository = quotationRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<QuotationRevisionDto>> GetAllAsync()
        {
            var revisions = await _revisionRepository.GetAll();

            return revisions
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.RevisionDate)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<QuotationRevisionDto?> GetByIdAsync(int id)
        {
            var revision = await _revisionRepository.GetByIdAsync(id);

            if (revision == null || revision.IsDeleted)
                return null;

            return MapToDto(revision);
        }

        public async Task<IEnumerable<QuotationRevisionDto>>
            GetByQuotationIdAsync(int quotationId)
        {
            var revisions = await _revisionRepository.GetAll();

            return revisions
                .Where(x =>
                    x.QuotationId == quotationId &&
                    !x.IsDeleted)
                .OrderBy(x => GetRevisionOrder(x.RevisionNumber))
                .Select(MapToDto)
                .ToList();
        }

        public async Task<QuotationRevisionDto> CreateAsync(
            CreateQuotationRevisionDto dto,
            string? revisedBy)
        {
            if (dto.QuotationId <= 0)
                throw new ArgumentException("Valid QuotationId is required.");

            if (string.IsNullOrWhiteSpace(dto.RevisionReason))
                throw new ArgumentException("Revision reason is required.");

            var quotation =
                await _quotationRepository.GetByIdAsync(dto.QuotationId);

            if (quotation == null || quotation.IsDeleted)
                throw new KeyNotFoundException("Quotation not found.");

            var revisions = await _revisionRepository.GetAll();

            var existingRevisions = revisions
                .Where(x =>
                    x.QuotationId == dto.QuotationId &&
                    !x.IsDeleted)
                .ToList();

            int nextRevision = existingRevisions
                .Select(x => GetRevisionOrder(x.RevisionNumber))
                .DefaultIfEmpty(-1)
                .Max() + 1;

            var now = DateTime.UtcNow;

            var revision = new QuotationRevisionModel
            {
                QuotationId = quotation.QuotationId,
                RevisionNumber = $"R{nextRevision}",
                RevisionReason = dto.RevisionReason.Trim(),
                RevisedBy = revisedBy,
                RevisionDate = now,

                QuotationNumber = quotation.QuotationNumber,
                CustomerId = quotation.CustomerId,
                EnquiryId = quotation.EnquiryId,
                QuotationDate = quotation.QuotationDate,
                QuotationStatus = quotation.Status,

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

                IsActive = true,
                IsDeleted = false,
                CreatedAt = now
            };

            await _revisionRepository.Create(revision);

            _logger.LogInformation(
                "Created revision {RevisionNumber} for quotation {QuotationId}",
                revision.RevisionNumber,
                revision.QuotationId);

            return MapToDto(revision);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var revision = await _revisionRepository.GetByIdAsync(id);

            if (revision == null || revision.IsDeleted)
                return false;

            revision.IsDeleted = true;
            revision.IsActive = false;

            await _revisionRepository.Update(revision);

            return true;
        }

        private static int GetRevisionOrder(string? revisionNumber)
        {
            if (string.IsNullOrWhiteSpace(revisionNumber))
                return -1;

            var number = revisionNumber.Trim();

            if (number.StartsWith(
                "R",
                StringComparison.OrdinalIgnoreCase))
            {
                number = number.Substring(1);
            }

            return int.TryParse(number, out int result) ? result : -1;
        }

        private static QuotationRevisionDto MapToDto(
            QuotationRevisionModel model)
        {
            return new QuotationRevisionDto
            {
                QuotationRevisionId = model.QuotationRevisionId,
                QuotationId = model.QuotationId,
                RevisionNumber = model.RevisionNumber,
                RevisionReason = model.RevisionReason,
                RevisedBy = model.RevisedBy,
                RevisionDate = model.RevisionDate,

                QuotationNumber = model.QuotationNumber,
                CustomerId = model.CustomerId,
                EnquiryId = model.EnquiryId,
                QuotationDate = model.QuotationDate,
                QuotationStatus = model.QuotationStatus,

                Subtotal = model.Subtotal,
                DiscountAmount = model.DiscountAmount,
                TaxableAmount = model.TaxableAmount,
                TaxAmount = model.TaxAmount,
                FreightCharges = model.FreightCharges,
                InstallationCharges = model.InstallationCharges,
                OtherCharges = model.OtherCharges,
                GrandTotal = model.GrandTotal,

                DeliveryPeriod = model.DeliveryPeriod,
                PaymentTermId = model.PaymentTermId,
                Warranty = model.Warranty,
                ValidUntil = model.ValidUntil,
                TermsAndConditions = model.TermsAndConditions
            };
        }
    }
}