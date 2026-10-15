using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.TaskReminderMapping;
using CompanyPlatform.Core.Repository;
using System.Security.Claims;
using TaskReminderMappingEntity = CompanyPlatform.Core.Models.CRM.Company.TaskReminderMapping;
using TasksEntity = CompanyPlatform.Core.Models.CRM.Company.Tasks;
using ReminderEntity = CompanyPlatform.Core.Models.CRM.Company.Reminder;
using EmployeesEntity = CompanyPlatform.Core.Models.CRM.Employee.Employees;

namespace CompanyPlatform.CRM.Services.TaskReminderMapping
{
    public class TaskReminderMappingService : ITaskReminderMappingService
    {
        private readonly IRepositories<TaskReminderMappingEntity> _repository;
        private readonly IRepositories<TasksEntity> _taskRepository;
        private readonly IRepositories<ReminderEntity> _reminderRepository;
        private readonly IRepositories<EmployeesEntity> _employeeRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<TaskReminderMappingService> _logger;

        public TaskReminderMappingService(
            IRepositories<TaskReminderMappingEntity> repository,
            IRepositories<TasksEntity> taskRepository,
            IRepositories<ReminderEntity> reminderRepository,
            IRepositories<EmployeesEntity> employeeRepository,
            IHttpContextAccessor httpContextAccessor,
            ILogger<TaskReminderMappingService> logger)
        {
            _repository = repository;
            _taskRepository = taskRepository;
            _reminderRepository = reminderRepository;
            _employeeRepository = employeeRepository;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        // ============================================================
        // GET ALL
        // ============================================================
        public async Task<IEnumerable<TaskReminderMappingDto>> GetAllTaskReminderMappingsAsync()
        {
            _logger.LogInformation("Fetching all Task Reminder Mappings.");

            var mappings = await _repository.GetAll();

            return mappings
                .Where(x => x.IsActive && !x.IsDeleted)
                .Select(x => new TaskReminderMappingDto
                {
                    MappingId = x.MappingId,
                    TaskId = x.TaskId,
                    ReminderId = x.ReminderId,
                    ReminderDate = x.ReminderDate,
                    IsCompleted = x.IsCompleted,
                    CreatedBy = x.CreatedBy,
                    CreatedDate = x.CreatedDate,
                    UpdatedBy = x.UpdatedBy,
                    UpdatedDate = x.UpdatedDate,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        // ============================================================
        // GET BY ID
        // ============================================================
        public async Task<TaskReminderMappingDto?> GetTaskReminderMappingByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Task Reminder Mapping with ID : {MappingId}", id);

            var mapping = await _repository.GetByIdAsync(id);

            if (mapping == null || mapping.IsDeleted)
            {
                return null;
            }

            return new TaskReminderMappingDto
            {
                MappingId = mapping.MappingId,
                TaskId = mapping.TaskId,
                ReminderId = mapping.ReminderId,
                ReminderDate = mapping.ReminderDate,
                IsCompleted = mapping.IsCompleted,
                CreatedBy = mapping.CreatedBy,
                CreatedDate = mapping.CreatedDate,
                UpdatedBy = mapping.UpdatedBy,
                UpdatedDate = mapping.UpdatedDate,
                IsActive = mapping.IsActive,
                IsDeleted = mapping.IsDeleted
            };
        }

        // ============================================================
        // CREATE
        // ============================================================
        public async Task<TaskReminderMappingDto> CreateTaskReminderMappingAsync(CreateTaskReminderMappingDto dto)
        {
            _logger.LogInformation("Creating Task Reminder Mapping.");

            var task = await _taskRepository.GetByIdAsync(dto.TaskId);
            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException($"Task with ID {dto.TaskId} not found.");
            }

            var reminder = await _reminderRepository.GetByIdAsync(dto.ReminderId);
            if (reminder == null || reminder.IsDeleted)
            {
                throw new KeyNotFoundException($"Reminder with ID {dto.ReminderId} not found.");
            }

            var employeeIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("EmployeeId");
            int createdBy = (dto.CreatedBy.HasValue && dto.CreatedBy.Value > 0)
                ? dto.CreatedBy.Value
                : (int.TryParse(employeeIdClaim, out var empId) && empId > 0 ? empId : (task.CreatedBy > 0 ? task.CreatedBy : task.AssignedBy));

            var emp = await _employeeRepository.GetByIdAsync(createdBy);
            if (emp == null || emp.IsDeleted)
            {
                if (task.CreatedBy > 0) createdBy = task.CreatedBy;
                else if (task.AssignedBy > 0) createdBy = task.AssignedBy;
                else throw new KeyNotFoundException($"Employee with ID {createdBy} (CreatedBy) not found.");
            }

            var mapping = new TaskReminderMappingEntity
            {
                TaskId = dto.TaskId,
                ReminderId = dto.ReminderId,
                ReminderDate = dto.ReminderDate,
                IsCompleted = dto.IsCompleted,
                CreatedBy = createdBy,
                CreatedDate = DateTime.Now,
                UpdatedBy = null,
                UpdatedDate = null,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            await _repository.Create(mapping);

            _logger.LogInformation("Successfully created Task Reminder Mapping with ID: {MappingId}", mapping.MappingId);

            return new TaskReminderMappingDto
            {
                MappingId = mapping.MappingId,
                TaskId = mapping.TaskId,
                ReminderId = mapping.ReminderId,
                ReminderDate = mapping.ReminderDate,
                IsCompleted = mapping.IsCompleted,
                CreatedBy = mapping.CreatedBy,
                CreatedDate = mapping.CreatedDate,
                UpdatedBy = mapping.UpdatedBy,
                UpdatedDate = mapping.UpdatedDate,
                IsActive = mapping.IsActive,
                IsDeleted = mapping.IsDeleted
            };
        }

        // ============================================================
        // UPDATE
        // ============================================================
        public async Task<bool> UpdateTaskReminderMappingAsync(int id, TaskReminderMappingDto dto)
        {
            _logger.LogInformation("Updating Task Reminder Mapping with ID: {MappingId}", id);

            var mapping = await _repository.GetByIdAsync(id);

            if (mapping == null || mapping.IsDeleted)
            {
                return false;
            }

            var task = await _taskRepository.GetByIdAsync(dto.TaskId);
            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException($"Task with ID {dto.TaskId} not found.");
            }

            var reminder = await _reminderRepository.GetByIdAsync(dto.ReminderId);
            if (reminder == null || reminder.IsDeleted)
            {
                throw new KeyNotFoundException($"Reminder with ID {dto.ReminderId} not found.");
            }

            var employeeIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("EmployeeId");
            int? updatedBy = (dto.UpdatedBy.HasValue && dto.UpdatedBy.Value > 0)
                ? dto.UpdatedBy.Value
                : (int.TryParse(employeeIdClaim, out var empId) && empId > 0 ? empId : (int?)null);

            if (updatedBy.HasValue)
            {
                var emp = await _employeeRepository.GetByIdAsync(updatedBy.Value);
                if (emp == null || emp.IsDeleted)
                {
                    updatedBy = null;
                }
            }

            mapping.TaskId = dto.TaskId;
            mapping.ReminderId = dto.ReminderId;
            mapping.ReminderDate = dto.ReminderDate;
            mapping.IsCompleted = dto.IsCompleted;
            mapping.IsActive = dto.IsActive;
            mapping.UpdatedBy = updatedBy;
            mapping.UpdatedDate = DateTime.Now;

            await _repository.Update(mapping);

            _logger.LogInformation("Successfully updated Task Reminder Mapping with ID: {MappingId}", id);

            return true;
        }

        // ============================================================
        // DELETE - SOFT DELETE
        // ============================================================
        public async Task<bool> DeleteTaskReminderMappingAsync(int id)
        {
            _logger.LogInformation("Deleting Task Reminder Mapping with ID: {MappingId}", id);

            var mapping = await _repository.GetByIdAsync(id);

            if (mapping == null || mapping.IsDeleted)
            {
                return false;
            }

            mapping.IsDeleted = true;
            mapping.IsActive = false;

            await _repository.Update(mapping);

            _logger.LogInformation("Successfully deleted Task Reminder Mapping with ID: {MappingId}", id);

            return true;
        }
    }
}
