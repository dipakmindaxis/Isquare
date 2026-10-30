using CompanyPlatform.Core.Models.CRM.Company;
//using Microsoft.Extensions.Logging;
//using CompanyPlatform.CRM.DTO.Tasks;
//using CompanyPlatform.CRM.Repository;
//using CompanyPlatform.Core.Repository;

//namespace CompanyPlatform.CRM.Services.Tasks
//{
//    public class TaskService : ITaskService
//    {
//        private readonly IRepositories<Model.Tasks> _repository;
//        private readonly IRepositories<Model.TaskComment> _taskCommentRepository;
//        private readonly IRepositories<Model.TaskChecklist> _taskChecklistRepository;
//        private readonly ILogger<TaskService> _logger;

//        public TaskService(
//            IRepositories<Model.Tasks> repository,
//            IRepositories<Model.TaskComment> taskCommentRepository,
//            IRepositories<Model.TaskChecklist> taskChecklistRepository,
//            ILogger<TaskService> logger)
//        {
//            _repository = repository;
//            _taskCommentRepository = taskCommentRepository;
//            _taskChecklistRepository = taskChecklistRepository;
//            _logger = logger;
//        }

//        public async Task<IEnumerable<TaskDto>> GetAllTasksAsync()
//        {
//            _logger.LogInformation("Fetching all active tasks.");

//            var items = await _repository.GetAll();

//            return items
//                .Where(x => !x.IsDeleted)
//                .Select(x => new TaskDto
//                {
//                    TaskId = x.TaskId,
//                    CompanyId = x.CompanyId,
//                    TaskTitle = x.TaskTitle,
//                    Description = x.Description,
//                    AssignedTo = x.AssignedTo,
//                    AssignedBy = x.AssignedBy,
//                    PriorityId = x.PriorityId,
//                    TaskStatusId = x.TaskStatusId,
//                    StartDate = x.StartDate,
//                    DueDate = x.DueDate,
//                    CompletionDate = x.CompletionDate,
//                    ReminderId = x.ReminderId,
//                    Remarks = x.Remarks,
//                    CreatedBy = x.CreatedBy,
//                    UpdatedBy = x.UpdatedBy,
//                    IsDeleted = x.IsDeleted
//                });
//        }

//        public async Task<TaskDto> GetTaskByIdAsync(int id)
//        {
//            _logger.LogInformation("Fetching Task by ID : {TaskId}", id);

//            var item = await _repository.GetByIdAsync(id);

//            if (item == null || item.IsDeleted)
//                return null;

//            return new TaskDto
//            {
//                TaskId = item.TaskId,
//                CompanyId = item.CompanyId,
//                TaskTitle = item.TaskTitle,
//                Description = item.Description,
//                AssignedTo = item.AssignedTo,
//                AssignedBy = item.AssignedBy,
//                PriorityId = item.PriorityId,
//                TaskStatusId = item.TaskStatusId,
//                StartDate = item.StartDate,
//                DueDate = item.DueDate,
//                CompletionDate = item.CompletionDate,
//                ReminderId = item.ReminderId,
//                Remarks = item.Remarks,
//                CreatedBy = item.CreatedBy,
//                UpdatedBy = item.UpdatedBy,
//                IsDeleted = item.IsDeleted
//            };
//        }

//        public async Task<TaskDto> CreateTaskAsync(TaskDto dto)
//        {
//            _logger.LogInformation("Creating Task");

//            var task = new Model.Tasks
//            {
//                CompanyId = dto.CompanyId,
//                TaskTitle = dto.TaskTitle,
//                Description = dto.Description,
//                AssignedTo = dto.AssignedTo,
//                AssignedBy = dto.AssignedBy,
//                PriorityId = dto.PriorityId,
//                TaskStatusId = dto.TaskStatusId,
//                StartDate = dto.StartDate,
//                DueDate = dto.DueDate,
//                CompletionDate = dto.CompletionDate,
//                ReminderId = dto.ReminderId,
//                Remarks = dto.Remarks,
//                CreatedBy = dto.CreatedBy,
//                CreatedDate = DateTime.Now,
//                UpdatedBy = dto.UpdatedBy,
//                UpdatedDate = null,
//                IsDeleted = false
//            };

