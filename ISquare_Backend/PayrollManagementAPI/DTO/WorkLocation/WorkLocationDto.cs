using System.ComponentModel;

namespace PayrollManagementAPI.DTO.WorkLocation
{
    public class WorkLocationDto
    {
        public int ID { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string? LocationCode { get; set; }
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        [DefaultValue(true)]
        public bool IsActive { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
