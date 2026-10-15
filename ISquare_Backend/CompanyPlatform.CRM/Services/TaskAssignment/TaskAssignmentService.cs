//using CompanyPlatform.Core.Models.CRM.Company;
//using CompanyPlatform.Core.Repository;
//using CompanyPlatform.CRM.DTO.TaskAssignment;
//using CompanyPlatform.CRM.Services.TaskAssignment;
//using Microsoft.Extensions.Logging;

//namespace CompanyPlatform.Services.TaskAssignment
//{
//    public class TaskAssignmentService : ITaskAssignmentService
//    {
//        private readonly IRepositories<TaskAssignment> _repository;
//        private readonly IRepositories<Tasks> _tasksRepository;
//        private readonly IRepositories<Employee> _employeeRepository;
//        private readonly ILogger<TaskAssignmentService> _logger;

//        public TaskAssignmentService(
//    IRepositories<TaskAssignment> repository,
//    IRepositories<Tasks> tasksRepository,
//    IRepositories<Employee> employeeRepository,
//    ILogger<TaskAssignmentService> logger)
//{
//    _repository = repository;
//    _tasksRepository = tasksRepository;
//    _employeeRepository = employeeRepository;
//    _logger = logger;
//}

//        public async Task<IEnumerable<TaskAssignmentDto>> GetAllTaskAssignmentsAsync()
//        {
//            _logger.LogInformation("Fetching all active task assignments.");
//            var items = await _repository.GetAll();

//            return items
//                .Where(d => d.IsDeleted == false)
//                .Select(d => new TaskAssignmentDto
//                {
//                    AssignmentId = d.AssignmentId,
//                    TaskId = d.TaskId,
//                    AssignedTo = d.AssignedTo,
//                    AssignedBy = d.AssignedBy,
//                    AssignedDate = d.AssignedDate,
//                    Remarks = d.Remarks,
//                    IsActive = d.IsActive,
//                    IsDeleted = d.IsDeleted
//                });
//        }

//        public async Task<TaskAssignmentDto?> GetTaskAssignmentByIdAsync(int id)
//        {
//            _logger.LogInformation("Fetching task assignment by ID: {AssignmentId}", id);
//            var item = await _repository.GetByIdAsync(id);

//            if (item == null || !item.IsDeleted == false)
//            {
//                _logger.LogWarning("Task assignment with ID: {AssignmentId} not found or is inactive.", id);
//                return null;
//            }

//            return new TaskAssignmentDto
//            {
//                AssignmentId = item.AssignmentId,
//                TaskId = item.TaskId,
//                AssignedTo = item.AssignedTo,
//                AssignedBy = item.AssignedBy,
//                AssignedDate = item.AssignedDate,
//                Remarks = item.Remarks,
//                IsActive = item.IsActive,
//                IsDeleted = item.IsDeleted
//            };
//        }

//        public async Task<TaskAssignmentDto> CreateTaskAssignmentAsync(TaskAssignmentDto dto)
//        {
//            _logger.LogInformation("Creating a new task assignment for Task ID: {TaskId}", dto.TaskId);

//            var task = await _tasksRepository.GetByIdAsync(dto.TaskId);
//            if (task == null || task.IsDeleted)
//            {
//                throw new KeyNotFoundException($"Task with ID {dto.TaskId} not found.");
//            }

//            var assignedToEmployee = await _employeeRepository.GetByIdAsync(dto.AssignedTo);
//            if (assignedToEmployee == null || assignedToEmployee.IsDeleted)
//            {
//                throw new KeyNotFoundException($"Employee with ID {dto.AssignedTo} (AssignedTo) not found.");
//            }

//            var assignedByEmployee = await _employeeRepository.GetByIdAsync(dto.AssignedBy);
//            if (assignedByEmployee == null || assignedByEmployee.IsDeleted)
//            {
//                throw new KeyNotFoundException($"Employee with ID {dto.AssignedBy} (AssignedBy) not found.");
//            }

//            var newItem = new Model.TaskAssignment
//            {
//                TaskId = dto.TaskId,
//                AssignedTo = dto.AssignedTo,
//                AssignedBy = dto.AssignedBy,
//                AssignedDate = dto.AssignedDate,
//                Remarks = dto.Remarks,
//                IsActive = true,
//                IsDeleted = false
//            };

//            await _repository.Create(newItem);

//            dto.AssignmentId = newItem.AssignmentId;
//            dto.IsActive = newItem.IsActive;
//            dto.IsDeleted = newItem.IsDeleted;

