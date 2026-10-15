namespace CompanyPlatform.CRM.DTO.CustomerSource
{
    public class CustomerSourceDto
    {
        public int CustomerSourceId { get; set; }

        public string SourceName { get; set; }

        public string SourceCode { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}