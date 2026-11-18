namespace CompanyPlatform.CRM.DTO.CustomerArea
{
    public class CustomerAreaDto
    {
        public int CustomerAreaId { get; set; }

        public string AreaName { get; set; } = string.Empty;

        public string AreaCode { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}