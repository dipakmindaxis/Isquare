using System.ComponentModel;

namespace CompanyPlatform.Core.DTO.EmployeeBankDetails
{
    public class EmployeeBankFullResponseDto
    {
        public EmployeeInfoDto Employee { get; set; } = new();
        public EmployeeBankDetailsDto? BankDetails { get; set; }
    }

    public class EmployeeInfoDto
    {
        public int ID { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string EmailAddress { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
