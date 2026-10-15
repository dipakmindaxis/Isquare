//using Microsoft.AspNetCore.Hosting;
//using Microsoft.AspNetCore.Http;
//using Microsoft.Extensions.Logging;
//using CompanyPlatform.CRM.DTO.TaskAssignments;
//using System.Security.Claims;
//using CompanyPlatform.Core.Repository;

//namespace CompanyPlatform.CRM.Services.TaskAssignments
//{
//    public class TaskAssignmentsService : ITaskAssignmentsService
//    {
//        private readonly IRepositories<Model.TaskAssignments> _repository;
//        private readonly IRepositories<Model.Tasks> _taskRepository;
//        private readonly IRepositories<Model.TaskHistory> _historyRepository;
//        private readonly IRepositories<Model.TaskAttachment> _attachmentRepository;
//        private readonly IWebHostEnvironment _environment;
//        private readonly IHttpContextAccessor _httpContextAccessor;
//        private readonly ILogger<TaskAssignmentsService> _logger;

//        private static readonly string[] AllowedExtensions =
//            { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".gif", ".txt", ".zip" };

//        private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

//        public TaskAssignmentsService(
//            IRepositories<Model.TaskAssignments> repository,
//            IRepositories<Model.Tasks> taskRepository,
//            IRepositories<Model.TaskHistory> historyRepository,
//            IRepositories<Model.TaskAttachment> attachmentRepository,
//            IWebHostEnvironment environment,
//            IHttpContextAccessor httpContextAccessor,
//            ILogger<TaskAssignmentsService> logger)
//        {
//            _repository = repository;
//            _taskRepository = taskRepository;
//            _historyRepository = historyRepository;
//            _attachmentRepository = attachmentRepository;
//            _environment = environment;
//            _httpContextAccessor = httpContextAccessor;
//            _logger = logger;
//        }

//        // ─────────────────────────────────────────────────────────
//        // GET ALL
//        // ─────────────────────────────────────────────────────────
//        public async Task<IEnumerable<TaskAssignmentsDto>> GetAllAssignmentsAsync()
//        {
//            _logger.LogInformation("Fetching all Task Assignments.");

//            var items = await _repository.GetAll();

//            return items
//                .Where(x => x.IsActive && !x.IsDeleted)
//                .Select(x => MapToDto(x));
//        }

//        // ─────────────────────────────────────────────────────────
//        // GET BY ID
//        // ─────────────────────────────────────────────────────────
//        public async Task<TaskAssignmentsDto?> GetAssignmentByIdAsync(int id)
//        {
//            _logger.LogInformation("Fetching Task Assignment with ID: {AssignmentId}", id);

//            var item = await _repository.GetByIdAsync(id);

//            if (item == null || item.IsDeleted)
//                return null;

//            return MapToDto(item);
//        }

//        // ─────────────────────────────────────────────────────────
//        // CREATE
//        // ─────────────────────────────────────────────────────────
//        public async Task<TaskAssignmentsDto> CreateAssignmentAsync(TaskAssignmentsDto dto)
//        {
//            _logger.LogInformation("Creating Task Assignment.");

//            var assignment = new Model.TaskAssignments
//            {
//                TaskId = dto.TaskId,
//                AssignedTo = dto.AssignedTo,
//                AssignedBy = dto.AssignedBy,
//                AssignmentStatus = dto.AssignmentStatus,
//                Remarks = dto.Remarks,
//                CreatedBy = dto.CreatedBy,
//                CreatedDate = DateTime.Now,
//                UpdatedBy = dto.UpdatedBy,
//                UpdatedDate = null,
//                IsActive = true,
//                IsDeleted = false
//            };

//            await _repository.Create(assignment);

//            dto.AssignmentId = assignment.AssignmentId;
//            dto.CreatedDate = assignment.CreatedDate;

//            _logger.LogInformation("Task Assignment created with ID: {AssignmentId}", assignment.AssignmentId);

//            return dto;
//        }

//        // ─────────────────────────────────────────────────────────
//        // UPDATE
//        // ─────────────────────────────────────────────────────────
//        public async Task<bool> UpdateAssignmentAsync(int id, TaskAssignmentsDto dto)
//        {
//            _logger.LogInformation("Updating Task Assignment with ID: {AssignmentId}", id);

//            var item = await _repository.GetByIdAsync(id);

//            if (item == null || item.IsDeleted)
//                return false;

