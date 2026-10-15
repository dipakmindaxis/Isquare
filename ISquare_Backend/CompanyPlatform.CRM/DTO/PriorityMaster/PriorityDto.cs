using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
namespace CompanyPlatform.Core.DTO.PriorityMaster
{
    public class PriorityDto
    {
        public int Id { get; set; }

        public string PriorityName { get; set; } = string.Empty;

        public string ColorCode { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }
}

