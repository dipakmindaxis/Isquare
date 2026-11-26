
using System.Collections.Generic;

namespace CompanyPlatform.Core.Services.Email
{
    public record EmailInlineImage(string ContentId, byte[] Content, string MimeType, string FileName);

    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);

        Task SendEmailAsync(string toEmail, string subject, string body, IEnumerable<EmailInlineImage>? inlineImages);

        Task SendPayslipEmailAsync(string toEmail, string employeeName, string monthYear, string pdfFilePath);
    }
}