//            item.TaskId = dto.TaskId;
//            item.AssignedTo = dto.AssignedTo;
//            item.AssignedBy = dto.AssignedBy;
//            item.AssignmentStatus = dto.AssignmentStatus;
//            item.Remarks = dto.Remarks;
//            item.UpdatedBy = dto.UpdatedBy;
//            item.UpdatedDate = DateTime.Now;
//            item.IsActive = dto.IsActive;

//            await _repository.Update(item);

//            _logger.LogInformation("Task Assignment updated with ID: {AssignmentId}", id);

//            return true;
//        }

//        // ─────────────────────────────────────────────────────────
//        // DELETE (soft)
//        // ─────────────────────────────────────────────────────────
//        public async Task<bool> DeleteAssignmentAsync(int id)
//        {
//            _logger.LogInformation("Deleting Task Assignment with ID: {AssignmentId}", id);

//            var item = await _repository.GetByIdAsync(id);

//            if (item == null)
//                return false;

//            item.IsDeleted = true;
//            item.IsActive = false;

//            await _repository.Update(item);

//            _logger.LogInformation("Task Assignment deleted with ID: {AssignmentId}", id);

//            return true;
//        }

//        // ─────────────────────────────────────────────────────────
//        // ASSIGN TASK
//        // Validate TaskId, prevent duplicate active assignment.
//        // ─────────────────────────────────────────────────────────
//        public async Task<TaskAssignmentsDto> AssignTaskAsync(AssignTaskRequestDto dto)
//        {
//            _logger.LogInformation("Assigning Task {TaskId} to User {UserId}", dto.TaskId, dto.AssignedTo);

//            // Validate Task exists
//            var task = await _taskRepository.GetByIdAsync(dto.TaskId);
//            if (task == null || task.IsDeleted)
//                throw new Exception($"Task with ID {dto.TaskId} not found.");

//            // Prevent duplicate active assignment for the same user and task
//            var existing = await _repository.GetAll();
//            var duplicateActive = existing.Any(x =>
//                x.TaskId == dto.TaskId &&
//                x.AssignedTo == dto.AssignedTo &&
//                x.IsActive &&
//                !x.IsDeleted);

//            if (duplicateActive)
//                throw new Exception($"Task {dto.TaskId} is already actively assigned to User {dto.AssignedTo}.");

//            var assignment = new Model.TaskAssignments
//            {
//                TaskId = dto.TaskId,
//                AssignedTo = dto.AssignedTo,
//                AssignedBy = dto.AssignedBy,
//                AssignmentStatus = "Assigned",
//                Remarks = dto.Remarks,
//                CreatedBy = dto.CreatedBy,
//                CreatedDate = DateTime.Now,
//                IsActive = true,
//                IsDeleted = false
//            };

//            await _repository.Create(assignment);

//            // Record history
//            await _historyRepository.Create(new Model.TaskHistory
//            {
//                TaskId = dto.TaskId,
//                Activity = $"Task assigned to User {dto.AssignedTo} by User {dto.AssignedBy}.",
//                PerformedBy = dto.AssignedBy,
//                PerformedDate = DateTime.Now,
//                IsActive = true,
//                IsDeleted = false
//            });

//            _logger.LogInformation("Task Assignment created with ID: {AssignmentId}", assignment.AssignmentId);

//            return MapToDto(assignment);
//        }

//        // ─────────────────────────────────────────────────────────
//        // REASSIGN TASK
//        // Deactivate current active assignment, create new one.
//        // ─────────────────────────────────────────────────────────
//        public async Task<TaskAssignmentsDto> ReassignTaskAsync(int taskId, ReassignTaskRequestDto dto)
//        {
//            _logger.LogInformation("Reassigning Task {TaskId} to User {UserId}", taskId, dto.NewAssignedTo);

//            // Validate Task exists
//            var task = await _taskRepository.GetByIdAsync(taskId);
//            if (task == null || task.IsDeleted)
//                throw new Exception($"Task with ID {taskId} not found.");

//            // Deactivate all current active assignments for this task
//            var allAssignments = await _repository.GetAll();
//            var activeAssignments = allAssignments
//                .Where(x => x.TaskId == taskId && x.IsActive && !x.IsDeleted)
//                .ToList();

//            foreach (var prev in activeAssignments)
//            {
//                prev.IsActive = false;
//                prev.AssignmentStatus = "Reassigned";
//                prev.UpdatedBy = dto.UpdatedBy;
//                prev.UpdatedDate = DateTime.Now;
//                await _repository.Update(prev);
//            }

//            // Create new assignment
//            var newAssignment = new Model.TaskAssignments
//            {
//                TaskId = taskId,
//                AssignedTo = dto.NewAssignedTo,
//                AssignedBy = dto.ReassignedBy,
//                AssignmentStatus = "Assigned",
//                Remarks = dto.Remarks,
//                CreatedBy = dto.ReassignedBy,
//                CreatedDate = DateTime.Now,
//                IsActive = true,
//                IsDeleted = false
//            };

