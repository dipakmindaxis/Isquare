using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.LevelMaster
{
    public class LevelMasterDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Level Name is required.")]
        public string LevelName { get; set; } = string.Empty;

        public int LevelOrder { get; set; } = 1;

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        [DefaultValue(false)]   
        public bool IsDeleted { get; set; } = false;
    }

    public class CreateLevelMasterDto
    {
        [Required(ErrorMessage = "Level Name is required.")]
        public string LevelName { get; set; } = string.Empty;

        public int LevelOrder { get; set; } = 1;

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;
    }

    public class UpdateLevelMasterDto
    {
        [Required(ErrorMessage = "Level Name is required.")]
        public string LevelName { get; set; } = string.Empty;

        public int LevelOrder { get; set; }

        public bool IsActive { get; set; }
    }
}
