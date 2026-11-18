namespace PayrollManagementAPI.Services.Email
{
    public class SmtpSettings
    {
        public string Server { get; set; } = string.Empty;
        public int Port { get; set; }
        public string SenderEmail { get; set; } = string.Empty;
        public string SenderPassword { get; set; } = string.Empty;
        public bool EnableSsl { get; set; }
        public string FromName { get; set; } = string.Empty;
        public string ReplyToEmail { get; set; } = string.Empty;
    }
}
