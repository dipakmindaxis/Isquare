//using Microsoft.Extensions.Logging;
//using CompanyPlatform.CRM.DTO.TaskComments;
//using CompanyPlatform.CRM.Repository;
//using CompanyPlatform.Core.Repository;

//namespace CompanyPlatform.CRM.Services.TaskComments
//{
//    public class TaskCommentService : ITaskCommentService
//    {
//        private readonly IRepositories<Model.TaskComment> _repository;
//        private readonly ILogger<TaskCommentService> _logger;

//        public TaskCommentService(
//            IRepositories<Model.TaskComment> repository,
//            ILogger<TaskCommentService> logger)
//        {
//            _repository = repository;
//            _logger = logger;
//        }

//        public async Task<IEnumerable<TaskCommentDto>> GetAllTaskCommentsAsync()
//        {
//            _logger.LogInformation("Fetching all Task Comments.");

//            var comments = await _repository.GetAll();

//            return comments
//                .Where(x => !x.IsDeleted)
//                .Select(x => new TaskCommentDto
//                {
//                    CommentId = x.CommentId,
//                    TaskId = x.TaskId,
//                    Comment = x.Comment,
//                    CommentedBy = x.CommentedBy,
//                    CommentDate = x.CommentDate,
//                    IsDeleted = x.IsDeleted
//                });
//        }

//        public async Task<TaskCommentDto> GetTaskCommentByIdAsync(int id)
//        {
//            _logger.LogInformation("Fetching Task Comment : {CommentId}", id);

//            var comment = await _repository.GetByIdAsync(id);

//            if (comment == null || comment.IsDeleted)
//                return null;

//            return new TaskCommentDto
//            {
//                CommentId = comment.CommentId,
//                TaskId = comment.TaskId,
//                Comment = comment.Comment,
//                CommentedBy = comment.CommentedBy,
//                CommentDate = comment.CommentDate,
//                IsDeleted = comment.IsDeleted
//            };
//        }

//        public async Task<TaskCommentDto> CreateTaskCommentAsync(TaskCommentDto dto)
//        {
//            _logger.LogInformation("Creating Task Comment.");

//            var comment = new Model.TaskComment
//            {
//                TaskId = dto.TaskId,
//                Comment = dto.Comment,
//                CommentedBy = dto.CommentedBy,
//                CommentDate = DateTime.Now,
//                IsDeleted = false
//            };

//            await _repository.Create(comment);

//            dto.CommentId = comment.CommentId;
//            dto.CommentDate = comment.CommentDate;

//            return dto;
//        }

//        public async Task<bool> UpdateTaskCommentAsync(int id, TaskCommentDto dto)
//        {
//            _logger.LogInformation("Updating Task Comment : {CommentId}", id);

//            var comment = await _repository.GetByIdAsync(id);

//            if (comment == null || comment.IsDeleted)
//                return false;

//            comment.TaskId = dto.TaskId;
//            comment.Comment = dto.Comment;
//            comment.CommentedBy = dto.CommentedBy;

//            await _repository.Update(comment);

//            return true;
//        }

//        public async Task<bool> DeleteTaskCommentAsync(int id)
//        {
//            _logger.LogInformation("Deleting Task Comment : {CommentId}", id);

//            var comment = await _repository.GetByIdAsync(id);

//            if (comment == null)
//                return false;

//            comment.IsDeleted = true;

//            await _repository.Update(comment);

//            return true;
//        }
//    }
//}

using Microsoft.Extensions.Logging;

using CompanyPlatform.CRM.DTO.TaskComments;
using CompanyPlatform.Core.Repository;

using TaskCommentEntity =
    CompanyPlatform.Core.Models.CRM.Company.TaskComment;

using TasksEntity =
    CompanyPlatform.Core.Models.CRM.Company.Tasks;

