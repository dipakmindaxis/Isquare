using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Meeting
{
    public class VisitTypeDto
    {
        public int ID { get; set; }

        [Required]
        public string VisitTypeName { get; set; }

        public bool IsActive { get; set; }
    }
}