//            _logger.LogInformation("Successfully created task assignment with ID: {AssignmentId}", newItem.AssignmentId);
//            return dto;
//        }

//        public async Task<bool> UpdateTaskAssignmentAsync(int id, TaskAssignmentDto dto)
//        {
//            _logger.LogInformation("Attempting to update task assignment with ID: {AssignmentId}", id);
//            var itemToUpdate = await _repository.GetByIdAsync(id);

//            if (itemToUpdate == null || !itemToUpdate.IsDeleted == false)
//            {
//                _logger.LogWarning("Update failed. Task assignment with ID: {AssignmentId} not found or is inactive.", id);
//                return false;
//            }

//            var task = await _tasksRepository.GetByIdAsync(dto.TaskId);
//            if (task == null || task.IsDeleted)
//            {
//                throw new KeyNotFoundException($"Task with ID {dto.TaskId} not found.");
//            }

//            var assignedToEmployee = await _employeeRepository.GetByIdAsync(dto.AssignedTo);
//            if (assignedToEmployee == null || assignedToEmployee.IsDeleted)
//            {
//                throw new KeyNotFoundException($"Employee with ID {dto.AssignedTo} (AssignedTo) not found.");
//            }

//            var assignedByEmployee = await _employeeRepository.GetByIdAsync(dto.AssignedBy);
//            if (assignedByEmployee == null || assignedByEmployee.IsDeleted)
//            {
//                throw new KeyNotFoundException($"Employee with ID {dto.AssignedBy} (AssignedBy) not found.");
//            }

//            itemToUpdate.TaskId = dto.TaskId;
//            itemToUpdate.AssignedTo = dto.AssignedTo;
//            itemToUpdate.AssignedBy = dto.AssignedBy;
//            itemToUpdate.AssignedDate = dto.AssignedDate;
//            itemToUpdate.Remarks = dto.Remarks;
//            itemToUpdate.IsActive = dto.IsActive;

//            await _repository.Update(itemToUpdate);

//            _logger.LogInformation("Successfully updated task assignment with ID: {AssignmentId}", id);
//            return true;
//        }

//        public async Task<bool> DeleteTaskAssignmentAsync(int id)
//        {
//            _logger.LogInformation("Attempting to deactivate task assignment with ID: {AssignmentId}", id);
//            var itemToDelete = await _repository.GetByIdAsync(id);

//            if (itemToDelete == null)
//            {
//                _logger.LogWarning("Deactivation failed. Task assignment with ID: {AssignmentId} not found.", id);
//                return false;
//            }

//            itemToDelete.IsDeleted = true;
//            await _repository.Update(itemToDelete);

//            _logger.LogInformation("Successfully deactivated task assignment with ID: {AssignmentId}", id);
//            return true;
//        }
//    }
//}




using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Models.CRM.Employee;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.TaskAssignment;
using CompanyPlatform.CRM.Services.TaskAssignment;
using Microsoft.Extensions.Logging;

using TaskAssignmentEntity =
    CompanyPlatform.Core.Models.CRM.Company.TaskAssignment;

namespace CompanyPlatform.Services.TaskAssignment
{
    public class TaskAssignmentService : ITaskAssignmentService
    {
        private readonly IRepositories<TaskAssignmentEntity> _repository;
        private readonly IRepositories<Tasks> _tasksRepository;
        private readonly IRepositories<Employees> _employeeRepository;
        private readonly ILogger<TaskAssignmentService> _logger;

        public TaskAssignmentService(
            IRepositories<TaskAssignmentEntity> repository,
            IRepositories<Tasks> tasksRepository,
            IRepositories< Employees> employeeRepository,
            ILogger<TaskAssignmentService> logger)
        {
            _repository = repository;
            _tasksRepository = tasksRepository;
            _employeeRepository = employeeRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<TaskAssignmentDto>> GetAllTaskAssignmentsAsync()
        {
            _logger.LogInformation("Fetching all active task assignments.");

            var items = await _repository.GetAll();

            return items
                .Where(d => !d.IsDeleted)
                .Select(d => new TaskAssignmentDto
                {
                    AssignmentId = d.AssignmentId,
                    TaskId = d.TaskId,
                    AssignedTo = d.AssignedTo,
                    AssignedBy = d.AssignedBy,
                    AssignedDate = d.AssignedDate,
                    Remarks = d.Remarks,
                    IsActive = d.IsActive,
                    IsDeleted = d.IsDeleted
                });
        }

        public async Task<TaskAssignmentDto?> GetTaskAssignmentByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching task assignment by ID: {AssignmentId}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning(
                    "Task assignment with ID: {AssignmentId} not found or is deleted.",
                    id);

                return null;
            }

