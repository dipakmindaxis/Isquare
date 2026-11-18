namespace CompanyPlatform.Core.DTO.EmployeeBankDetails
{
    public class EmployeeBankDetailsDto
    {
        public int ID { get; set; }
        public string AccountHolderName { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string IFSCCode { get; set; } = string.Empty;
        public int EmployeeID { get; set; }
        public bool IsDeleted { get; set; }

    }
}