//            await _repository.Create(newAssignment);

//            // Record history
//            await _historyRepository.Create(new Model.TaskHistory
//            {
//                TaskId = taskId,
//                Activity = $"Task reassigned to User {dto.NewAssignedTo} by User {dto.ReassignedBy}.",
//                PerformedBy = dto.ReassignedBy,
//                PerformedDate = DateTime.Now,
//                IsActive = true,
//                IsDeleted = false
//            });

//            _logger.LogInformation("Task {TaskId} reassigned. New AssignmentId: {AssignmentId}", taskId, newAssignment.AssignmentId);

//            return MapToDto(newAssignment);
//        }

//        // ─────────────────────────────────────────────────────────
//        // UPLOAD ATTACHMENT
//        // Uses same pattern as TaskAttachmentService.
//        // ─────────────────────────────────────────────────────────
//        public async Task<TaskAssignmentsDto> UploadAttachmentAsync(UploadTaskAssignmentAttachmentDto dto)
//        {
//            _logger.LogInformation("Uploading attachment for Task {TaskId}.", dto.TaskId);

//            if (dto.File == null || dto.File.Length == 0)
//                throw new Exception("Please select a file.");

//            if (dto.File.Length > MaxFileSizeBytes)
//                throw new Exception("File size exceeds the maximum allowed limit of 10 MB.");

//            var fileExtension = Path.GetExtension(dto.File.FileName).ToLowerInvariant();
//            if (!AllowedExtensions.Contains(fileExtension))
//                throw new Exception($"File type '{fileExtension}' is not allowed. Allowed: {string.Join(", ", AllowedExtensions)}");

//            // Validate Task exists
//            var task = await _taskRepository.GetByIdAsync(dto.TaskId);
//            if (task == null || task.IsDeleted)
//                throw new Exception($"Task with ID {dto.TaskId} not found.");

//            // Build file path – same folder convention as TaskAttachmentService
//            var uploadFolder = Path.Combine(
//                _environment.WebRootPath,
//                "Uploads",
//                "TaskAssignments");

//            if (!Directory.Exists(uploadFolder))
//                Directory.CreateDirectory(uploadFolder);

//            var fileName = Guid.NewGuid().ToString() + fileExtension;
//            var filePath = Path.Combine(uploadFolder, fileName);

//            using (var stream = new FileStream(filePath, FileMode.Create))
//            {
//                await dto.File.CopyToAsync(stream);
//            }

//            var employeeIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("EmployeeId");
//            int uploadedBy = int.TryParse(employeeIdClaim, out var empId) ? empId : dto.UploadedBy;

//            // Save to TaskAttachment table (reuse the existing model)
//            var attachment = new Model.TaskAttachment
//            {
//                TaskId = dto.TaskId,
//                DocumentName = dto.DocumentName ?? string.Empty,
//                FileName = fileName,
//                FilePath = Path.Combine("Uploads", "TaskAssignments", fileName),
//                FileExtension = fileExtension,
//                FileSize = dto.File.Length,
//                UploadedBy = uploadedBy,
//                UploadedDate = DateTime.Now,
//                IsActive = true
//            };

//            await _attachmentRepository.Create(attachment);

//            // Record history
//            await _historyRepository.Create(new Model.TaskHistory
//            {
//                TaskId = dto.TaskId,
//                Activity = $"Attachment '{dto.DocumentName}' uploaded.",
//                PerformedBy = uploadedBy,
//                PerformedDate = DateTime.Now,
//                IsActive = true,
//                IsDeleted = false
//            });

//            _logger.LogInformation("Attachment uploaded for Task {TaskId}.", dto.TaskId);

//            // Return a minimal DTO indicating the task concerned
//            return new TaskAssignmentsDto
//            {
//                TaskId = dto.TaskId,
//                Remarks = $"Attachment uploaded: {dto.DocumentName}",
//                IsActive = true
//            };
//        }

//        // ─────────────────────────────────────────────────────────
//        // TASK TIMELINE
//        // Returns chronological history for a task.
//        // ─────────────────────────────────────────────────────────
//        public async Task<IEnumerable<TaskTimelineItemDto>> GetTaskTimelineAsync(int taskId)
//        {
//            _logger.LogInformation("Fetching Task Timeline for Task {TaskId}.", taskId);

//            var timeline = new List<TaskTimelineItemDto>();

