using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO.Tasks;
using CompanyPlatform.Core.Repository;
using TasksEntity = CompanyPlatform.Core.Models.CRM.Tasks;
using TaskCommentEntity = CompanyPlatform.Core.Models.CRM.TaskComment;
using TaskChecklistEntity = CompanyPlatform.Core.Models.CRM.TaskChecklist;

namespace CompanyPlatform.CRM.Services.Tasks
{
    public class TaskService : ITaskService
    {
        private readonly IRepositories<TasksEntity> _repository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company> _companyRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Employee.Employee> _employeeRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Priority> _priorityRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.TaskStatus> _taskStatusRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Reminder> _reminderRepository;
        private readonly IRepositories<TaskCommentEntity> _taskCommentRepository;
        private readonly IRepositories<TaskChecklistEntity> _taskChecklistRepository;
        private readonly ILogger<TaskService> _logger;

        public TaskService(
            IRepositories<TasksEntity> repository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Company> companyRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Employee.Employee> employeeRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Priority> priorityRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.TaskStatus> taskStatusRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Reminder> reminderRepository,
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
            var employees = await _employeeRepository.GetAll();

            return items
                .Where(x => !x.IsDeleted)
                .Select(x =>
                {
                    var assignedByEmp = employees.FirstOrDefault(e => e.ID == x.AssignedBy && !e.IsDeleted);
                    var assignedToEmp = employees.FirstOrDefault(e => e.ID == x.AssignedTo && !e.IsDeleted);

                    return new TaskDto
                    {
                        TaskId = x.TaskId,
                        CompanyId = x.CompanyId,
                        TaskTitle = x.TaskTitle,
                        Description = x.Description,
                        AssignedTo = x.AssignedTo,
                        AssignedToName = assignedToEmp != null ? $"{assignedToEmp.FirstName} {assignedToEmp.LastName}".Trim() : null,
                        AssignedBy = x.AssignedBy,
                        AssignedByName = assignedByEmp != null ? $"{assignedByEmp.FirstName} {assignedByEmp.LastName}".Trim() : null,
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
                    };
                });
        }

