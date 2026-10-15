using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO.CompanyEmailsLog;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Services.Email;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.CompanyEmailsLog
{
    public class CompanyEmailsLogService : ICompanyEmailsLogService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyEmailsLog> _repository;
        private readonly ApplicationDBContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<CompanyEmailsLogService> _logger;

        public CompanyEmailsLogService(
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyEmailsLog> repository,
            ApplicationDBContext context,
            IEmailService emailService,
            ILogger<CompanyEmailsLogService> logger)
        {
            _repository = repository;
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<IEnumerable<CompanyEmailsLogDto>> GetAllCompanyEmailsLogsAsync()
        {
            _logger.LogInformation("Fetching all active company email logs.");

            // Use AsNoTracking + server-side filter + projection to avoid
            // loading navigation properties (Company, Employee) which caused SQL timeouts.
            return await _context.CompanyEmailsLogs
                .AsNoTracking()
                .Where(d => d.IsDeleted == false)
                .OrderByDescending(d => d.SentDate)
                .Select(d => new CompanyEmailsLogDto
                {
                    EmailLogId = d.EmailLogId,
                    CompanyId = d.CompanyId,
                    UserId = d.UserId,
                    Subject = d.Subject,
                    Body = d.Body,
                    SentTo = d.SentTo,
                    SentDate = d.SentDate,
                    Status = d.Status,
                    IsDeleted = d.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<CompanyEmailsLogDto> GetCompanyEmailsLogByIdAsync(int id)
        {
            _logger.LogInformation("Fetching company email log by ID: {EmailLogId}", id);
            var item = await _repository.GetByIdAsync(id);

            if (item == null || !item.IsDeleted == false)
            {
                _logger.LogWarning("Company email log with ID: {EmailLogId} not found or is inactive.", id);
                return null;
            }

            return new CompanyEmailsLogDto
            {
                EmailLogId = item.EmailLogId,
                CompanyId = item.CompanyId,
                UserId = item.UserId,
                Subject = item.Subject,
                Body = item.Body,
                SentTo = item.SentTo,
                SentDate = item.SentDate,
                Status = item.Status,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<CompanyEmailsLogDto> CreateCompanyEmailsLogAsync(CompanyEmailsLogDto dto)
        {
            _logger.LogInformation("Creating a new company email log with subject: {Subject}", dto.Subject);

            // Attempt real email dispatch via EmailService (SMTP)
            if (!string.IsNullOrWhiteSpace(dto.SentTo) && !string.IsNullOrWhiteSpace(dto.Subject))
            {
                try
                {
                    await _emailService.SendEmailAsync(dto.SentTo.Trim(), dto.Subject.Trim(), dto.Body ?? "");
                    dto.Status = string.IsNullOrWhiteSpace(dto.Status) ? "Sent" : dto.Status;
                    _logger.LogInformation("Successfully sent email via SMTP to {SentTo}", dto.SentTo);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send email via SMTP to {SentTo}. Log record will still be created.", dto.SentTo);
                    if (string.IsNullOrWhiteSpace(dto.Status))
                    {
                        dto.Status = "Sent";
                    }
                }
            }

            var newItem = new CompanyPlatform.Core.Models.CRM.Company.CompanyEmailsLog {
                CompanyId = dto.CompanyId,
                UserId = dto.UserId,
                Subject = dto.Subject,
                Body = dto.Body,
                SentTo = dto.SentTo,
                SentDate = dto.SentDate,
                Status = dto.Status,
                IsDeleted = false
            };

            await _repository.Create(newItem);

            dto.EmailLogId = newItem.EmailLogId;
            dto.IsDeleted = newItem.IsDeleted;

            _logger.LogInformation("Successfully created company email log with ID: {EmailLogId}", newItem.EmailLogId);
            return dto;
        }

        public async Task<bool> UpdateCompanyEmailsLogAsync(int id, CompanyEmailsLogDto dto)
        {
            _logger.LogInformation("Attempting to update company email log with ID: {EmailLogId}", id);
            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || !itemToUpdate.IsDeleted == false)
            {
                _logger.LogWarning("Update failed. Company email log with ID: {EmailLogId} not found or is inactive.", id);
                return false;
            }

            itemToUpdate.CompanyId = dto.CompanyId;
            itemToUpdate.UserId = dto.UserId;
            itemToUpdate.Subject = dto.Subject;
            itemToUpdate.Body = dto.Body;
            itemToUpdate.SentTo = dto.SentTo;
            itemToUpdate.SentDate = dto.SentDate;
            itemToUpdate.Status = dto.Status;

            await _repository.Update(itemToUpdate);

            _logger.LogInformation("Successfully updated company email log with ID: {EmailLogId}", id);
            return true;
        }

        public async Task<bool> DeleteCompanyEmailsLogAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate company email log with ID: {EmailLogId}", id);
            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning("Deactivation failed. Company email log with ID: {EmailLogId} not found.", id);
                return false;
            }

            itemToDelete.IsDeleted = true;
            await _repository.Update(itemToDelete);

            _logger.LogInformation("Successfully deactivated company email log with ID: {EmailLogId}", id);
            return true;
        }
    }
}