//            // --- Task Created ---
//            var task = await _taskRepository.GetByIdAsync(taskId);
//            if (task != null)
//            {
//                timeline.Add(new TaskTimelineItemDto
//                {
//                    EventType = "Task Created",
//                    Description = $"Task '{task.TaskTitle}' was created.",
//                    PerformedBy = task.CreatedBy,
//                    EventDate = task.CreatedDate
//                });

//                if (task.CompletionDate.HasValue)
//                {
//                    timeline.Add(new TaskTimelineItemDto
//                    {
//                        EventType = "Task Completed",
//                        Description = $"Task '{task.TaskTitle}' was marked as completed.",
//                        PerformedBy = task.UpdatedBy ?? task.CreatedBy,
//                        EventDate = task.CompletionDate.Value
//                    });
//                }
//            }

//            // --- Assignments (Assigned / Reassigned) ---
//            var assignments = await _repository.GetAll();
//            foreach (var a in assignments.Where(x => x.TaskId == taskId).OrderBy(x => x.CreatedDate))
//            {
//                timeline.Add(new TaskTimelineItemDto
//                {
//                    EventType = a.AssignmentStatus == "Reassigned" ? "Task Reassigned" : "Task Assigned",
//                    Description = $"Task assigned to User {a.AssignedTo} by User {a.AssignedBy}. Status: {a.AssignmentStatus}.",
//                    PerformedBy = a.AssignedBy,
//                    EventDate = a.CreatedDate
//                });
//            }

//            // --- History (Status Updates, Comments etc.) ---
//            var histories = await _historyRepository.GetAll();
//            foreach (var h in histories.Where(x => x.TaskId == taskId && x.IsActive && !x.IsDeleted).OrderBy(x => x.PerformedDate))
//            {
//                timeline.Add(new TaskTimelineItemDto
//                {
//                    EventType = "History",
//                    Description = h.Activity,
//                    PerformedBy = h.PerformedBy,
//                    EventDate = h.PerformedDate
//                });
//            }

//            // --- Attachments ---
//            var attachments = await _attachmentRepository.GetAll();
//            foreach (var att in attachments.Where(x => x.TaskId == taskId && x.IsActive && !x.IsDeleted).OrderBy(x => x.UploadedDate))
//            {
//                timeline.Add(new TaskTimelineItemDto
//                {
//                    EventType = "Attachment Uploaded",
//                    Description = $"File '{att.DocumentName}' was attached.",
//                    PerformedBy = att.UploadedBy,
//                    EventDate = att.UploadedDate
//                });
//            }

//            return timeline.OrderBy(x => x.EventDate);
//        }

//        // ─────────────────────────────────────────────────────────
//        // Private helper
//        // ─────────────────────────────────────────────────────────
//        private static TaskAssignmentsDto MapToDto(Model.TaskAssignments x) => new TaskAssignmentsDto
//        {
//            AssignmentId = x.AssignmentId,
//            TaskId = x.TaskId,
//            AssignedTo = x.AssignedTo,
//            AssignedBy = x.AssignedBy,
//            AssignmentStatus = x.AssignmentStatus,
//            Remarks = x.Remarks,
//            CreatedBy = x.CreatedBy,
//            CreatedDate = x.CreatedDate,
//            UpdatedBy = x.UpdatedBy,
//            UpdatedDate = x.UpdatedDate,
//            IsActive = x.IsActive,
//            IsDeleted = x.IsDeleted
//        };
//    }
//}



using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.TaskAssignments;
using CompanyPlatform.Core.Repository;
using System.Security.Claims;

using TaskAssignmentsEntity =
    CompanyPlatform.Core.Models.CRM.Company.TaskAssignments;

using TasksEntity =
    CompanyPlatform.Core.Models.CRM.Company.Tasks;

using TaskHistoryEntity =
    CompanyPlatform.Core.Models.CRM.Company.TaskHistory;

using TaskAttachmentEntity =
    CompanyPlatform.Core.Models.CRM.Company.TaskAttachment;

namespace CompanyPlatform.CRM.Services.TaskAssignments
{
    public class TaskAssignmentsService : ITaskAssignmentsService
    {
        private readonly IRepositories<TaskAssignmentsEntity> _repository;
        private readonly IRepositories<TasksEntity> _taskRepository;
        private readonly IRepositories<TaskHistoryEntity> _historyRepository;
        private readonly IRepositories<TaskAttachmentEntity> _attachmentRepository;

        private readonly IWebHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<TaskAssignmentsService> _logger;

        private static readonly string[] AllowedExtensions =
        {
            ".pdf",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".txt",
            ".zip"
        };

