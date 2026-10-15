namespace CompanyPlatform.CRM.DTO.LocationMasters
{
    public class CityDto
    {
        public int CityId { get; set; }
        public int StateId { get; set; }
        public string CityName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}