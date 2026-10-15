//using Microsoft.Extensions.Logging;
//using CompanyPlatform.CRM.DTO.TaskChecklists;
//using CompanyPlatform.Core.Repository;

//namespace CompanyPlatform.CRM.Services.TaskChecklists
//{
//    public class TaskChecklistService : ITaskChecklistService
//    {
//        private readonly IRepositories<Model.TaskChecklist> _repository;
//        private readonly ILogger<TaskChecklistService> _logger;

//        public TaskChecklistService(
//            IRepositories<Model.TaskChecklist> repository,
//            ILogger<TaskChecklistService> logger)
//        {
//            _repository = repository;
//            _logger = logger;
//        }

//        public async Task<IEnumerable<TaskChecklistDto>> GetAllTaskChecklistsAsync()
//        {
//            _logger.LogInformation("Fetching all Task Checklists.");

//            var checklists = await _repository.GetAll();

//            return checklists
//                .Where(x => !x.IsDeleted)
//                .Select(x => new TaskChecklistDto
//                {
//                    ChecklistId = x.ChecklistId,
//                    TaskId = x.TaskId,
//                    ChecklistItem = x.ChecklistItem,
//                    IsCompleted = x.IsCompleted,
//                    CompletedDate = x.CompletedDate,
//                    IsDeleted = x.IsDeleted
//                });
//        }

//        public async Task<TaskChecklistDto> GetTaskChecklistByIdAsync(int id)
//        {
//            _logger.LogInformation("Fetching Task Checklist : {ChecklistId}", id);

//            var checklist = await _repository.GetByIdAsync(id);

//            if (checklist == null || checklist.IsDeleted)
//                return null;

//            return new TaskChecklistDto
//            {
//                ChecklistId = checklist.ChecklistId,
//                TaskId = checklist.TaskId,
//                ChecklistItem = checklist.ChecklistItem,
//                IsCompleted = checklist.IsCompleted,
//                CompletedDate = checklist.CompletedDate,
//                IsDeleted = checklist.IsDeleted
//            };
//        }

//        public async Task<TaskChecklistDto> CreateTaskChecklistAsync(TaskChecklistDto dto)
//        {
//            _logger.LogInformation("Creating Task Checklist.");

//            var checklist = new Model.TaskChecklist
//            {
//                TaskId = dto.TaskId,
//                ChecklistItem = dto.ChecklistItem,
//                IsCompleted = dto.IsCompleted,
//                CompletedDate = dto.IsCompleted ? DateTime.Now : null,
//                IsDeleted = false
//            };

//            await _repository.Create(checklist);

//            dto.ChecklistId = checklist.ChecklistId;
//            dto.CompletedDate = checklist.CompletedDate;

//            return dto;
//        }

//        public async Task<bool> UpdateTaskChecklistAsync(int id, TaskChecklistDto dto)
//        {
//            _logger.LogInformation("Updating Task Checklist : {ChecklistId}", id);

//            var checklist = await _repository.GetByIdAsync(id);

//            if (checklist == null || checklist.IsDeleted)
//                return false;

//            checklist.TaskId = dto.TaskId;
//            checklist.ChecklistItem = dto.ChecklistItem;
//            checklist.IsCompleted = dto.IsCompleted;
//            checklist.CompletedDate = dto.IsCompleted ? DateTime.Now : null;

//            await _repository.Update(checklist);

//            return true;
//        }

//        public async Task<bool> DeleteTaskChecklistAsync(int id)
//        {
//            _logger.LogInformation("Deleting Task Checklist : {ChecklistId}", id);

//            var checklist = await _repository.GetByIdAsync(id);

//            if (checklist == null)
//                return false;

//            checklist.IsDeleted = true;

//            await _repository.Update(checklist);

//            return true;
//        }
//    }
//}

using Microsoft.Extensions.Logging;

using CompanyPlatform.CRM.DTO.TaskChecklists;
using CompanyPlatform.Core.Repository;

using TaskChecklistEntity =
    CompanyPlatform.Core.Models.CRM.Company.TaskChecklist;

using TasksEntity =
    CompanyPlatform.Core.Models.CRM.Company.Tasks;

namespace CompanyPlatform.CRM.Services.TaskChecklists
{
    public class TaskChecklistService : ITaskChecklistService
    {
        private readonly IRepositories<TaskChecklistEntity> _repository;
        private readonly IRepositories<TasksEntity> _taskRepository;
        private readonly ILogger<TaskChecklistService> _logger;

