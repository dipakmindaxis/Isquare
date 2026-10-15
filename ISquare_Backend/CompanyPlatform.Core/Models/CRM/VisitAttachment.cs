using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_VisitAttachment")]
    public class VisitAttachment
    {
        [Key]
        public int AttachmentId { get; set; }

        [Required]
        public int VisitId { get; set; }

        [Required]
        public string DocumentName { get; set; }

        [Required]
        public string FileName { get; set; }

        [Required]
        public string FilePath { get; set; }

        [Required]
        public string FileExtension { get; set; }

        public long FileSize { get; set; }

        public int UploadedBy { get; set; }

        public DateTime UploadedDate { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        // Navigation Property

        [ForeignKey("VisitId")]
        public virtual CompanyVisit? CompanyVisit { get; set; }
    }
}