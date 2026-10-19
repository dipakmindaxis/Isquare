namespace CompanyPlatform.CRM.DTO
{
    public class EnquirySourceResponseDto
    {
        public int EnquirySourceId { get; set; }
        public string EnquirySourceCode { get; set; } = string.Empty;
        public string EnquirySourceName { get; set; } = string.Empty;
        public string? EnquirySourceDescription { get; set; }
        public int? EnquirySourceSortOrder { get; set; }
        public bool EnquirySourceIsActive { get; set; }
        public DateTime EnquirySourceCreatedAt { get; set; }
        public int EnquirySourceCreatedBy { get; set; }
        public DateTime? EnquirySourceUpdatedAt { get; set; }
        public int? EnquirySourceUpdatedBy { get; set; }
    }

    public class EnquirySourceCreateDto
    {
        public string EnquirySourceCode { get; set; } = string.Empty;
        public string EnquirySourceName { get; set; } = string.Empty;
        public string? EnquirySourceDescription { get; set; }
        public int? EnquirySourceSortOrder { get; set; }
        public bool EnquirySourceIsActive { get; set; } = true;
        public int EnquirySourceCreatedBy { get; set; }
    }

    public class EnquirySourceUpdateDto
    {
        public string EnquirySourceName { get; set; } = string.Empty;
        public string? EnquirySourceDescription { get; set; }
        public int? EnquirySourceSortOrder { get; set; }
        public bool EnquirySourceIsActive { get; set; }
        public int EnquirySourceUpdatedBy { get; set; }
    }
}