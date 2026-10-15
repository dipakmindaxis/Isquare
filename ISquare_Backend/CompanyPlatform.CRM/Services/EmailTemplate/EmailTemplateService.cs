using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.EmailTemplate;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EmailTemplateEntity = CompanyPlatform.Core.Models.CRM.Company.EmailTemplate;


namespace CompanyPlatform.CRM.Services.EmailTemplate
{
    public class EmailTemplateService : IEmailTemplateService
    {
        private readonly IRepositories<EmailTemplateEntity> _repository;
        private readonly ILogger<EmailTemplateService> _logger;

        public EmailTemplateService(IRepositories<EmailTemplateEntity> repository, ILogger<EmailTemplateService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<EmailTemplateDto>> GetAllEmailTemplatesAsync()
        {
            _logger.LogInformation("Fetching all active email templates.");
            var items = await _repository.GetAll();

            return items
                .Where(e => e.IsDeleted == false)
                .Select(e => new EmailTemplateDto
                {
                    ID = e.ID,
                    TemplateName = e.TemplateName,
                    Subject = e.Subject,
                    Body = e.Body,
                    IsDeleted = e.IsDeleted
                });
        }

        public async Task<EmailTemplateDto> GetEmailTemplateByIdAsync(int id)
        {
            _logger.LogInformation("Fetching email template by ID: {EmailTemplateId}", id);
            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted == true)
            {
                _logger.LogWarning("Email template with ID: {EmailTemplateId} not found or is inactive.", id);
                return null;
            }

            return new EmailTemplateDto
            {
                ID = item.ID,
                TemplateName = item.TemplateName,
                Subject = item.Subject,
                Body = item.Body,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<EmailTemplateDto> CreateEmailTemplateAsync(EmailTemplateDto dto)
        {
            _logger.LogInformation("Creating a new email template with name: {TemplateName}", dto.TemplateName);
            var newItem = new EmailTemplateEntity
            {
                TemplateName = dto.TemplateName,
                Subject = dto.Subject,
                Body = dto.Body,
                IsDeleted = false
            };

            await _repository.Create(newItem);

            dto.ID = newItem.ID;
            dto.IsDeleted = newItem.IsDeleted;

            _logger.LogInformation("Successfully created email template with ID: {EmailTemplateId}", newItem.ID);
            return dto;
        }

        public async Task<bool> UpdateEmailTemplateAsync(int id, EmailTemplateDto dto)
        {
            _logger.LogInformation("Attempting to update email template with ID: {EmailTemplateId}", id);
            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsDeleted == true)
            {
                _logger.LogWarning("Update failed. Email template with ID: {EmailTemplateId} not found or is inactive.", id);
                return false;
            }

            itemToUpdate.TemplateName = dto.TemplateName;
            itemToUpdate.Subject = dto.Subject;
            itemToUpdate.Body = dto.Body;

            await _repository.Update(itemToUpdate);

            _logger.LogInformation("Successfully updated email template with ID: {EmailTemplateId}", id);
            return true;
        }

        public async Task<bool> DeleteEmailTemplateAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate email template with ID: {EmailTemplateId}", id);
            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning("Deactivation failed. Email template with ID: {EmailTemplateId} not found.", id);
                return false;
            }

            // Soft delete: Mark as inactive instead of deleting
            itemToDelete.IsDeleted = true;
            await _repository.Update(itemToDelete);

            _logger.LogInformation("Successfully deactivated email template with ID: {EmailTemplateId}", id);
            return true;
        }
    }
}