//            await _repository.Create(task);

//            dto.TaskId = task.TaskId;

//            return dto;
//        }

//        public async Task<bool> UpdateTaskAsync(int id, TaskDto dto)
//        {
//            _logger.LogInformation("Updating Task : {TaskId}", id);

//            var item = await _repository.GetByIdAsync(id);

//            if (item == null || item.IsDeleted)
//                return false;

//            item.CompanyId = dto.CompanyId;
//            item.TaskTitle = dto.TaskTitle;
//            item.Description = dto.Description;
//            item.AssignedTo = dto.AssignedTo;
//            item.AssignedBy = dto.AssignedBy;
//            item.PriorityId = dto.PriorityId;
//            item.TaskStatusId = dto.TaskStatusId;
//            item.StartDate = dto.StartDate;
//            item.DueDate = dto.DueDate;
//            item.CompletionDate = dto.CompletionDate;
//            item.ReminderId = dto.ReminderId;
//            item.Remarks = dto.Remarks;
//            item.UpdatedBy = dto.UpdatedBy;
//            item.UpdatedDate = DateTime.Now;

//            await _repository.Update(item);

//            return true;
//        }

//        public async Task<bool> DeleteTaskAsync(int id)
//        {
//            _logger.LogInformation("Deleting Task : {TaskId}", id);

//            var item = await _repository.GetByIdAsync(id);

//            if (item == null)
//                return false;

//            item.IsDeleted = true;

//            await _repository.Update(item);

//            return true;
//        }        // ================================
//        // Assign Task
//        // ================================
//        public async Task<bool> AssignTaskAsync(int taskId, AssignTaskDto dto)
//        {
//            _logger.LogInformation("Assigning Task : {TaskId}", taskId);

//            var task = await _repository.GetByIdAsync(taskId);

//            if (task == null || task.IsDeleted)
//                return false;

//            task.AssignedTo = dto.AssignedTo;
//            task.AssignedBy = dto.AssignedBy;
//            task.UpdatedDate = DateTime.Now;

//            await _repository.Update(task);

//            return true;
//        }

//        // ================================
//        // Complete Task
//        // ================================
//        public async Task<bool> CompleteTaskAsync(int taskId)
//        {
//            _logger.LogInformation("Completing Task : {TaskId}", taskId);

//            var task = await _repository.GetByIdAsync(taskId);

//            if (task == null || task.IsDeleted)
//                return false;

//            // Change this ID if your Completed status has a different ID
//            task.TaskStatusId = 2;

//            task.CompletionDate = DateTime.Now;
//            task.UpdatedDate = DateTime.Now;

//            await _repository.Update(task);

//            return true;
//        }

//        // ================================
//        // Task List
//        // ================================
//        public async Task<IEnumerable<TaskListDto>> GetTaskListAsync()
//        {
//            _logger.LogInformation("Fetching Task List");

//            var tasks = await _repository.GetAll();

//            return tasks
//                .Where(x => !x.IsDeleted)
//                .Select(x => new TaskListDto
//                {
//                    TaskId = x.TaskId,
//                    CompanyId = x.CompanyId,
//                    TaskTitle = x.TaskTitle,
//                    Description = x.Description,
//                    AssignedTo = x.AssignedTo,
//                    AssignedBy = x.AssignedBy,
//                    PriorityId = x.PriorityId,
//                    TaskStatusId = x.TaskStatusId,
//                    StartDate = x.StartDate,
//                    DueDate = x.DueDate,
//                    CompletionDate = x.CompletionDate,
//                    IsCompleted = x.CompletionDate != null
//                });
//        }

//        // ================================
//        // Task Details
//        // ================================
//        public async Task<TaskDetailsDto?> GetTaskDetailsAsync(int taskId)
//        {
//            _logger.LogInformation("Fetching Task Details : {TaskId}", taskId);

//            var task = await _repository.GetByIdAsync(taskId);

//            if (task == null || task.IsDeleted)
//                return null;

