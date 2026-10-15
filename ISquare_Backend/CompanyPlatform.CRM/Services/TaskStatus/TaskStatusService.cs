//using Microsoft.Extensions.Logging;
//using CompanyPlatform.CRM.DTO.TaskStatus;
//using CompanyPlatform.CRM.Repository;
//using System.Collections.Generic;
//using System.Linq;
//using System.Threading.Tasks;
//using CompanyPlatform.Core.Repository;

//namespace CompanyPlatform.CRM.Services.TaskStatus
//{
//    public class TaskStatusService : ITaskStatusService
//    {
//        private readonly IRepositories<Model.TaskStatus> _repository;
//        private readonly ILogger<TaskStatusService> _logger;

//        public TaskStatusService(
//            IRepositories<Model.TaskStatus> repository,
//            ILogger<TaskStatusService> logger)
//        {
//            _repository = repository;
//            _logger = logger;
//        }

//        public async Task<IEnumerable<TaskStatusDto>> GetAllTaskStatusesAsync()
//        {
//            _logger.LogInformation(
//                "Fetching all active task statuses.");

//            var items = await _repository.GetAll();

//            return items
//                .Where(t => t.IsDeleted == false)
//                .Select(t => new TaskStatusDto
//                {
//                    ID = t.ID,
//                    StatusName = t.StatusName,
//                    IsDeleted = t.IsDeleted
//                });
//        }

//        public async Task<TaskStatusDto> GetTaskStatusByIdAsync(int id)
//        {
//            _logger.LogInformation(
//                "Fetching task status by ID: {TaskStatusId}",
//                id);

//            var item = await _repository.GetByIdAsync(id);

//            if (item == null || item.IsDeleted == true)
//            {
//                _logger.LogWarning(
//                    "Task status with ID: {TaskStatusId} not found or is deleted.",
//                    id);

//                return null;
//            }

//            return new TaskStatusDto
//            {
//                ID = item.ID,
//                StatusName = item.StatusName,
//                IsDeleted = item.IsDeleted
//            };
//        }

//        public async Task<TaskStatusDto> CreateTaskStatusAsync(
//            TaskStatusDto dto)
//        {
//            _logger.LogInformation(
//                "Creating a new task status with name: {StatusName}",
//                dto.StatusName);

//            var newItem = new Model.TaskStatus
//            {
//                StatusName = dto.StatusName,
//                IsDeleted = false
//            };

//            await _repository.Create(newItem);

//            dto.ID = newItem.ID;
//            dto.IsDeleted = newItem.IsDeleted;

//            _logger.LogInformation(
//                "Successfully created task status with ID: {TaskStatusId}",
//                newItem.ID);

//            return dto;
//        }

//        public async Task<bool> UpdateTaskStatusAsync(
//            int id,
//            TaskStatusDto dto)
//        {
//            _logger.LogInformation(
//                "Attempting to update task status with ID: {TaskStatusId}",
//                id);

//            var itemToUpdate = await _repository.GetByIdAsync(id);

//            if (itemToUpdate == null || itemToUpdate.IsDeleted == true)
//            {
//                _logger.LogWarning(
//                    "Update failed. Task status with ID: {TaskStatusId} not found or is deleted.",
//                    id);

//                return false;
//            }

//            itemToUpdate.StatusName = dto.StatusName;

//            await _repository.Update(itemToUpdate);

//            _logger.LogInformation(
//                "Successfully updated task status with ID: {TaskStatusId}",
//                id);

//            return true;
//        }

//        public async Task<bool> DeleteTaskStatusAsync(int id)
//        {
//            _logger.LogInformation(
//                "Attempting to delete task status with ID: {TaskStatusId}",
//                id);

//            var itemToDelete = await _repository.GetByIdAsync(id);

//            if (itemToDelete == null || itemToDelete.IsDeleted == true)
//            {
//                _logger.LogWarning(
//                    "Delete failed. Task status with ID: {TaskStatusId} not found or already deleted.",
//                    id);