        private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Employee.Employees> _employeeRepository;

        public TaskAssignmentsService(
            IRepositories<TaskAssignmentsEntity> repository,
            IRepositories<TasksEntity> taskRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Employee.Employees> employeeRepository,
            IRepositories<TaskHistoryEntity> historyRepository,
            IRepositories<TaskAttachmentEntity> attachmentRepository,
            IWebHostEnvironment environment,
            IHttpContextAccessor httpContextAccessor,
            ILogger<TaskAssignmentsService> logger)
        {
            _repository = repository;
            _taskRepository = taskRepository;
            _employeeRepository = employeeRepository;
            _historyRepository = historyRepository;
            _attachmentRepository = attachmentRepository;
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        // ============================================================
        // GET ALL
        // ============================================================

        public async Task<IEnumerable<TaskAssignmentsDto>> GetAllAssignmentsAsync()
        {
            _logger.LogInformation("Fetching all Task Assignments.");

            var items = await _repository.GetAll();

            return items
                .Where(x => x.IsActive && !x.IsDeleted)
                .Select(MapToDto);
        }

        // ============================================================
        // GET BY ID
        // ============================================================

        public async Task<TaskAssignmentsDto?> GetAssignmentByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Task Assignment with ID: {AssignmentId}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                return null;
            }

            return MapToDto(item);
        }

        // ============================================================
        // CREATE
        // ============================================================