//            var comments = await _taskCommentRepository.GetAll();
//            var checklists = await _taskChecklistRepository.GetAll();

//            return new TaskDetailsDto
//            {
//                TaskId = task.TaskId,
//                CompanyId = task.CompanyId,
//                TaskTitle = task.TaskTitle,
//                Description = task.Description,
//                AssignedTo = task.AssignedTo,
//                AssignedBy = task.AssignedBy,
//                PriorityId = task.PriorityId,
//                TaskStatusId = task.TaskStatusId,
//                StartDate = task.StartDate,
//                DueDate = task.DueDate,
//                CompletionDate = task.CompletionDate,
//                ReminderId = task.ReminderId,
//                Remarks = task.Remarks,
//                CreatedBy = task.CreatedBy,
//                CreatedDate = task.CreatedDate,
//                UpdatedBy = task.UpdatedBy,
//                UpdatedDate = task.UpdatedDate,
//                IsDeleted = task.IsDeleted,

//                Comments = comments
//                    .Where(c => c.TaskId == taskId && !c.IsDeleted)
//                    .Select(c => new TaskCommentItemDto
//                    {
//                        CommentId = c.CommentId,
//                        Comment = c.Comment,
//                        CommentedBy = c.CommentedBy,
//                        CommentDate = c.CommentDate
//                    })
//                    .ToList(),

//                Checklists = checklists
//                    .Where(c => c.TaskId == taskId && !c.IsDeleted)
//                    .Select(c => new TaskChecklistItemDto
//                    {
//                        ChecklistId = c.ChecklistId,
//                        ChecklistItem = c.ChecklistItem,
//                        IsCompleted = c.IsCompleted,
//                        CompletedDate = c.CompletedDate
//                    })
//                    .ToList()
//            };
//        }
//    }
//}


using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Tasks;
using CompanyPlatform.Core.Repository;

using TasksEntity =
    CompanyPlatform.Core.Models.CRM.Company.Tasks;

using TaskCommentEntity =
    CompanyPlatform.Core.Models.CRM.Company.TaskComment;

using TaskChecklistEntity =
    CompanyPlatform.Core.Models.CRM.Company.TaskChecklist;

namespace CompanyPlatform.CRM.Services.Tasks
{
    public class TaskService : ITaskService
    {
        private readonly IRepositories<TasksEntity> _repository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.Company> _companyRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.Employee> _employeeRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.Priority> _priorityRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.TaskStatus> _taskStatusRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.Reminder> _reminderRepository;
        private readonly IRepositories<TaskCommentEntity> _taskCommentRepository;
        private readonly IRepositories<TaskChecklistEntity> _taskChecklistRepository;
        private readonly ILogger<TaskService> _logger;

        public TaskService(
            IRepositories<TasksEntity> repository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.Company> companyRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.Employee> employeeRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.Priority> priorityRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.TaskStatus> taskStatusRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.Reminder> reminderRepository,
            IRepositories<TaskCommentEntity> taskCommentRepository,
            IRepositories<TaskChecklistEntity> taskChecklistRepository,
            ILogger<TaskService> logger)
        {
            _repository = repository;
            _companyRepository = companyRepository;
            _employeeRepository = employeeRepository;
            _priorityRepository = priorityRepository;
            _taskStatusRepository = taskStatusRepository;
            _reminderRepository = reminderRepository;
            _taskCommentRepository = taskCommentRepository;
            _taskChecklistRepository = taskChecklistRepository;
            _logger = logger;
        }

        // ================================
        // Get All Tasks
        // ================================
        public async Task<IEnumerable<TaskDto>> GetAllTasksAsync()
        {
            _logger.LogInformation("Fetching all active tasks.");

            var items = await _repository.GetAll();

            return items
                .Where(x => !x.IsDeleted)
                .Select(x => new TaskDto
                {
                    TaskId = x.TaskId,
                    CompanyId = x.CompanyId,
                    TaskTitle = x.TaskTitle,
                    Description = x.Description,
                    AssignedTo = x.AssignedTo,
                    AssignedBy = x.AssignedBy,
                    PriorityId = x.PriorityId,
                    TaskStatusId = x.TaskStatusId,
                    StartDate = x.StartDate,
                    DueDate = x.DueDate,
                    CompletionDate = x.CompletionDate,
                    ReminderId = x.ReminderId,
                    Remarks = x.Remarks,
                    CreatedBy = x.CreatedBy,
                    UpdatedBy = x.UpdatedBy,
                    IsDeleted = x.IsDeleted
                });
        }

