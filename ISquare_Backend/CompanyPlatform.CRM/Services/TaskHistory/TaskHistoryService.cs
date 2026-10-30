using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.TaskHistory;
//using CompanyPlatform.CRM.Repository;
using System.Security.Claims;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Models.CRM.Company;


namespace CompanyPlatform.CRM.Services.TaskHistory
{
    public class TaskHistoryService : ITaskHistoryService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.TaskHistory> _repository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.Tasks> _taskRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.Employee> _employeeRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<TaskHistoryService> _logger;

        public TaskHistoryService(
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.TaskHistory> repository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.Tasks> taskRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.Employee> employeeRepository,
            IHttpContextAccessor httpContextAccessor,
            ILogger<TaskHistoryService> logger)
        {
            _repository = repository;
            _taskRepository = taskRepository;
            _employeeRepository = employeeRepository;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<IEnumerable<TaskHistoryDto>> GetAllTaskHistoriesAsync()
        {
            _logger.LogInformation("Fetching all Task Histories.");

            var histories = await _repository.GetAll();

            return histories
                .Where(x => x.IsActive && !x.IsDeleted)
                .Select(x => new TaskHistoryDto
                {
                    HistoryId = x.HistoryId,
                    TaskId = x.TaskId,
                    Activity = x.Activity,
                    Remarks = x.Remarks,
                    PerformedBy = x.PerformedBy,
                    PerformedDate = x.PerformedDate,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<TaskHistoryDto?> GetTaskHistoryByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Task History with ID : {HistoryId}", id);

            var history = await _repository.GetByIdAsync(id);

            if (history == null || history.IsDeleted)
                return null;

            return new TaskHistoryDto
            {
                HistoryId = history.HistoryId,
                TaskId = history.TaskId,
                Activity = history.Activity,
                Remarks = history.Remarks,
                PerformedBy = history.PerformedBy,
                PerformedDate = history.PerformedDate,
                IsActive = history.IsActive,
                IsDeleted = history.IsDeleted
            };
        }

        public async Task<TaskHistoryDto> CreateTaskHistoryAsync(CreateTaskHistoryDto dto)
        {
            _logger.LogInformation("Creating Task History.");

            var task = await _taskRepository.GetByIdAsync(dto.TaskId);
            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException($"Task with ID {dto.TaskId} not found.");
            }

            var employeeIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("EmployeeId");
            int performedBy = (dto.PerformedBy.HasValue && dto.PerformedBy.Value > 0)
                ? dto.PerformedBy.Value
                : (int.TryParse(employeeIdClaim, out var empId) && empId > 0 ? empId : (task.AssignedBy > 0 ? task.AssignedBy : task.CreatedBy));

            var emp = await _employeeRepository.GetByIdAsync(performedBy);
            if (emp == null || emp.IsDeleted)
            {
                if (task.AssignedBy > 0) performedBy = task.AssignedBy;
                else if (task.CreatedBy > 0) performedBy = task.CreatedBy;
                else throw new KeyNotFoundException($"Employee with ID {performedBy} (PerformedBy) not found.");
            }

            var history = new CompanyPlatform.Core.Models.CRM.Company.TaskHistory
            {
                TaskId = dto.TaskId,
                Activity = dto.Activity,
                Remarks = dto.Remarks,
                PerformedBy = performedBy,
                PerformedDate = DateTime.Now,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            await _repository.Create(history);

            _logger.LogInformation("Successfully created Task History with ID: {HistoryId}", history.HistoryId);

            return new TaskHistoryDto
            {
                HistoryId = history.HistoryId,
                TaskId = history.TaskId,
                Activity = history.Activity,
                Remarks = history.Remarks,
                PerformedBy = history.PerformedBy,
                PerformedDate = history.PerformedDate,
                IsActive = history.IsActive,
                IsDeleted = history.IsDeleted
            };
        }

        public async Task<bool> UpdateTaskHistoryAsync(int id, TaskHistoryDto dto)
        {
            _logger.LogInformation("Updating Task History with ID: {HistoryId}", id);

            var history = await _repository.GetByIdAsync(id);

            if (history == null || history.IsDeleted)
                return false;

            var task = await _taskRepository.GetByIdAsync(dto.TaskId);
            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException($"Task with ID {dto.TaskId} not found.");
            }

            var emp = await _employeeRepository.GetByIdAsync(dto.PerformedBy);
            if (emp == null || emp.IsDeleted)
            {
                throw new KeyNotFoundException($"Employee with ID {dto.PerformedBy} (PerformedBy) not found.");
            }

            history.TaskId = dto.TaskId;
            history.Activity = dto.Activity;
            history.Remarks = dto.Remarks;
            history.PerformedBy = dto.PerformedBy;
            history.IsActive = dto.IsActive;

            await _repository.Update(history);

            _logger.LogInformation("Successfully updated Task History with ID: {HistoryId}", id);
            return true;
        }

        public async Task<bool> DeleteTaskHistoryAsync(int id)
        {
            _logger.LogInformation("Deleting Task History with ID: {HistoryId}", id);

            var history = await _repository.GetByIdAsync(id);

            if (history == null)
                return false;

            history.IsDeleted = true;
            history.IsActive = false;

            await _repository.Update(history);

            _logger.LogInformation("Successfully deleted Task History with ID: {HistoryId}", id);
            return true;
        }
    }
}




//using Microsoft.AspNetCore.Http;
//using Microsoft.Extensions.Logging;

//using CompanyPlatform.CRM.DTO.TaskHistory;
//using CompanyPlatform.Core.Repository;

//using TaskHistoryEntity =
//    CompanyPlatform.Core.Models.CRM.Company.TaskHistory;

//using System.Security.Claims;

//namespace CompanyPlatform.CRM.Services.TaskHistory
//{
//    public class TaskHistoryService : ITaskHistoryService
//    {
//        private readonly IRepositories<TaskHistoryEntity> _repository;
//        private readonly IHttpContextAccessor _httpContextAccessor;
//        private readonly ILogger<TaskHistoryService> _logger;

//        public TaskHistoryService(
//            IRepositories<TaskHistoryEntity> repository,
//            IHttpContextAccessor httpContextAccessor,
//            ILogger<TaskHistoryService> logger)
//        {
//            _repository = repository;
//            _httpContextAccessor = httpContextAccessor;
//            _logger = logger;
//        }

//        // ============================================================
//        // GET ALL
//        // ============================================================

//        public async Task<IEnumerable<TaskHistoryDto>>
//            GetAllTaskHistoriesAsync()
//        {
//            _logger.LogInformation(
//                "Fetching all Task Histories.");

//            var histories =
//                await _repository.GetAll();

//            return histories
//                .Where(x => x.IsActive && !x.IsDeleted)
//                .Select(x => new TaskHistoryDto
//                {
//                    HistoryId = x.HistoryId,
//                    TaskId = x.TaskId,
//                    Activity = x.Activity,
//                    Remarks = x.Remarks,
//                    PerformedBy = x.PerformedBy,
//                    PerformedDate = x.PerformedDate,
//                    IsActive = x.IsActive,
//                    IsDeleted = x.IsDeleted
//                });
//        }

//        // ============================================================
//        // GET BY ID
//        // ============================================================

//        public async Task<TaskHistoryDto?>
//            GetTaskHistoryByIdAsync(int id)
//        {
//            _logger.LogInformation(
//                "Fetching Task History with ID : {HistoryId}",
//                id);

//            var history =
//                await _repository.GetByIdAsync(id);

//            if (history == null ||
//                history.IsDeleted)
//            {
//                return null;
//            }

//            return new TaskHistoryDto
//            {
//                HistoryId = history.HistoryId,
//                TaskId = history.TaskId,
//                Activity = history.Activity,
//                Remarks = history.Remarks,
//                PerformedBy = history.PerformedBy,
//                PerformedDate = history.PerformedDate,
//                IsActive = history.IsActive,
//                IsDeleted = history.IsDeleted
//            };
//        }

//        // ============================================================
//        // CREATE
//        // ============================================================

//        public async Task<TaskHistoryDto>
//            CreateTaskHistoryAsync(
//                CreateTaskHistoryDto dto)
//        {
//            _logger.LogInformation(
//                "Creating Task History.");

//            var employeeIdClaim =
//                _httpContextAccessor.HttpContext?
//                    .User?
//                    .FindFirstValue("EmployeeId");

//            int performedBy =
//                int.TryParse(
//                    employeeIdClaim,
//                    out var empId)
//                    ? empId
//                    : 0;

//            var history = new TaskHistoryEntity
//            {
//                TaskId = dto.TaskId,
//                Activity = dto.Activity,
//                Remarks = dto.Remarks,
//                PerformedBy = performedBy,
//                PerformedDate = DateTime.Now,
//                IsActive = dto.IsActive,
//                IsDeleted = false
//            };

//            await _repository.Create(history);

//            _logger.LogInformation(
//                "Successfully created Task History with ID: {HistoryId}",
//                history.HistoryId);

//            return new TaskHistoryDto
//            {
//                HistoryId = history.HistoryId,
//                TaskId = history.TaskId,
//                Activity = history.Activity,
//                Remarks = history.Remarks,
//                PerformedBy = history.PerformedBy,
//                PerformedDate = history.PerformedDate,
//                IsActive = history.IsActive,
//                IsDeleted = history.IsDeleted
//            };
//        }

//        // ============================================================
//        // UPDATE
//        // ============================================================

//        public async Task<bool>
//            UpdateTaskHistoryAsync(
//                int id,
//                TaskHistoryDto dto)
//        {
//            _logger.LogInformation(
//                "Updating Task History with ID: {HistoryId}",
//                id);

//            var history =
//                await _repository.GetByIdAsync(id);

//            if (history == null ||
//                history.IsDeleted)
//            {
//                return false;
//            }

//            history.TaskId = dto.TaskId;
//            history.Activity = dto.Activity;
//            history.Remarks = dto.Remarks;
//            history.IsActive = dto.IsActive;

//            await _repository.Update(history);

//            _logger.LogInformation(
//                "Successfully updated Task History with ID: {HistoryId}",
//                id);

//            return true;
//        }

//        // ============================================================
//        // DELETE - SOFT DELETE
//        // ============================================================

//        public async Task<bool>
//            DeleteTaskHistoryAsync(int id)
//        {
//            _logger.LogInformation(
//                "Deleting Task History with ID: {HistoryId}",
//                id);

//            var history =
//                await _repository.GetByIdAsync(id);

//            if (history == null ||
//                history.IsDeleted)
//            {
//                return false;
//            }

//            history.IsDeleted = true;
//            history.IsActive = false;

//            await _repository.Update(history);

//            _logger.LogInformation(
//                "Successfully deleted Task History with ID: {HistoryId}",
//                id);

//            return true;
//        }
//    }
//}