using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace CompanyPlatform.CRM.Services.TaskComments
{
    public class TaskCommentService : ITaskCommentService
    {
        private readonly IRepositories<TaskCommentEntity> _repository;
        private readonly IRepositories<TasksEntity> _taskRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Employee.Employees> _employeeRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<TaskCommentService> _logger;

        public TaskCommentService(
            IRepositories<TaskCommentEntity> repository,
            IRepositories<TasksEntity> taskRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Employee.Employees> employeeRepository,
            IHttpContextAccessor httpContextAccessor,
            ILogger<TaskCommentService> logger)
        {
            _repository = repository;
            _taskRepository = taskRepository;
            _employeeRepository = employeeRepository;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        // ============================================================
        // GET ALL
        // ============================================================

        public async Task<IEnumerable<TaskCommentDto>>
            GetAllTaskCommentsAsync()
        {
            _logger.LogInformation(
                "Fetching all Task Comments.");

            var comments =
                await _repository.GetAll();

            return comments
                .Where(x => !x.IsDeleted)
                .Select(x => new TaskCommentDto
                {
                    CommentId = x.CommentId,
                    TaskId = x.TaskId,
                    Comment = x.Comment,
                    CommentedBy = x.CommentedBy,
                    CommentDate = x.CommentDate,
                    IsDeleted = x.IsDeleted
                });
        }

        // ============================================================
        // GET BY ID
        // ============================================================

        public async Task<TaskCommentDto?>
            GetTaskCommentByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Task Comment : {CommentId}",
                id);

            var comment =
                await _repository.GetByIdAsync(id);

            if (comment == null ||
                comment.IsDeleted)
            {
                return null;
            }

            return new TaskCommentDto
            {
                CommentId = comment.CommentId,
                TaskId = comment.TaskId,
                Comment = comment.Comment,
                CommentedBy = comment.CommentedBy,
                CommentDate = comment.CommentDate,
                IsDeleted = comment.IsDeleted
            };
        }

        // ============================================================
        // CREATE
        // ============================================================

        public async Task<TaskCommentDto>
            CreateTaskCommentAsync(TaskCommentDto dto)
        {
            _logger.LogInformation(
                "Creating Task Comment.");

            var task = await _taskRepository.GetByIdAsync(dto.TaskId);
            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException($"Task with ID {dto.TaskId} not found.");
            }

            var claim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("EmployeeId");
            int commentedBy = dto.CommentedBy > 0 ? dto.CommentedBy : (int.TryParse(claim, out var cid) && cid > 0 ? cid : task.AssignedBy);

            var emp = await _employeeRepository.GetByIdAsync(commentedBy);
            if (emp == null || emp.IsDeleted)
            {
                if (task.AssignedBy > 0) commentedBy = task.AssignedBy;
                else if (task.CreatedBy > 0) commentedBy = task.CreatedBy;
                else throw new KeyNotFoundException($"Employee with ID {commentedBy} (CommentedBy) not found.");
            }

            var comment = new TaskCommentEntity
            {
                TaskId = dto.TaskId,
                Comment = dto.Comment,
                CommentedBy = commentedBy,
                CommentDate = DateTime.Now,
                IsDeleted = false
            };

            await _repository.Create(comment);

            dto.CommentId = comment.CommentId;
            dto.CommentedBy = comment.CommentedBy;
            dto.CommentDate = comment.CommentDate;
            dto.IsDeleted = comment.IsDeleted;

            return dto;
        }

        // ============================================================
        // UPDATE
        // ============================================================

        public async Task<bool>
            UpdateTaskCommentAsync(
                int id,
                TaskCommentDto dto)
        {
            _logger.LogInformation(
                "Updating Task Comment : {CommentId}",
                id);

            var comment =
                await _repository.GetByIdAsync(id);

            if (comment == null ||
                comment.IsDeleted)
            {
                return false;
            }

            var task = await _taskRepository.GetByIdAsync(dto.TaskId);
            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException($"Task with ID {dto.TaskId} not found.");
            }

            var emp = await _employeeRepository.GetByIdAsync(dto.CommentedBy);
            if (emp == null || emp.IsDeleted)
            {
                throw new KeyNotFoundException($"Employee with ID {dto.CommentedBy} (CommentedBy) not found.");
            }

            comment.TaskId = dto.TaskId;
            comment.Comment = dto.Comment;
            comment.CommentedBy = dto.CommentedBy;

            await _repository.Update(comment);

            _logger.LogInformation(
                "Successfully updated Task Comment : {CommentId}",
                id);

            return true;
        }

        // ============================================================
        // DELETE - SOFT DELETE
        // ============================================================

        public async Task<bool>
            DeleteTaskCommentAsync(int id)
        {
            _logger.LogInformation(
                "Deleting Task Comment : {CommentId}",
                id);

            var comment =
                await _repository.GetByIdAsync(id);

            if (comment == null ||
                comment.IsDeleted)
            {
                return false;
            }

            comment.IsDeleted = true;

            await _repository.Update(comment);

            _logger.LogInformation(
                "Successfully deleted Task Comment : {CommentId}",
                id);

            return true;
        }
    }
}