        // ================================
        // Get Task By ID
        // ================================
        public async Task<TaskDto?> GetTaskByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Task by ID : {TaskId}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return null;

            return new TaskDto
            {
                TaskId = item.TaskId,
                CompanyId = item.CompanyId,
                TaskTitle = item.TaskTitle,
                Description = item.Description,
                AssignedTo = item.AssignedTo,
                AssignedBy = item.AssignedBy,
                PriorityId = item.PriorityId,
                TaskStatusId = item.TaskStatusId,
                StartDate = item.StartDate,
                DueDate = item.DueDate,
                CompletionDate = item.CompletionDate,
                ReminderId = item.ReminderId,
                Remarks = item.Remarks,
                CreatedBy = item.CreatedBy,
                UpdatedBy = item.UpdatedBy,
                IsDeleted = item.IsDeleted
            };
        }

        // ================================
        // Create Task
        // ================================
        public async Task<TaskDto> CreateTaskAsync(TaskDto dto)
        {
            _logger.LogInformation("Creating Task");

            // Validate Foreign Keys
            var company = await _companyRepository.GetByIdAsync(dto.CompanyId);
            if (company == null)
                throw new KeyNotFoundException($"Company with ID {dto.CompanyId} not found.");

            var assignedTo = await _employeeRepository.GetByIdAsync(dto.AssignedTo);
            if (assignedTo == null || assignedTo.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.AssignedTo} (AssignedTo) not found.");

            var assignedBy = await _employeeRepository.GetByIdAsync(dto.AssignedBy);
            if (assignedBy == null || assignedBy.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.AssignedBy} (AssignedBy) not found.");

            var createdBy = await _employeeRepository.GetByIdAsync(dto.CreatedBy);
            if (createdBy == null || createdBy.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.CreatedBy} (CreatedBy) not found.");

            var priority = await _priorityRepository.GetByIdAsync(dto.PriorityId);
            if (priority == null)
                throw new KeyNotFoundException($"Priority with ID {dto.PriorityId} not found.");

            var status = await _taskStatusRepository.GetByIdAsync(dto.TaskStatusId);
            if (status == null || status.IsDeleted)
                throw new KeyNotFoundException($"TaskStatus with ID {dto.TaskStatusId} not found.");

            int? reminderId = null;
            if (dto.ReminderId.HasValue && dto.ReminderId.Value > 0)
            {
                var reminder = await _reminderRepository.GetByIdAsync(dto.ReminderId.Value);
                if (reminder == null || reminder.IsDeleted)
                    throw new KeyNotFoundException($"Reminder with ID {dto.ReminderId.Value} not found.");
                reminderId = dto.ReminderId.Value;
            }

            int? updatedBy = null;
            if (dto.UpdatedBy.HasValue && dto.UpdatedBy.Value > 0)
            {
                var emp = await _employeeRepository.GetByIdAsync(dto.UpdatedBy.Value);
                if (emp == null || emp.IsDeleted)
                    throw new KeyNotFoundException($"Employee with ID {dto.UpdatedBy.Value} (UpdatedBy) not found.");
                updatedBy = dto.UpdatedBy.Value;
            }

            var task = new TasksEntity
            {
                CompanyId = dto.CompanyId,
                TaskTitle = dto.TaskTitle,
                Description = dto.Description,
                AssignedTo = dto.AssignedTo,
                AssignedBy = dto.AssignedBy,
                PriorityId = dto.PriorityId,
                TaskStatusId = dto.TaskStatusId,
                StartDate = dto.StartDate,
                DueDate = dto.DueDate,
                CompletionDate = dto.CompletionDate,
                ReminderId = reminderId,
                Remarks = dto.Remarks,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                UpdatedBy = updatedBy,
                UpdatedDate = null,
                IsDeleted = false
            };

            await _repository.Create(task);

            dto.TaskId = task.TaskId;
            dto.ReminderId = task.ReminderId;
            dto.UpdatedBy = task.UpdatedBy;

            return dto;
        }