        public TaskChecklistService(
            IRepositories<TaskChecklistEntity> repository,
            IRepositories<TasksEntity> taskRepository,
            ILogger<TaskChecklistService> logger)
        {
            _repository = repository;
            _taskRepository = taskRepository;
            _logger = logger;
        }

        // ============================================================
        // GET ALL
        // ============================================================

        public async Task<IEnumerable<TaskChecklistDto>>
            GetAllTaskChecklistsAsync()
        {
            _logger.LogInformation(
                "Fetching all Task Checklists.");

            var checklists =
                await _repository.GetAll();

            return checklists
                .Where(x => !x.IsDeleted)
                .Select(x => new TaskChecklistDto
                {
                    ChecklistId = x.ChecklistId,
                    TaskId = x.TaskId,
                    ChecklistItem = x.ChecklistItem,
                    IsCompleted = x.IsCompleted,
                    CompletedDate = x.CompletedDate,
                    IsDeleted = x.IsDeleted
                });
        }

        // ============================================================
        // GET BY ID
        // ============================================================

        public async Task<TaskChecklistDto?>
            GetTaskChecklistByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Task Checklist : {ChecklistId}",
                id);

            var checklist =
                await _repository.GetByIdAsync(id);

            if (checklist == null ||
                checklist.IsDeleted)
            {
                return null;
            }

            return new TaskChecklistDto
            {
                ChecklistId = checklist.ChecklistId,
                TaskId = checklist.TaskId,
                ChecklistItem = checklist.ChecklistItem,
                IsCompleted = checklist.IsCompleted,
                CompletedDate = checklist.CompletedDate,
                IsDeleted = checklist.IsDeleted
            };
        }

        // ============================================================
        // CREATE
        // ============================================================

        public async Task<TaskChecklistDto>
            CreateTaskChecklistAsync(TaskChecklistDto dto)
        {
            _logger.LogInformation(
                "Creating Task Checklist.");

            var task = await _taskRepository.GetByIdAsync(dto.TaskId);
            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException($"Task with ID {dto.TaskId} not found.");
            }

            var checklist = new TaskChecklistEntity
            {
                TaskId = dto.TaskId,
                ChecklistItem = dto.ChecklistItem,
                IsCompleted = dto.IsCompleted,

                CompletedDate =
                    dto.IsCompleted
                        ? DateTime.Now
                        : null,

                IsDeleted = false
            };

            await _repository.Create(checklist);

            dto.ChecklistId = checklist.ChecklistId;
            dto.CompletedDate = checklist.CompletedDate;
            dto.IsDeleted = checklist.IsDeleted;

            return dto;
        }

        // ============================================================
        // UPDATE
        // ============================================================

        public async Task<bool>
            UpdateTaskChecklistAsync(
                int id,
                TaskChecklistDto dto)
        {
            _logger.LogInformation(
                "Updating Task Checklist : {ChecklistId}",
                id);

            var checklist =
                await _repository.GetByIdAsync(id);

            if (checklist == null ||
                checklist.IsDeleted)
            {
                return false;
            }

            var task = await _taskRepository.GetByIdAsync(dto.TaskId);
            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException($"Task with ID {dto.TaskId} not found.");
            }

            checklist.TaskId = dto.TaskId;
            checklist.ChecklistItem = dto.ChecklistItem;
            checklist.IsCompleted = dto.IsCompleted;

            checklist.CompletedDate =
                dto.IsCompleted
                    ? DateTime.Now
                    : null;

            await _repository.Update(checklist);

            _logger.LogInformation(
                "Successfully updated Task Checklist : {ChecklistId}",
                id);

            return true;
        }

        // ============================================================
        // DELETE - SOFT DELETE
        // ============================================================

        public async Task<bool>
            DeleteTaskChecklistAsync(int id)
        {
            _logger.LogInformation(
                "Deleting Task Checklist : {ChecklistId}",
                id);

            var checklist =
                await _repository.GetByIdAsync(id);

            if (checklist == null ||
                checklist.IsDeleted)
            {
                return false;
            }

            checklist.IsDeleted = true;

            await _repository.Update(checklist);

            _logger.LogInformation(
                "Successfully deleted Task Checklist : {ChecklistId}",
                id);

            return true;
        }
    }
}