//                return false;
//            }

//            itemToDelete.IsDeleted = true;

//            await _repository.Update(itemToDelete);

//            _logger.LogInformation(
//                "Successfully deleted task status with ID: {TaskStatusId}",
//                id);

//            return true;
//        }
//    }
//}


using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.TaskStatus;
using CompanyPlatform.Core.Repository;

using TaskStatusEntity =
    CompanyPlatform.Core.Models.CRM.Company.TaskStatus;

namespace CompanyPlatform.CRM.Services.TaskStatus
{
    public class TaskStatusService : ITaskStatusService
    {
        private readonly IRepositories<TaskStatusEntity> _repository;
        private readonly ILogger<TaskStatusService> _logger;

        public TaskStatusService(
            IRepositories<TaskStatusEntity> repository,
            ILogger<TaskStatusService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        // ================================
        // Get All Task Statuses
        // ================================
        public async Task<IEnumerable<TaskStatusDto>> GetAllTaskStatusesAsync()
        {
            _logger.LogInformation(
                "Fetching all active task statuses.");

            var items = await _repository.GetAll();

            return items
                .Where(t => t.IsDeleted == false)
                .Select(t => new TaskStatusDto
                {
                    ID = t.ID,
                    StatusName = t.StatusName,
                    IsDeleted = t.IsDeleted
                });
        }

        // ================================
        // Get Task Status By ID
        // ================================
        public async Task<TaskStatusDto?> GetTaskStatusByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching task status by ID: {TaskStatusId}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted == true)
            {
                _logger.LogWarning(
                    "Task status with ID: {TaskStatusId} not found or is deleted.",
                    id);

                return null;
            }

            return new TaskStatusDto
            {
                ID = item.ID,
                StatusName = item.StatusName,
                IsDeleted = item.IsDeleted
            };
        }

        // ================================
        // Create Task Status
        // ================================
        public async Task<TaskStatusDto> CreateTaskStatusAsync(
            TaskStatusDto dto)
        {
            _logger.LogInformation(
                "Creating a new task status with name: {StatusName}",
                dto.StatusName);

            var newItem = new TaskStatusEntity
            {
                StatusName = dto.StatusName,
                IsDeleted = false
            };

            await _repository.Create(newItem);

            dto.ID = newItem.ID;
            dto.IsDeleted = newItem.IsDeleted;

            _logger.LogInformation(
                "Successfully created task status with ID: {TaskStatusId}",
                newItem.ID);

            return dto;
        }

        // ================================
        // Update Task Status
        // ================================
        public async Task<bool> UpdateTaskStatusAsync(
            int id,
            TaskStatusDto dto)
        {
            _logger.LogInformation(
                "Attempting to update task status with ID: {TaskStatusId}",
                id);

            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsDeleted == true)
            {
                _logger.LogWarning(
                    "Update failed. Task status with ID: {TaskStatusId} not found or is deleted.",
                    id);

                return false;
            }

            itemToUpdate.StatusName = dto.StatusName;

            await _repository.Update(itemToUpdate);

            _logger.LogInformation(
                "Successfully updated task status with ID: {TaskStatusId}",
                id);

            return true;
        }

        // ================================
        // Delete Task Status
        // ================================
        public async Task<bool> DeleteTaskStatusAsync(int id)
        {
            _logger.LogInformation(
                "Attempting to delete task status with ID: {TaskStatusId}",
                id);

            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null || itemToDelete.IsDeleted == true)
            {
                _logger.LogWarning(
                    "Delete failed. Task status with ID: {TaskStatusId} not found or already deleted.",
                    id);

                return false;
            }

            itemToDelete.IsDeleted = true;

            await _repository.Update(itemToDelete);

            _logger.LogInformation(
                "Successfully deleted task status with ID: {TaskStatusId}",
                id);

            return true;
        }
    }
}