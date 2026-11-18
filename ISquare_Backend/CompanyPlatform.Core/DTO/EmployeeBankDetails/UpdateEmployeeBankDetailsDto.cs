using System.ComponentModel;

namespace CompanyPlatform.Core.DTO.EmployeeBankDetails
{
    public class UpdateEmployeeBankDetailsDto
    {
        public string BeneficiaryName { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string IFSCCode { get; set; } = string.Empty;
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }


    }
}
