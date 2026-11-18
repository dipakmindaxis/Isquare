namespace CompanyPlatform.Core.DTO.Employee
{
    public class EmployeeSelectionDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string EmployeeCode { get; set; } = string.Empty; 
        public string Designation { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;

        public decimal PFDeductionPercentage { get; set; }

        public string State { get; set; } = string.Empty;

        public bool IsCappedAt15k { get; set; }

        public decimal TDSAmount { get; set; }

        public int? LevelID { get; set; }
        public string? LevelName { get; set; }

        public int? LevelOrder { get; set; }

    }
}