        // ================================
        // Update Task
        // ================================
        public async Task<bool> UpdateTaskAsync(
            int id,
            TaskDto dto)
        {
            _logger.LogInformation(
                "Updating Task : {TaskId}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return false;

            // Validate Foreign Keys
            var company = await _companyRepository.GetByIdAsync(dto.CompanyId);
            if (company == null)
                throw new KeyNotFoundException($"Company with ID {dto.CompanyId} not found.");

            var assignedTo = await _employeeRepository.GetByIdAsync(dto.AssignedTo);
            if (assignedTo == null || assignedTo.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.AssignedTo} (AssignedTo) not found.");

            var assignedBy = await _employeeRepository.GetByIdAsync(dto.AssignedBy);
            if (assignedBy == null || assignedBy.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.AssignedBy} (AssignedBy) not found.");

            var priority = await _priorityRepository.GetByIdAsync(dto.PriorityId);
            if (priority == null)
                throw new KeyNotFoundException($"Priority with ID {dto.PriorityId} not found.");

            var status = await _taskStatusRepository.GetByIdAsync(dto.TaskStatusId);
            if (status == null || status.IsDeleted)
                throw new KeyNotFoundException($"TaskStatus with ID {dto.TaskStatusId} not found.");

            int? reminderId = null;
            if (dto.ReminderId.HasValue && dto.ReminderId.Value > 0)
            {
                var reminder = await _reminderRepository.GetByIdAsync(dto.ReminderId.Value);
                if (reminder == null || reminder.IsDeleted)
                    throw new KeyNotFoundException($"Reminder with ID {dto.ReminderId.Value} not found.");
                reminderId = dto.ReminderId.Value;
            }

            int? updatedBy = null;
            if (dto.UpdatedBy.HasValue && dto.UpdatedBy.Value > 0)
            {
                var emp = await _employeeRepository.GetByIdAsync(dto.UpdatedBy.Value);
                if (emp == null || emp.IsDeleted)
                    throw new KeyNotFoundException($"Employee with ID {dto.UpdatedBy.Value} (UpdatedBy) not found.");
                updatedBy = dto.UpdatedBy.Value;
            }

            item.CompanyId = dto.CompanyId;
            item.TaskTitle = dto.TaskTitle;
            item.Description = dto.Description;
            item.AssignedTo = dto.AssignedTo;
            item.AssignedBy = dto.AssignedBy;
            item.PriorityId = dto.PriorityId;
            item.TaskStatusId = dto.TaskStatusId;
            item.StartDate = dto.StartDate;
            item.DueDate = dto.DueDate;
            item.CompletionDate = dto.CompletionDate;
            item.ReminderId = reminderId;
            item.Remarks = dto.Remarks;
            item.UpdatedBy = updatedBy;
            item.UpdatedDate = DateTime.Now;

            await _repository.Update(item);

            return true;
        }

        // ================================
        // Delete Task
        // ================================
        public async Task<bool> DeleteTaskAsync(int id)
        {
            _logger.LogInformation(
                "Deleting Task : {TaskId}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null)
                return false;

            item.IsDeleted = true;

            await _repository.Update(item);

            return true;
        }

        // ================================
        // Assign Task
        // ================================
        public async Task<bool> AssignTaskAsync(
            int taskId,
            AssignTaskDto dto)
        {
            _logger.LogInformation(
                "Assigning Task : {TaskId}",
                taskId);

            var task = await _repository.GetByIdAsync(taskId);

            if (task == null || task.IsDeleted)
                return false;

            var assignedTo = await _employeeRepository.GetByIdAsync(dto.AssignedTo);
            if (assignedTo == null || assignedTo.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.AssignedTo} (AssignedTo) not found.");

            var assignedBy = await _employeeRepository.GetByIdAsync(dto.AssignedBy);
            if (assignedBy == null || assignedBy.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.AssignedBy} (AssignedBy) not found.");

            task.AssignedTo = dto.AssignedTo;
            task.AssignedBy = dto.AssignedBy;
            task.UpdatedDate = DateTime.Now;

            await _repository.Update(task);

            return true;
        }

        // ================================
        // Complete Task
        // ================================
        public async Task<bool> CompleteTaskAsync(int taskId)
        {
            _logger.LogInformation(
                "Completing Task : {TaskId}",
                taskId);

            var task = await _repository.GetByIdAsync(taskId);

            if (task == null || task.IsDeleted)
                return false;

            // Find completed status if configured, or ID 2, or keep current
            var statuses = await _taskStatusRepository.GetAll();
            var completedStatus = statuses.FirstOrDefault(s => !s.IsDeleted && (s.StatusName.Equals("Completed", StringComparison.OrdinalIgnoreCase) || s.ID == 2));
            if (completedStatus != null)
            {
                task.TaskStatusId = completedStatus.ID;
            }

            task.CompletionDate = DateTime.Now;
            task.UpdatedDate = DateTime.Now;

            await _repository.Update(task);

            return true;
        }

        // ================================
        // Task List
        // ================================
        public async Task<IEnumerable<TaskListDto>> GetTaskListAsync()
        {
            _logger.LogInformation("Fetching Task List");

            var tasks = await _repository.GetAll();

            return tasks
                .Where(x => !x.IsDeleted)
                .Select(x => new TaskListDto
                {
                    TaskId = x.TaskId,
                    CompanyId = x.CompanyId,
                    TaskTitle = x.TaskTitle,
                    Description = x.Description,
                    AssignedTo = x.AssignedTo,
                    AssignedBy = x.AssignedBy,
                    PriorityId = x.PriorityId,
                    TaskStatusId = x.TaskStatusId,
                    StartDate = x.StartDate,
                    DueDate = x.DueDate,
                    CompletionDate = x.CompletionDate,
                    IsCompleted = x.CompletionDate != null
                });
        }

        // ================================
        // Task Details
        // ================================
        public async Task<TaskDetailsDto?> GetTaskDetailsAsync(
            int taskId)
        {
            _logger.LogInformation(
                "Fetching Task Details : {TaskId}",
                taskId);

            var task = await _repository.GetByIdAsync(taskId);

            if (task == null || task.IsDeleted)
                return null;

            var comments = await _taskCommentRepository.GetAll();
            var checklists = await _taskChecklistRepository.GetAll();

            return new TaskDetailsDto
            {
                TaskId = task.TaskId,
                CompanyId = task.CompanyId,
                TaskTitle = task.TaskTitle,
                Description = task.Description,
                AssignedTo = task.AssignedTo,
                AssignedBy = task.AssignedBy,
                PriorityId = task.PriorityId,
                TaskStatusId = task.TaskStatusId,
                StartDate = task.StartDate,
                DueDate = task.DueDate,
                CompletionDate = task.CompletionDate,
                ReminderId = task.ReminderId,
                Remarks = task.Remarks,
                CreatedBy = task.CreatedBy,
                CreatedDate = task.CreatedDate,
                UpdatedBy = task.UpdatedBy,
                UpdatedDate = task.UpdatedDate,
                IsDeleted = task.IsDeleted,

                Comments = comments
                    .Where(c =>
                        c.TaskId == taskId &&
                        !c.IsDeleted)
                    .Select(c => new TaskCommentItemDto
                    {
                        CommentId = c.CommentId,
                        Comment = c.Comment,
                        CommentedBy = c.CommentedBy,
                        CommentDate = c.CommentDate
                    })
                    .ToList(),

                Checklists = checklists
                    .Where(c =>
                        c.TaskId == taskId &&
                        !c.IsDeleted)
                    .Select(c => new TaskChecklistItemDto
                    {
                        ChecklistId = c.ChecklistId,
                        ChecklistItem = c.ChecklistItem,
                        IsCompleted = c.IsCompleted,
                        CompletedDate = c.CompletedDate
                    })
                    .ToList()
            };
        }
    }
}
