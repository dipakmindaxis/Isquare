using System.ComponentModel;

namespace CompanyPlatform.Core.DTO.EmployeeBankDetails
{
    public class CreateEmployeeBankDetailsDto
    {
        public string AccountHolderName { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string IFSCCode { get; set; } = string.Empty;
        public int EmployeeID { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