            return new TaskAssignmentDto
            {
                AssignmentId = item.AssignmentId,
                TaskId = item.TaskId,
                AssignedTo = item.AssignedTo,
                AssignedBy = item.AssignedBy,
                AssignedDate = item.AssignedDate,
                Remarks = item.Remarks,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<TaskAssignmentDto> CreateTaskAssignmentAsync(
            TaskAssignmentDto dto)
        {
            _logger.LogInformation(
                "Creating a new task assignment for Task ID: {TaskId}",
                dto.TaskId);

            var task = await _tasksRepository.GetByIdAsync(dto.TaskId);

            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException(
                    $"Task with ID {dto.TaskId} not found.");
            }

            var assignedToEmployee =
                await _employeeRepository.GetByIdAsync(dto.AssignedTo);

            if (assignedToEmployee == null || assignedToEmployee.IsDeleted)
            {
                throw new KeyNotFoundException(
                    $"Employee with ID {dto.AssignedTo} (AssignedTo) not found.");
            }

            var assignedByEmployee =
                await _employeeRepository.GetByIdAsync(dto.AssignedBy);

            if (assignedByEmployee == null || assignedByEmployee.IsDeleted)
            {
                throw new KeyNotFoundException(
                    $"Employee with ID {dto.AssignedBy} (AssignedBy) not found.");
            }

            var newItem = new TaskAssignmentEntity
            {
                TaskId = dto.TaskId,
                AssignedTo = dto.AssignedTo,
                AssignedBy = dto.AssignedBy,
                AssignedDate = dto.AssignedDate,
                Remarks = dto.Remarks,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(newItem);

            dto.AssignmentId = newItem.AssignmentId;
            dto.IsActive = newItem.IsActive;
            dto.IsDeleted = newItem.IsDeleted;

            _logger.LogInformation(
                "Successfully created task assignment with ID: {AssignmentId}",
                newItem.AssignmentId);

            return dto;
        }

        public async Task<bool> UpdateTaskAssignmentAsync(
            int id,
            TaskAssignmentDto dto)
        {
            _logger.LogInformation(
                "Attempting to update task assignment with ID: {AssignmentId}",
                id);

            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsDeleted)
            {
                _logger.LogWarning(
                    "Update failed. Task assignment with ID: {AssignmentId} not found or is deleted.",
                    id);

                return false;
            }

            var task = await _tasksRepository.GetByIdAsync(dto.TaskId);

            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException(
                    $"Task with ID {dto.TaskId} not found.");
            }

            var assignedToEmployee =
                await _employeeRepository.GetByIdAsync(dto.AssignedTo);

            if (assignedToEmployee == null || assignedToEmployee.IsDeleted)
            {
                throw new KeyNotFoundException(
                    $"Employee with ID {dto.AssignedTo} (AssignedTo) not found.");
            }

            var assignedByEmployee =
                await _employeeRepository.GetByIdAsync(dto.AssignedBy);

            if (assignedByEmployee == null || assignedByEmployee.IsDeleted)
            {
                throw new KeyNotFoundException(
                    $"Employee with ID {dto.AssignedBy} (AssignedBy) not found.");
            }

            itemToUpdate.TaskId = dto.TaskId;
            itemToUpdate.AssignedTo = dto.AssignedTo;
            itemToUpdate.AssignedBy = dto.AssignedBy;
            itemToUpdate.AssignedDate = dto.AssignedDate;
            itemToUpdate.Remarks = dto.Remarks;
            itemToUpdate.IsActive = dto.IsActive;

            await _repository.Update(itemToUpdate);

            _logger.LogInformation(
                "Successfully updated task assignment with ID: {AssignmentId}",
                id);

            return true;
        }

        public async Task<bool> DeleteTaskAssignmentAsync(int id)
        {
            _logger.LogInformation(
                "Attempting to deactivate task assignment with ID: {AssignmentId}",
                id);

            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning(
                    "Deactivation failed. Task assignment with ID: {AssignmentId} not found.",
                    id);

                return false;
            }

            itemToDelete.IsDeleted = true;

            await _repository.Update(itemToDelete);

            _logger.LogInformation(
                "Successfully deactivated task assignment with ID: {AssignmentId}",
                id);

            return true;
        }
    }
}