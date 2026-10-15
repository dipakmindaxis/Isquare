using CompanyPlatform.CRM.DTO.EmailTemplate;

namespace CompanyPlatform.CRM.Services.EmailTemplate
{
    public interface IEmailTemplateService
    {
        Task<IEnumerable<EmailTemplateDto>> GetAllEmailTemplatesAsync();
        Task<EmailTemplateDto> GetEmailTemplateByIdAsync(int id);
        Task<EmailTemplateDto> CreateEmailTemplateAsync(EmailTemplateDto emailTemplateDto);
        Task<bool> UpdateEmailTemplateAsync(int id, EmailTemplateDto emailTemplateDto);
        Task<bool> DeleteEmailTemplateAsync(int id);
    }
}