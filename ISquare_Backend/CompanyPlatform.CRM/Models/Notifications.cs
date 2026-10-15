//using CompanyPlatform.Core.Models.CRM.Employee;
//using System;
//using System.Collections.Generic;
//using System.ComponentModel.DataAnnotations;
//using System.ComponentModel.DataAnnotations.Schema;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.Models
//{
//    internal class Notifications
//    {
//        [Key]
//        public int Id { get; set; }

//        [Required]
//        public int EmployeeId { get; set; }
//        [ForeignKey("EmployeeId")]
//        public Employee Employee { get; set; }

//        [Required]
//        public string Message { get; set; }

//        public bool IsRead { get; set; } = false;

//        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

//        public DateTime? ReadAt { get; set; }

//        public string? EntityType { get; set; }

//        public int? EntityId { get; set; }
//    }
//}




//using CompanyPlatform.Core.Models.CRM.Employee;
//using System.ComponentModel.DataAnnotations;
//using System.ComponentModel.DataAnnotations.Schema;

//namespace CompanyPlatform.CRM.Models
//{
//    public class Notifications
//    {
//        [Key]
//        public int Id { get; set; }

//        [Required]
//        public int EmployeeId { get; set; }

//        [ForeignKey(nameof(EmployeeId))]
//        public virtual Employees? Employee { get; set; }

//        [Required]
//        public string Message { get; set; } = string.Empty;

//        public bool IsRead { get; set; } = false;

//        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

//        public DateTime? ReadAt { get; set; }

//        public string? EntityType { get; set; }

//        public int? EntityId { get; set; }
//    }
//}