        // ================================
        // Get Task By ID
        // ================================
        public async Task<TaskDto?> GetTaskByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Task by ID : {TaskId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return null;

            var assignedByEmp = item.AssignedBy > 0 ? await _employeeRepository.GetByIdAsync(item.AssignedBy) : null;
            var assignedToEmp = item.AssignedTo > 0 ? await _employeeRepository.GetByIdAsync(item.AssignedTo) : null;

            return new TaskDto
            {
                TaskId = item.TaskId,
                CompanyId = item.CompanyId,
                TaskTitle = item.TaskTitle,
                Description = item.Description,
                AssignedTo = item.AssignedTo,
                AssignedToName = assignedToEmp != null ? $"{assignedToEmp.FirstName} {assignedToEmp.LastName}".Trim() : null,
                AssignedBy = item.AssignedBy,
                AssignedByName = assignedByEmp != null ? $"{assignedByEmp.FirstName} {assignedByEmp.LastName}".Trim() : null,
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

            // 1. Validate Company (Fallback safely if ID not found)
            var company = dto.CompanyId > 0 ? await _companyRepository.GetByIdAsync(dto.CompanyId) : null;
            if (company == null)
            {
                var allCompanies = await _companyRepository.GetAll();
                var firstComp = allCompanies.FirstOrDefault();
                if (firstComp != null)
                {
                    dto.CompanyId = firstComp.CompanyId;
                }
            }

            // 2. Validate Employees (AssignedTo, AssignedBy, CreatedBy)
            var allEmployees = await _employeeRepository.GetAll();
            var activeEmployees = allEmployees.Where(e => !e.IsDeleted).ToList();
            var defaultEmp = activeEmployees.FirstOrDefault() ?? allEmployees.FirstOrDefault();

            var assignedTo = dto.AssignedTo > 0 ? await _employeeRepository.GetByIdAsync(dto.AssignedTo) : null;
            if (assignedTo == null || assignedTo.IsDeleted)
            {
                if (defaultEmp != null) dto.AssignedTo = defaultEmp.ID;
            }

            var assignedBy = dto.AssignedBy > 0 ? await _employeeRepository.GetByIdAsync(dto.AssignedBy) : null;
            if (assignedBy == null || assignedBy.IsDeleted)
            {
                if (defaultEmp != null) dto.AssignedBy = defaultEmp.ID;
            }

            var createdBy = dto.CreatedBy > 0 ? await _employeeRepository.GetByIdAsync(dto.CreatedBy) : null;
            if (createdBy == null || createdBy.IsDeleted)
            {
                if (defaultEmp != null) dto.CreatedBy = defaultEmp.ID;
            }

            // 3. Validate Priority
            var priority = dto.PriorityId > 0 ? await _priorityRepository.GetByIdAsync(dto.PriorityId) : null;
            if (priority == null)
            {
                var allPriorities = await _priorityRepository.GetAll();
                var defaultPriority = allPriorities.FirstOrDefault();
                if (defaultPriority != null) dto.PriorityId = defaultPriority.Id;
            }

            // 4. Validate TaskStatus
            var status = dto.TaskStatusId > 0 ? await _taskStatusRepository.GetByIdAsync(dto.TaskStatusId) : null;
            if (status == null || status.IsDeleted)
            {
                var allStatuses = await _taskStatusRepository.GetAll();
                var defaultStatus = allStatuses.FirstOrDefault(s => !s.IsDeleted) ?? allStatuses.FirstOrDefault();
                if (defaultStatus != null) dto.TaskStatusId = defaultStatus.ID;
            }

            // 5. Optional Reminder
            int? reminderId = null;
            if (dto.ReminderId.HasValue && dto.ReminderId.Value > 0)
            {
                var reminder = await _reminderRepository.GetByIdAsync(dto.ReminderId.Value);
                if (reminder != null && !reminder.IsDeleted)
                {
                    reminderId = dto.ReminderId.Value;
                }
            }

            // 6. Optional UpdatedBy
            int? updatedBy = null;
            if (dto.UpdatedBy.HasValue && dto.UpdatedBy.Value > 0)
            {
                var emp = await _employeeRepository.GetByIdAsync(dto.UpdatedBy.Value);
                if (emp != null && !emp.IsDeleted)
                {
                    updatedBy = dto.UpdatedBy.Value;
                }
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
        public async Task<bool> UpdateTaskAsync(int id, TaskDto dto)
        {
            _logger.LogInformation("Updating Task : {TaskId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return false;

            // Validate Foreign Keys
            if (dto.CompanyId > 0)
            {
                var company = await _companyRepository.GetByIdAsync(dto.CompanyId);
                if (company != null) item.CompanyId = dto.CompanyId;
            }

            if (dto.AssignedTo > 0)
            {
                var assignedTo = await _employeeRepository.GetByIdAsync(dto.AssignedTo);
                if (assignedTo != null && !assignedTo.IsDeleted) item.AssignedTo = dto.AssignedTo;
            }

            if (dto.AssignedBy > 0)
            {
                var assignedBy = await _employeeRepository.GetByIdAsync(dto.AssignedBy);
                if (assignedBy != null && !assignedBy.IsDeleted) item.AssignedBy = dto.AssignedBy;
            }

            if (dto.PriorityId > 0)
            {
                var priority = await _priorityRepository.GetByIdAsync(dto.PriorityId);
                if (priority != null) item.PriorityId = dto.PriorityId;
            }

            if (dto.TaskStatusId > 0)
            {
                var status = await _taskStatusRepository.GetByIdAsync(dto.TaskStatusId);
                if (status != null && !status.IsDeleted) item.TaskStatusId = dto.TaskStatusId;
            }

            int? reminderId = item.ReminderId;
            if (dto.ReminderId.HasValue && dto.ReminderId.Value > 0)
            {
                var reminder = await _reminderRepository.GetByIdAsync(dto.ReminderId.Value);
                if (reminder != null && !reminder.IsDeleted)
                {
                    reminderId = dto.ReminderId.Value;
                }
            }

            int? updatedBy = item.UpdatedBy;
            if (dto.UpdatedBy.HasValue && dto.UpdatedBy.Value > 0)
            {
                var emp = await _employeeRepository.GetByIdAsync(dto.UpdatedBy.Value);
                if (emp != null && !emp.IsDeleted)
                {
                    updatedBy = dto.UpdatedBy.Value;
                }
            }

            item.TaskTitle = dto.TaskTitle ?? item.TaskTitle;
            item.Description = dto.Description ?? item.Description;
            item.StartDate = dto.StartDate != default ? dto.StartDate : item.StartDate;
            item.DueDate = dto.DueDate != default ? dto.DueDate : item.DueDate;
            item.CompletionDate = dto.CompletionDate ?? item.CompletionDate;
            item.ReminderId = reminderId;
            item.Remarks = dto.Remarks ?? item.Remarks;
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
            _logger.LogInformation("Deleting Task : {TaskId}", id);

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
        public async Task<bool> AssignTaskAsync(int taskId, AssignTaskDto dto)
        {
            _logger.LogInformation("Assigning Task : {TaskId}", taskId);

            var task = await _repository.GetByIdAsync(taskId);

            if (task == null || task.IsDeleted)
                return false;

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
            _logger.LogInformation("Completing Task : {TaskId}", taskId);

            var task = await _repository.GetByIdAsync(taskId);

            if (task == null || task.IsDeleted)
                return false;

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
            var employees = await _employeeRepository.GetAll();

            return tasks
                .Where(x => !x.IsDeleted)
                .Select(x =>
                {
                    var assignedByEmp = employees.FirstOrDefault(e => e.ID == x.AssignedBy && !e.IsDeleted);
                    var assignedToEmp = employees.FirstOrDefault(e => e.ID == x.AssignedTo && !e.IsDeleted);

                    return new TaskListDto
                    {
                        TaskId = x.TaskId,
                        CompanyId = x.CompanyId,
                        TaskTitle = x.TaskTitle,
                        Description = x.Description,
                        AssignedTo = x.AssignedTo,
                        AssignedToName = assignedToEmp != null ? $"{assignedToEmp.FirstName} {assignedToEmp.LastName}".Trim() : null,
                        AssignedBy = x.AssignedBy,
                        AssignedByName = assignedByEmp != null ? $"{assignedByEmp.FirstName} {assignedByEmp.LastName}".Trim() : null,
                        PriorityId = x.PriorityId,
                        TaskStatusId = x.TaskStatusId,
                        StartDate = x.StartDate,
                        DueDate = x.DueDate,
                        CompletionDate = x.CompletionDate,
                        IsCompleted = x.CompletionDate != null
                    };
                });
        }

        // ================================
        // Task Details
        // ================================
        public async Task<TaskDetailsDto?> GetTaskDetailsAsync(int taskId)
        {
            _logger.LogInformation("Fetching Task Details : {TaskId}", taskId);

            var task = await _repository.GetByIdAsync(taskId);

            if (task == null || task.IsDeleted)
                return null;

            var comments = await _taskCommentRepository.GetAll();
            var checklists = await _taskChecklistRepository.GetAll();
            var assignedByEmp = task.AssignedBy > 0 ? await _employeeRepository.GetByIdAsync(task.AssignedBy) : null;
            var assignedToEmp = task.AssignedTo > 0 ? await _employeeRepository.GetByIdAsync(task.AssignedTo) : null;

            return new TaskDetailsDto
            {
                TaskId = task.TaskId,
                CompanyId = task.CompanyId,
                TaskTitle = task.TaskTitle,
                Description = task.Description,
                AssignedTo = task.AssignedTo,
                AssignedToName = assignedToEmp != null ? $"{assignedToEmp.FirstName} {assignedToEmp.LastName}".Trim() : null,
                AssignedBy = task.AssignedBy,
                AssignedByName = assignedByEmp != null ? $"{assignedByEmp.FirstName} {assignedByEmp.LastName}".Trim() : null,
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
                    .Where(c => c.TaskId == taskId && !c.IsDeleted)
                    .Select(c => new TaskCommentItemDto
                    {
                        CommentId = c.CommentId,
                        Comment = c.Comment,
                        CommentedBy = c.CommentedBy,
                        CommentDate = c.CommentDate
                    })
                    .ToList(),

                Checklists = checklists
                    .Where(c => c.TaskId == taskId && !c.IsDeleted)
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