        public async Task<TaskAssignmentsDto> CreateAssignmentAsync(
            TaskAssignmentsDto dto)
        {
            _logger.LogInformation("Creating Task Assignment.");

            var task = await _taskRepository.GetByIdAsync(dto.TaskId);
            if (task == null || task.IsDeleted)
                throw new KeyNotFoundException($"Task with ID {dto.TaskId} not found.");

            var assignedTo = await _employeeRepository.GetByIdAsync(dto.AssignedTo);
            if (assignedTo == null || assignedTo.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.AssignedTo} (AssignedTo) not found.");

            var assignedBy = await _employeeRepository.GetByIdAsync(dto.AssignedBy);
            if (assignedBy == null || assignedBy.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.AssignedBy} (AssignedBy) not found.");

            var createdBy = await _employeeRepository.GetByIdAsync(dto.CreatedBy);
            if (createdBy == null || createdBy.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.CreatedBy} (CreatedBy) not found.");

            int? updatedBy = null;
            if (dto.UpdatedBy.HasValue && dto.UpdatedBy.Value > 0)
            {
                var emp = await _employeeRepository.GetByIdAsync(dto.UpdatedBy.Value);
                if (emp == null || emp.IsDeleted)
                    throw new KeyNotFoundException($"Employee with ID {dto.UpdatedBy.Value} (UpdatedBy) not found.");
                updatedBy = dto.UpdatedBy.Value;
            }

            var assignment = new TaskAssignmentsEntity
            {
                TaskId = dto.TaskId,
                AssignedTo = dto.AssignedTo,
                AssignedBy = dto.AssignedBy,
                AssignmentStatus = dto.AssignmentStatus,
                Remarks = dto.Remarks,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                UpdatedBy = updatedBy,
                UpdatedDate = null,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(assignment);

            dto.AssignmentId = assignment.AssignmentId;
            dto.CreatedDate = assignment.CreatedDate;
            dto.UpdatedBy = assignment.UpdatedBy;

            _logger.LogInformation(
                "Task Assignment created with ID: {AssignmentId}",
                assignment.AssignmentId);

            return dto;
        }

        // ============================================================
        // UPDATE
        // ============================================================

        public async Task<bool> UpdateAssignmentAsync(
            int id,
            TaskAssignmentsDto dto)
        {
            _logger.LogInformation(
                "Updating Task Assignment with ID: {AssignmentId}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                return false;
            }

            var task = await _taskRepository.GetByIdAsync(dto.TaskId);
            if (task == null || task.IsDeleted)
                throw new KeyNotFoundException($"Task with ID {dto.TaskId} not found.");

            var assignedTo = await _employeeRepository.GetByIdAsync(dto.AssignedTo);
            if (assignedTo == null || assignedTo.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.AssignedTo} (AssignedTo) not found.");

            var assignedBy = await _employeeRepository.GetByIdAsync(dto.AssignedBy);
            if (assignedBy == null || assignedBy.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.AssignedBy} (AssignedBy) not found.");

            int? updatedBy = null;
            if (dto.UpdatedBy.HasValue && dto.UpdatedBy.Value > 0)
            {
                var emp = await _employeeRepository.GetByIdAsync(dto.UpdatedBy.Value);
                if (emp == null || emp.IsDeleted)
                    throw new KeyNotFoundException($"Employee with ID {dto.UpdatedBy.Value} (UpdatedBy) not found.");
                updatedBy = dto.UpdatedBy.Value;
            }

            item.TaskId = dto.TaskId;
            item.AssignedTo = dto.AssignedTo;
            item.AssignedBy = dto.AssignedBy;
            item.AssignmentStatus = dto.AssignmentStatus;
            item.Remarks = dto.Remarks;
            item.UpdatedBy = updatedBy;
            item.UpdatedDate = DateTime.Now;
            item.IsActive = dto.IsActive;

            await _repository.Update(item);

            _logger.LogInformation(
                "Task Assignment updated with ID: {AssignmentId}",
                id);

            return true;
        }

        // ============================================================
        // DELETE - SOFT DELETE
        // ============================================================

        public async Task<bool> DeleteAssignmentAsync(int id)
        {
            _logger.LogInformation(
                "Deleting Task Assignment with ID: {AssignmentId}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null)
            {
                return false;
            }

            item.IsDeleted = true;
            item.IsActive = false;

            await _repository.Update(item);

            _logger.LogInformation(
                "Task Assignment deleted with ID: {AssignmentId}",
                id);

            return true;
        }

        // ============================================================
        // ASSIGN TASK
        // ============================================================

        public async Task<TaskAssignmentsDto> AssignTaskAsync(
            AssignTaskRequestDto dto)
        {
            _logger.LogInformation(
                "Assigning Task {TaskId} to User {UserId}",
                dto.TaskId,
                dto.AssignedTo);

            // Validate Task
            var task = await _taskRepository.GetByIdAsync(dto.TaskId);

            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException(
                    $"Task with ID {dto.TaskId} not found.");
            }

            var assignedTo = await _employeeRepository.GetByIdAsync(dto.AssignedTo);
            if (assignedTo == null || assignedTo.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.AssignedTo} (AssignedTo) not found.");

            var assignedBy = await _employeeRepository.GetByIdAsync(dto.AssignedBy);
            if (assignedBy == null || assignedBy.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.AssignedBy} (AssignedBy) not found.");

            var createdBy = await _employeeRepository.GetByIdAsync(dto.CreatedBy);
            if (createdBy == null || createdBy.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.CreatedBy} (CreatedBy) not found.");

            // Check duplicate active assignment
            var existing = await _repository.GetAll();

            var duplicateActive = existing.Any(x =>
                x.TaskId == dto.TaskId &&
                x.AssignedTo == dto.AssignedTo &&
                x.IsActive &&
                !x.IsDeleted);

            if (duplicateActive)
            {
                throw new InvalidOperationException(
                    $"Task {dto.TaskId} is already actively assigned to User {dto.AssignedTo}.");
            }

            var assignment = new TaskAssignmentsEntity
            {
                TaskId = dto.TaskId,
                AssignedTo = dto.AssignedTo,
                AssignedBy = dto.AssignedBy,
                AssignmentStatus = "Assigned",
                Remarks = dto.Remarks,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(assignment);

            // Record history
            await _historyRepository.Create(
                new TaskHistoryEntity
                {
                    TaskId = dto.TaskId,
                    Activity =
                        $"Task assigned to User {dto.AssignedTo} by User {dto.AssignedBy}.",
                    PerformedBy = dto.AssignedBy,
                    PerformedDate = DateTime.Now,
                    IsActive = true,
                    IsDeleted = false
                });

            _logger.LogInformation(
                "Task Assignment created with ID: {AssignmentId}",
                assignment.AssignmentId);

            return MapToDto(assignment);
        }

        // ============================================================
        // REASSIGN TASK
        // ============================================================

        public async Task<TaskAssignmentsDto> ReassignTaskAsync(
            int taskId,
            ReassignTaskRequestDto dto)
        {
            _logger.LogInformation(
                "Reassigning Task {TaskId} to User {UserId}",
                taskId,
                dto.NewAssignedTo);

            // Validate Task
            var task = await _taskRepository.GetByIdAsync(taskId);

            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException(
                    $"Task with ID {taskId} not found.");
            }

            var newAssignedTo = await _employeeRepository.GetByIdAsync(dto.NewAssignedTo);
            if (newAssignedTo == null || newAssignedTo.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.NewAssignedTo} (NewAssignedTo) not found.");

            var reassignedBy = await _employeeRepository.GetByIdAsync(dto.ReassignedBy);
            if (reassignedBy == null || reassignedBy.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.ReassignedBy} (ReassignedBy) not found.");

            var updatedBy = await _employeeRepository.GetByIdAsync(dto.UpdatedBy);
            if (updatedBy == null || updatedBy.IsDeleted)
                throw new KeyNotFoundException($"Employee with ID {dto.UpdatedBy} (UpdatedBy) not found.");

            // Get active assignments
            var allAssignments = await _repository.GetAll();

            var activeAssignments = allAssignments
                .Where(x =>
                    x.TaskId == taskId &&
                    x.IsActive &&
                    !x.IsDeleted)
                .ToList();

            // Deactivate previous assignments
            foreach (var previous in activeAssignments)
            {
                previous.IsActive = false;
                previous.AssignmentStatus = "Reassigned";
                previous.UpdatedBy = dto.UpdatedBy;
                previous.UpdatedDate = DateTime.Now;

                await _repository.Update(previous);
            }

            // Create new assignment
            var newAssignment = new TaskAssignmentsEntity
            {
                TaskId = taskId,
                AssignedTo = dto.NewAssignedTo,
                AssignedBy = dto.ReassignedBy,
                AssignmentStatus = "Assigned",
                Remarks = dto.Remarks,
                CreatedBy = dto.ReassignedBy,
                CreatedDate = DateTime.Now,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(newAssignment);

            // Record history
            await _historyRepository.Create(
                new TaskHistoryEntity
                {
                    TaskId = taskId,
                    Activity =
                        $"Task reassigned to User {dto.NewAssignedTo} by User {dto.ReassignedBy}.",
                    PerformedBy = dto.ReassignedBy,
                    PerformedDate = DateTime.Now,
                    IsActive = true,
                    IsDeleted = false
                });

            _logger.LogInformation(
                "Task {TaskId} reassigned. New AssignmentId: {AssignmentId}",
                taskId,
                newAssignment.AssignmentId);

            return MapToDto(newAssignment);
        }

        // ============================================================
        // UPLOAD ATTACHMENT
        // ============================================================

        public async Task<TaskAssignmentsDto> UploadAttachmentAsync(
            UploadTaskAssignmentAttachmentDto dto)
        {
            _logger.LogInformation(
                "Uploading attachment for Task {TaskId}.",
                dto.TaskId);

            if (dto.File == null || dto.File.Length == 0)
            {
                throw new ArgumentException("Please select a file.");
            }

            if (dto.File.Length > MaxFileSizeBytes)
            {
                throw new ArgumentException(
                    "File size exceeds the maximum allowed limit of 10 MB.");
            }

            var fileExtension =
                Path.GetExtension(dto.File.FileName)
                    .ToLowerInvariant();

            if (!AllowedExtensions.Contains(fileExtension))
            {
                throw new ArgumentException(
                    $"File type '{fileExtension}' is not allowed. " +
                    $"Allowed: {string.Join(", ", AllowedExtensions)}");
            }

            // Validate Task
            var task = await _taskRepository.GetByIdAsync(dto.TaskId);

            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException(
                    $"Task with ID {dto.TaskId} not found.");
            }

            // Upload folder
            var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            var uploadFolder = Path.Combine(
                webRoot,
                "Uploads",
                "TaskAssignments");

            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            var fileName =
                Guid.NewGuid().ToString() + fileExtension;

            var filePath =
                Path.Combine(uploadFolder, fileName);

            using (var stream =
                   new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            // Get employee ID from logged-in user
            var employeeIdClaim =
                _httpContextAccessor.HttpContext?
                    .User?
                    .FindFirstValue("EmployeeId");

            int uploadedBy = int.TryParse(employeeIdClaim, out var empId) && empId > 0
                ? empId
                : (dto.UploadedBy > 0 ? dto.UploadedBy : task.AssignedBy);

            // Save attachment
            var attachment = new TaskAttachmentEntity
            {
                TaskId = dto.TaskId,
                DocumentName = dto.DocumentName ?? string.Empty,
                FileName = fileName,
                FilePath = Path.Combine(
                    "Uploads",
                    "TaskAssignments",
                    fileName),
                FileExtension = fileExtension,
                FileSize = dto.File.Length,
                UploadedBy = uploadedBy,
                UploadedDate = DateTime.Now,
                IsActive = true
            };

            await _attachmentRepository.Create(attachment);

            // Record history
            await _historyRepository.Create(
                new TaskHistoryEntity
                {
                    TaskId = dto.TaskId,
                    Activity =
                        $"Attachment '{dto.DocumentName}' uploaded.",
                    PerformedBy = uploadedBy,
                    PerformedDate = DateTime.Now,
                    IsActive = true,
                    IsDeleted = false
                });

            _logger.LogInformation(
                "Attachment uploaded for Task {TaskId}.",
                dto.TaskId);

            return new TaskAssignmentsDto
            {
                TaskId = dto.TaskId,
                Remarks =
                    $"Attachment uploaded: {dto.DocumentName}",
                IsActive = true
            };
        }

        // ============================================================
        // TASK TIMELINE
        // ============================================================

        public async Task<IEnumerable<TaskTimelineItemDto>>
            GetTaskTimelineAsync(int taskId)
        {
            _logger.LogInformation(
                "Fetching Task Timeline for Task {TaskId}.",
                taskId);

            var timeline =
                new List<TaskTimelineItemDto>();

            // --------------------------------------------------------
            // Task Created
            // --------------------------------------------------------

            var task =
                await _taskRepository.GetByIdAsync(taskId);

            if (task != null)
            {
                timeline.Add(
                    new TaskTimelineItemDto
                    {
                        EventType = "Task Created",

                        Description =
                            $"Task '{task.TaskTitle}' was created.",

                        PerformedBy = task.CreatedBy,

                        EventDate = task.CreatedDate
                    });

                if (task.CompletionDate.HasValue)
                {
                    timeline.Add(
                        new TaskTimelineItemDto
                        {
                            EventType = "Task Completed",

                            Description =
                                $"Task '{task.TaskTitle}' was marked as completed.",

                            PerformedBy =
                                task.UpdatedBy ?? task.CreatedBy,

                            EventDate =
                                task.CompletionDate.Value
                        });
                }
            }

            // --------------------------------------------------------
            // Assignments
            // --------------------------------------------------------

            var assignments =
                await _repository.GetAll();

            foreach (var assignment in
                assignments
                    .Where(x => x.TaskId == taskId)
                    .OrderBy(x => x.CreatedDate))
            {
                timeline.Add(
                    new TaskTimelineItemDto
                    {
                        EventType =
                            assignment.AssignmentStatus ==
                            "Reassigned"
                                ? "Task Reassigned"
                                : "Task Assigned",

                        Description =
                            $"Task assigned to User {assignment.AssignedTo} " +
                            $"by User {assignment.AssignedBy}. " +
                            $"Status: {assignment.AssignmentStatus}.",

                        PerformedBy =
                            assignment.AssignedBy,

                        EventDate =
                            assignment.CreatedDate
                    });
            }

            // --------------------------------------------------------
            // History
            // --------------------------------------------------------

            var histories =
                await _historyRepository.GetAll();

            foreach (var history in
                histories
                    .Where(x =>
                        x.TaskId == taskId &&
                        x.IsActive &&
                        !x.IsDeleted)
                    .OrderBy(x => x.PerformedDate))
            {
                timeline.Add(
                    new TaskTimelineItemDto
                    {
                        EventType = "History",

                        Description =
                            history.Activity,

                        PerformedBy =
                            history.PerformedBy,

                        EventDate =
                            history.PerformedDate
                    });
            }

            // --------------------------------------------------------
            // Attachments
            // --------------------------------------------------------

            var attachments =
                await _attachmentRepository.GetAll();

            foreach (var attachment in
                attachments
                    .Where(x =>
                        x.TaskId == taskId &&
                        x.IsActive &&
                        !x.IsDeleted)
                    .OrderBy(x => x.UploadedDate))
            {
                timeline.Add(
                    new TaskTimelineItemDto
                    {
                        EventType =
                            "Attachment Uploaded",

                        Description =
                            $"File '{attachment.DocumentName}' was attached.",

                        PerformedBy =
                            attachment.UploadedBy,

                        EventDate =
                            attachment.UploadedDate
                    });
            }

            return timeline.OrderBy(x => x.EventDate);
        }

        // ============================================================
        // MAP ENTITY TO DTO
        // ============================================================

        private static TaskAssignmentsDto MapToDto(
            TaskAssignmentsEntity x)
        {
            return new TaskAssignmentsDto
            {
                AssignmentId = x.AssignmentId,
                TaskId = x.TaskId,
                AssignedTo = x.AssignedTo,
                AssignedBy = x.AssignedBy,
                AssignmentStatus = x.AssignmentStatus,
                Remarks = x.Remarks,
                CreatedBy = x.CreatedBy,
                CreatedDate = x.CreatedDate,
                UpdatedBy = x.UpdatedBy,
                UpdatedDate = x.UpdatedDate,
                IsActive = x.IsActive,
                IsDeleted = x.IsDeleted
            };
        }
    }
}
