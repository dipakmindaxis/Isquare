namespace CompanyPlatform.CRM.DTO.CustomerArea
{
    public class CustomerAreaDto
    {
        public int CustomerAreaId { get; set; }

        public string AreaName { get; set; }

        public string AreaCode { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}