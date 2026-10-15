using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Models.CRM.Company;
using InvoicePaymentEntity = CompanyPlatform.Core.Models.CRM.Company.InvoicePayment;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.Invoice;

namespace CompanyPlatform.CRM.Services.InvoicePayment
{
    public class InvoicePaymentService : IInvoicePaymentService
    {
        private readonly IRepositories<InvoicePaymentEntity> _repository;
        private readonly ILogger<InvoicePaymentService> _logger;

        public InvoicePaymentService(
            IRepositories<InvoicePaymentEntity> repository,
            ILogger<InvoicePaymentService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<InvoicePaymentDto>> GetAllInvoicePaymentsAsync()
        {
            _logger.LogInformation("Fetching all invoice payments.");

            var items = await _repository.GetAll();

            return items
                .Where(x => x.IsDeleted == false)
                .Select(x => new InvoicePaymentDto
                {
                    PaymentId = x.PaymentId,
                    InvoiceId = x.InvoiceId,
                    PaymentDate = x.PaymentDate,
                    PaymentMode = x.PaymentMode,
                    TransactionId = x.TransactionId,
                    PaidAmount = x.PaidAmount,
                    BalanceAmount = x.BalanceAmount,
                    PaymentStatus = x.PaymentStatus,
                    Remarks = x.Remarks,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<InvoicePaymentDto?> GetInvoicePaymentByIdAsync(int id)
        {
            _logger.LogInformation("Fetching invoice payment with ID: {PaymentId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted == true)
            {
                _logger.LogWarning("Invoice payment not found with ID: {PaymentId}", id);
                return null;
            }

            return new InvoicePaymentDto
            {
                PaymentId = item.PaymentId,
                InvoiceId = item.InvoiceId,
                PaymentDate = item.PaymentDate,
                PaymentMode = item.PaymentMode,
                TransactionId = item.TransactionId,
                PaidAmount = item.PaidAmount,
                BalanceAmount = item.BalanceAmount,
                PaymentStatus = item.PaymentStatus,
                Remarks = item.Remarks,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<InvoicePaymentDto> CreateInvoicePaymentAsync(InvoicePaymentDto dto)
        {
            _logger.LogInformation("Creating invoice payment.");

            var payment = new InvoicePaymentEntity
            {
                InvoiceId = dto.InvoiceId,
                PaymentDate = dto.PaymentDate,
                PaymentMode = dto.PaymentMode,
                TransactionId = dto.TransactionId,
                PaidAmount = dto.PaidAmount,
                BalanceAmount = dto.BalanceAmount,
                PaymentStatus = dto.PaymentStatus,
                Remarks = dto.Remarks,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(payment);

            dto.PaymentId = payment.PaymentId;
            dto.IsActive = payment.IsActive;
            dto.IsDeleted = payment.IsDeleted;

            _logger.LogInformation("Invoice payment created successfully with ID: {PaymentId}", payment.PaymentId);

            return dto;
        }

        public async Task<bool> UpdateInvoicePaymentAsync(int id, InvoicePaymentDto dto)
        {
            _logger.LogInformation("Updating invoice payment with ID: {PaymentId}", id);

            var payment = await _repository.GetByIdAsync(id);

            if (payment == null || payment.IsDeleted == true)
            {
                _logger.LogWarning("Invoice payment not found with ID: {PaymentId}", id);
                return false;
            }

            payment.InvoiceId = dto.InvoiceId;
            payment.PaymentDate = dto.PaymentDate;
            payment.PaymentMode = dto.PaymentMode;
            payment.TransactionId = dto.TransactionId;
            payment.PaidAmount = dto.PaidAmount;
            payment.BalanceAmount = dto.BalanceAmount;
            payment.PaymentStatus = dto.PaymentStatus;
            payment.Remarks = dto.Remarks;
            payment.IsActive = dto.IsActive;

            await _repository.Update(payment);

            _logger.LogInformation("Invoice payment updated successfully.");

            return true;
        }

        public async Task<bool> DeleteInvoicePaymentAsync(int id)
        {
            _logger.LogInformation("Deleting invoice payment with ID: {PaymentId}", id);

            var payment = await _repository.GetByIdAsync(id);

            if (payment == null)
            {
                _logger.LogWarning("Invoice payment not found with ID: {PaymentId}", id);
                return false;
            }

            payment.IsActive = false;
            payment.IsDeleted = true;

            await _repository.Update(payment);

            _logger.LogInformation("Invoice payment deleted successfully.");

            return true;
        }
    }
}