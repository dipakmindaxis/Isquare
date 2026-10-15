using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.TaskComments
{
    public class TaskCommentDto
    {
        public int CommentId { get; set; }

        [Required(ErrorMessage = "Task is required.")]
        public int TaskId { get; set; }

        [Required(ErrorMessage = "Comment is required.")]
        public string Comment { get; set; } = string.Empty;

        [Required(ErrorMessage = "Commented By is required.")]
        public int CommentedBy { get; set; }

        public DateTime CommentDate { get; set; }

        public bool IsDeleted { get; set; }
    }
}