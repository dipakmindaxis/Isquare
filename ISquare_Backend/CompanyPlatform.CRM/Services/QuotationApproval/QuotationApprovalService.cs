using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Quotation;
using CompanyPlatform.Core.Repository;

using QuotationApprovalModel =
    CompanyPlatform.Core.Models.CRM.Company.QuotationApproval;

using QuotationModel =
    CompanyPlatform.Core.Models.CRM.Company.Quotation;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public class QuotationApprovalService : IQuotationApprovalService
    {
        private readonly IRepositories<QuotationApprovalModel>
            _approvalRepository;

        private readonly IRepositories<QuotationModel>
            _quotationRepository;

        private readonly ILogger<QuotationApprovalService> _logger;

        public QuotationApprovalService(
            IRepositories<QuotationApprovalModel> approvalRepository,
            IRepositories<QuotationModel> quotationRepository,
            ILogger<QuotationApprovalService> logger)
        {
            _approvalRepository = approvalRepository;
            _quotationRepository = quotationRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<QuotationApprovalDto>> GetAllAsync()
        {
            var approvals = await _approvalRepository.GetAll();

            return approvals
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.RequestedAt)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<QuotationApprovalDto?> GetByIdAsync(int id)
        {
            var approval =
                await _approvalRepository.GetByIdAsync(id);

            if (approval == null || approval.IsDeleted)
                return null;

            return MapToDto(approval);
        }

        public async Task<IEnumerable<QuotationApprovalDto>>
            GetByQuotationIdAsync(int quotationId)
        {
            var approvals = await _approvalRepository.GetAll();

            return approvals
                .Where(x =>
                    x.QuotationId == quotationId &&
                    !x.IsDeleted)
                .OrderByDescending(x => x.RequestedAt)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<QuotationApprovalDto> CreateAsync(
            CreateQuotationApprovalDto dto,
            string? requestedBy)
        {
            var quotation =
                await _quotationRepository.GetByIdAsync(dto.QuotationId);

            if (quotation == null || quotation.IsDeleted)
                throw new KeyNotFoundException("Quotation not found.");

            if (string.Equals(
                quotation.ApprovalStatus,
                "Approved",
                StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "This quotation is already approved.");
            }

            var approvals = await _approvalRepository.GetAll();

            bool pendingExists = approvals.Any(x =>
                x.QuotationId == dto.QuotationId &&
                !x.IsDeleted &&
                string.Equals(
                    x.ApprovalStatus,
                    "Pending",
                    StringComparison.OrdinalIgnoreCase));

            if (pendingExists)
            {
                throw new InvalidOperationException(
                    "A pending approval request already exists.");
            }

            var now = DateTime.UtcNow;

            var approval = new QuotationApprovalModel
            {
                QuotationId = dto.QuotationId,
                ApprovalStatus = "Pending",
                ApprovalReason = dto.ApprovalReason,
                RequestedBy = requestedBy,
                RequestedAt = now,
                CreatedAt = now,
                IsActive = true,
                IsDeleted = false
            };

            await _approvalRepository.Create(approval);

            quotation.ApprovalStatus = "Pending";
            quotation.UpdatedAt = now;

            await _quotationRepository.Update(quotation);

            _logger.LogInformation(
                "Approval requested for quotation {QuotationId}",
                dto.QuotationId);

            return MapToDto(approval);
        }

        public async Task<QuotationApprovalDto?> DecideAsync(
            int id,
            DecideQuotationApprovalDto dto,
            string? approvedBy)
        {
            var approval =
                await _approvalRepository.GetByIdAsync(id);

            if (approval == null || approval.IsDeleted)
                return null;

            if (!string.Equals(
                approval.ApprovalStatus,
                "Pending",
                StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "This approval request has already been processed.");
            }

            var decision = dto.Decision.Trim();

            if (!decision.Equals(
                    "Approved",
                    StringComparison.OrdinalIgnoreCase) &&
                !decision.Equals(
                    "Rejected",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException(
                    "Decision must be Approved or Rejected.");
            }

            var quotation =
                await _quotationRepository.GetByIdAsync(
                    approval.QuotationId);

            if (quotation == null || quotation.IsDeleted)
                throw new KeyNotFoundException("Quotation not found.");

            decision = decision.Equals(
                "Approved",
                StringComparison.OrdinalIgnoreCase)
                    ? "Approved"
                    : "Rejected";

            var now = DateTime.UtcNow;

            approval.ApprovalStatus = decision;
            approval.ApprovedBy = approvedBy;
            approval.ApprovedAt = now;
            approval.ApproverComments = dto.ApproverComments;
            approval.UpdatedAt = now;

            quotation.ApprovalStatus = decision;
            quotation.UpdatedAt = now;

            await _approvalRepository.Update(approval);
            await _quotationRepository.Update(quotation);

            _logger.LogInformation(
                "Approval {ApprovalId} processed: {Decision}",
                id,
                decision);

            return MapToDto(approval);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var approval =
                await _approvalRepository.GetByIdAsync(id);

            if (approval == null || approval.IsDeleted)
                return false;

            approval.IsDeleted = true;
            approval.IsActive = false;
            approval.UpdatedAt = DateTime.UtcNow;

            await _approvalRepository.Update(approval);

            return true;
        }

        private static QuotationApprovalDto MapToDto(
            QuotationApprovalModel model)
        {
            return new QuotationApprovalDto
            {
                QuotationApprovalId = model.QuotationApprovalId,
                QuotationId = model.QuotationId,
                ApprovalStatus = model.ApprovalStatus,
                ApprovalReason = model.ApprovalReason,
                RequestedBy = model.RequestedBy,
                RequestedAt = model.RequestedAt,
                ApprovedBy = model.ApprovedBy,
                ApprovedAt = model.ApprovedAt,
                ApproverComments = model.ApproverComments
            };
        }
    }
}