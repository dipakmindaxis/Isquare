//using Microsoft.AspNetCore.Hosting;
//using Microsoft.AspNetCore.Http;
//using Microsoft.Extensions.Logging;
//using CompanyPlatform.CRM.DTO.TaskAttachment;
//using CompanyPlatform.CRM.Repository;
//using System.Security.Claims;
//using CompanyPlatform.Core.Repository;
//using DocumentFormat.OpenXml.EMMA;

//namespace CompanyPlatform.CRM.Services.TaskAttachment
//{
//    public class TaskAttachmentService : ITaskAttachmentService
//    {
//        private readonly IRepositories<Model.TaskAttachment> _repository;
//        private readonly IWebHostEnvironment _environment;
//        private readonly IHttpContextAccessor _httpContextAccessor;
//        private readonly ILogger<TaskAttachmentService> _logger;

//        public TaskAttachmentService(
//            IRepositories<Model.TaskAttachment> repository,
//            IWebHostEnvironment environment,
//            IHttpContextAccessor httpContextAccessor,
//            ILogger<TaskAttachmentService> logger)
//        {
//            _repository = repository;
//            _environment = environment;
//            _httpContextAccessor = httpContextAccessor;
//            _logger = logger;
//        }

//        public async Task<TaskAttachmentDto> CreateTaskAttachmentAsync(CreateTaskAttachmentDto dto)
//        {
//            _logger.LogInformation("Creating Task Attachment.");

//            if (dto.File == null || dto.File.Length == 0)
//                throw new Exception("Please select a file.");

//            var uploadFolder = Path.Combine(
//                _environment.WebRootPath,
//                "Uploads",
//                "TaskAttachments");

//            if (!Directory.Exists(uploadFolder))
//                Directory.CreateDirectory(uploadFolder);

//            var fileExtension = Path.GetExtension(dto.File.FileName);
//            var fileName = Guid.NewGuid().ToString() + fileExtension;

//            var filePath = Path.Combine(uploadFolder, fileName);

//            using (var stream = new FileStream(filePath, FileMode.Create))
//            {
//                await dto.File.CopyToAsync(stream);
//            }

//            var employeeIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("EmployeeId");
//            int uploadedBy = int.TryParse(employeeIdClaim, out var empId) ? empId : 0;

//            var attachment = new Model.TaskAttachment
//            {
//                TaskId = dto.TaskId,
//                DocumentName = dto.DocumentName,
//                FileName = fileName,
//                FilePath = Path.Combine("Uploads", "TaskAttachments", fileName),
//                FileExtension = fileExtension,
//                FileSize = dto.File.Length,
//                UploadedBy = uploadedBy,
//                UploadedDate = DateTime.Now,
//                IsActive = dto.IsActive
//            };

//            await _repository.Create(attachment);

//            _logger.LogInformation("Successfully created Task Attachment with ID: {AttachmentId}", attachment.AttachmentId);

//            return new TaskAttachmentDto
//            {
//                AttachmentId = attachment.AttachmentId,
//                TaskId = attachment.TaskId,
//                DocumentName = attachment.DocumentName,
//                UploadedBy = attachment.UploadedBy,
//                IsActive = attachment.IsActive
//            };
//        }

//        public async Task<IEnumerable<TaskAttachmentDto>> GetAllTaskAttachmentsAsync()
//        {
//            _logger.LogInformation("Fetching all Task Attachments.");

//            var attachments = await _repository.GetAll();

//            return attachments
//                .Where(x => !x.IsDeleted)
//                .Select(x => new TaskAttachmentDto
//                {
//                    AttachmentId = x.AttachmentId,
//                    TaskId = x.TaskId,
//                    DocumentName = x.DocumentName,
//                    FileName = x.FileName,
//                    FilePath = x.FilePath,
//                    FileExtension = x.FileExtension,
//                    FileSize = x.FileSize,
//                    UploadedBy = x.UploadedBy,
//                    UploadedDate = x.UploadedDate,
//                    IsActive = x.IsActive,
//                    IsDeleted = x.IsDeleted
//                });
//        }

//        public async Task<IEnumerable<TaskAttachmentDto>> GetAttachmentsByTaskIdAsync(int taskId)
//        {
//            _logger.LogInformation("Fetching Task Attachments for TaskId: {TaskId}", taskId);

//            var attachments = await _repository.GetAll();

//            return attachments
//                .Where(x => x.TaskId == taskId && !x.IsDeleted)
//                .Select(x => new TaskAttachmentDto
//                {
//                    AttachmentId = x.AttachmentId,
//                    TaskId = x.TaskId,
//                    DocumentName = x.DocumentName,
//                    FileName = x.FileName,
//                    FilePath = x.FilePath,
//                    FileExtension = x.FileExtension,
//                    FileSize = x.FileSize,
//                    UploadedBy = x.UploadedBy,
//                    UploadedDate = x.UploadedDate,
//                    IsActive = x.IsActive,
//                    IsDeleted = x.IsDeleted
//                });
//        }

//        public async Task<TaskAttachmentDto?> GetTaskAttachmentByIdAsync(int id)
//        {
//            _logger.LogInformation("Fetching Task Attachment with ID : {AttachmentId}", id);

//            var attachment = await _repository.GetByIdAsync(id);

//            if (attachment == null || attachment.IsDeleted)
//                return null;

//            return new TaskAttachmentDto
//            {
//                AttachmentId = attachment.AttachmentId,
//                TaskId = attachment.TaskId,
//                DocumentName = attachment.DocumentName,
//                FileName = attachment.FileName,
//                FilePath = attachment.FilePath,
//                FileExtension = attachment.FileExtension,
//                FileSize = attachment.FileSize,
//                UploadedBy = attachment.UploadedBy,
//                UploadedDate = attachment.UploadedDate,
//                IsActive = attachment.IsActive,
//                IsDeleted = attachment.IsDeleted
//            };
//        }

//        public async Task<bool> UpdateTaskAttachmentAsync(int id, TaskAttachmentDto dto)
//        {
//            _logger.LogInformation("Updating Task Attachment with ID: {AttachmentId}", id);

//            var attachment = await _repository.GetByIdAsync(id);

//            if (attachment == null || attachment.IsDeleted)
//                return false;

//            attachment.TaskId = dto.TaskId;
//            attachment.DocumentName = dto.DocumentName;

//            if (dto.File != null)
//            {
//                var uploadFolder = Path.Combine(
//                    _environment.WebRootPath,
//                    "Uploads",
//                    "TaskAttachments");

//                if (!Directory.Exists(uploadFolder))
//                    Directory.CreateDirectory(uploadFolder);

//                var oldFile = Path.Combine(_environment.WebRootPath, attachment.FilePath);

//                if (File.Exists(oldFile))
//                    File.Delete(oldFile);

//                var extension = Path.GetExtension(dto.File.FileName);
//                var fileName = Guid.NewGuid().ToString() + extension;
//                var filePath = Path.Combine(uploadFolder, fileName);

//                using (var stream = new FileStream(filePath, FileMode.Create))
//                {
//                    await dto.File.CopyToAsync(stream);
//                }

//                attachment.FileName = fileName;
//                attachment.FilePath = Path.Combine("Uploads", "TaskAttachments", fileName);
//                attachment.FileExtension = extension;
//                attachment.FileSize = dto.File.Length;
//            }

//            await _repository.Update(attachment);

//            _logger.LogInformation("Successfully updated Task Attachment with ID: {AttachmentId}", id);
//            return true;
//        }

//        public async Task<bool> DeleteTaskAttachmentAsync(int id)
//        {
//            _logger.LogInformation("Deleting Task Attachment with ID: {AttachmentId}", id);

//            var attachment = await _repository.GetByIdAsync(id);

//            if (attachment == null)
//                return false;

//            attachment.IsDeleted = true;
//            attachment.IsActive = false;

//            await _repository.Update(attachment);

//            _logger.LogInformation("Successfully deleted Task Attachment with ID: {AttachmentId}", id);
//            return true;
//        }
//    }
//}




//using Microsoft.AspNetCore.Hosting;
//using Microsoft.AspNetCore.Http;
//using Microsoft.Extensions.Logging;
//using CompanyPlatform.CRM.DTO.TaskAttachment;
//using CompanyPlatform.Core.Repository;
//using System.Security.Claims;

//using TaskAttachmentEntity =
//    CompanyPlatform.Core.Models.CRM.Company.TaskAttachment;

//namespace CompanyPlatform.CRM.Services.TaskAttachment
//{
//    public class TaskAttachmentService : ITaskAttachmentService
//    {
//        private readonly IRepositories<TaskAttachmentEntity> _repository;
//        private readonly IWebHostEnvironment _environment;
//        private readonly IHttpContextAccessor _httpContextAccessor;
//        private readonly ILogger<TaskAttachmentService> _logger;

//        public TaskAttachmentService(
//            IRepositories<TaskAttachmentEntity> repository,
//            IWebHostEnvironment environment,
//            IHttpContextAccessor httpContextAccessor,
//            ILogger<TaskAttachmentService> logger)
//        {
//            _repository = repository;
//            _environment = environment;
//            _httpContextAccessor = httpContextAccessor;
//            _logger = logger;
//        }

//        // ============================================================
//        // CREATE TASK ATTACHMENT
//        // ============================================================

//        public async Task<TaskAttachmentDto> CreateTaskAttachmentAsync(
//            CreateTaskAttachmentDto dto)
//        {
//            _logger.LogInformation("Creating Task Attachment.");

//            if (dto.File == null || dto.File.Length == 0)
//            {
//                throw new Exception("Please select a file.");
//            }

//            var uploadFolder = Path.Combine(
//                _environment.WebRootPath,
//                "Uploads",
//                "TaskAttachments");

//            if (!Directory.Exists(uploadFolder))
//            {
//                Directory.CreateDirectory(uploadFolder);
//            }

//            var fileExtension =
//                Path.GetExtension(dto.File.FileName);

//            var fileName =
//                Guid.NewGuid().ToString() + fileExtension;

//            var filePath =
//                Path.Combine(uploadFolder, fileName);

//            using (var stream =
//                   new FileStream(filePath, FileMode.Create))
//            {
//                await dto.File.CopyToAsync(stream);
//            }

//            var employeeIdClaim =
//                _httpContextAccessor.HttpContext?
//                    .User?
//                    .FindFirstValue("EmployeeId");

//            int uploadedBy =
//                int.TryParse(employeeIdClaim, out var empId)
//                    ? empId
//                    : 0;

//            var attachment = new TaskAttachmentEntity
//            {
//                TaskId = dto.TaskId,
//                DocumentName = dto.DocumentName,
//                FileName = fileName,
//                FilePath = Path.Combine(
//                    "Uploads",
//                    "TaskAttachments",
//                    fileName),
//                FileExtension = fileExtension,
//                FileSize = dto.File.Length,
//                UploadedBy = uploadedBy,
//                UploadedDate = DateTime.Now,
//                IsActive = dto.IsActive
//            };

//            await _repository.Create(attachment);

//            _logger.LogInformation(
//                "Successfully created Task Attachment with ID: {AttachmentId}",
//                attachment.AttachmentId);

//            return new TaskAttachmentDto
//            {
//                AttachmentId = attachment.AttachmentId,
//                TaskId = attachment.TaskId,
//                DocumentName = attachment.DocumentName,
//                UploadedBy = attachment.UploadedBy,
//                IsActive = attachment.IsActive
//            };
//        }

//        // ============================================================
//        // GET ALL TASK ATTACHMENTS
//        // ============================================================

//        public async Task<IEnumerable<TaskAttachmentDto>>
//            GetAllTaskAttachmentsAsync()
//        {
//            _logger.LogInformation(
//                "Fetching all Task Attachments.");

//            var attachments =
//                await _repository.GetAll();

//            return attachments
//                .Where(x => !x.IsDeleted)
//                .Select(x => new TaskAttachmentDto
//                {
//                    AttachmentId = x.AttachmentId,
//                    TaskId = x.TaskId,
//                    DocumentName = x.DocumentName,
//                    FileName = x.FileName,
//                    FilePath = x.FilePath,
//                    FileExtension = x.FileExtension,
//                    FileSize = x.FileSize,
//                    UploadedBy = x.UploadedBy,
//                    UploadedDate = x.UploadedDate,
//                    IsActive = x.IsActive,
//                    IsDeleted = x.IsDeleted
//                });
//        }

//        // ============================================================
//        // GET ATTACHMENTS BY TASK ID
//        // ============================================================

//        public async Task<IEnumerable<TaskAttachmentDto>>
//            GetAttachmentsByTaskIdAsync(int taskId)
//        {
//            _logger.LogInformation(
//                "Fetching Task Attachments for TaskId: {TaskId}",
//                taskId);

//            var attachments =
//                await _repository.GetAll();

//            return attachments
//                .Where(x =>
//                    x.TaskId == taskId &&
//                    !x.IsDeleted)
//                .Select(x => new TaskAttachmentDto
//                {
//                    AttachmentId = x.AttachmentId,
//                    TaskId = x.TaskId,
//                    DocumentName = x.DocumentName,
//                    FileName = x.FileName,
//                    FilePath = x.FilePath,
//                    FileExtension = x.FileExtension,
//                    FileSize = x.FileSize,
//                    UploadedBy = x.UploadedBy,
//                    UploadedDate = x.UploadedDate,
//                    IsActive = x.IsActive,
//                    IsDeleted = x.IsDeleted
//                });
//        }

//        // ============================================================
//        // GET BY ID
//        // ============================================================

//        public async Task<TaskAttachmentDto?>
//            GetTaskAttachmentByIdAsync(int id)
//        {
//            _logger.LogInformation(
//                "Fetching Task Attachment with ID: {AttachmentId}",
//                id);

//            var attachment =
//                await _repository.GetByIdAsync(id);

//            if (attachment == null ||
//                attachment.IsDeleted)
//            {
//                return null;
//            }

//            return new TaskAttachmentDto
//            {
//                AttachmentId = attachment.AttachmentId,
//                TaskId = attachment.TaskId,
//                DocumentName = attachment.DocumentName,
//                FileName = attachment.FileName,
//                FilePath = attachment.FilePath,
//                FileExtension = attachment.FileExtension,
//                FileSize = attachment.FileSize,
//                UploadedBy = attachment.UploadedBy,
//                UploadedDate = attachment.UploadedDate,
//                IsActive = attachment.IsActive,
//                IsDeleted = attachment.IsDeleted
//            };
//        }

//        // ============================================================
//        // UPDATE
//        // ============================================================

//        public async Task<bool> UpdateTaskAttachmentAsync(
//            int id,
//            TaskAttachmentDto dto)
//        {
//            _logger.LogInformation(
//                "Updating Task Attachment with ID: {AttachmentId}",
//                id);

//            var attachment =
//                await _repository.GetByIdAsync(id);

//            if (attachment == null ||
//                attachment.IsDeleted)
//            {
//                return false;
//            }

//            attachment.TaskId = dto.TaskId;
//            attachment.DocumentName = dto.DocumentName;

//            // If new file is uploaded
//            if (dto.File != null)
//            {
//                var uploadFolder = Path.Combine(
//                    _environment.WebRootPath,
//                    "Uploads",
//                    "TaskAttachments");

//                if (!Directory.Exists(uploadFolder))
//                {
//                    Directory.CreateDirectory(uploadFolder);
//                }

//                // Delete old file
//                var oldFile = Path.Combine(
//                    _environment.WebRootPath,
//                    attachment.FilePath);

//                if (File.Exists(oldFile))
//                {
//                    File.Delete(oldFile);
//                }

//                // Create new file
//                var extension =
//                    Path.GetExtension(dto.File.FileName);

//                var fileName =
//                    Guid.NewGuid().ToString() + extension;

//                var filePath =
//                    Path.Combine(uploadFolder, fileName);

//                using (var stream =
//                       new FileStream(filePath, FileMode.Create))
//                {
//                    await dto.File.CopyToAsync(stream);
//                }

//                attachment.FileName = fileName;

//                attachment.FilePath =
//                    Path.Combine(
//                        "Uploads",
//                        "TaskAttachments",
//                        fileName);

//                attachment.FileExtension = extension;

//                attachment.FileSize =
//                    dto.File.Length;
//            }

//            await _repository.Update(attachment);

//            _logger.LogInformation(
//                "Successfully updated Task Attachment with ID: {AttachmentId}",
//                id);

//            return true;
//        }

//        // ============================================================
//        // DELETE - SOFT DELETE
//        // ============================================================

//        public async Task<bool> DeleteTaskAttachmentAsync(int id)
//        {
//            _logger.LogInformation(
//                "Deleting Task Attachment with ID: {AttachmentId}",
//                id);

//            var attachment =
//                await _repository.GetByIdAsync(id);

//            if (attachment == null)
//            {
//                return false;
//            }

//            attachment.IsDeleted = true;
//            attachment.IsActive = false;

//            await _repository.Update(attachment);

//            _logger.LogInformation(
//                "Successfully deleted Task Attachment with ID: {AttachmentId}",
//                id);

//            return true;
//        }
//    }
//}


using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

using CompanyPlatform.CRM.DTO.TaskAttachment;
using CompanyPlatform.Core.Repository;

using TaskAttachmentEntity =
    CompanyPlatform.Core.Models.CRM.Company.TaskAttachment;

using System.Security.Claims;

namespace CompanyPlatform.CRM.Services.TaskAttachment
{
    public class TaskAttachmentService : ITaskAttachmentService
    {
        private readonly IRepositories<TaskAttachmentEntity> _repository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.Tasks> _taskRepository;
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Employee.Employees> _employeeRepository;
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<TaskAttachmentService> _logger;

        public TaskAttachmentService(
            IRepositories<TaskAttachmentEntity> repository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.Tasks> taskRepository,
            IRepositories<CompanyPlatform.Core.Models.CRM.Employee.Employees> employeeRepository,
            IWebHostEnvironment environment,
            IHttpContextAccessor httpContextAccessor,
            ILogger<TaskAttachmentService> logger)
        {
            _repository = repository;
            _taskRepository = taskRepository;
            _employeeRepository = employeeRepository;
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        // ============================================================
        // CREATE
        // ============================================================

        public async Task<TaskAttachmentDto> CreateTaskAttachmentAsync(
            CreateTaskAttachmentDto dto)
        {
            _logger.LogInformation(
                "Creating Task Attachment.");

            if (dto.File == null || dto.File.Length == 0)
            {
                throw new ArgumentException("Please select a file.");
            }

            var task = await _taskRepository.GetByIdAsync(dto.TaskId);
            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException($"Task with ID {dto.TaskId} not found.");
            }

            var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            var uploadFolder = Path.Combine(
                webRoot,
                "Uploads",
                "TaskAttachments");

            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            var fileExtension =
                Path.GetExtension(dto.File.FileName);

            var fileName =
                Guid.NewGuid().ToString() + fileExtension;

            var filePath =
                Path.Combine(uploadFolder, fileName);

            using (var stream =
                   new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            var employeeIdClaim =
                _httpContextAccessor.HttpContext?
                    .User?
                    .FindFirstValue("EmployeeId");

            int uploadedBy = int.TryParse(employeeIdClaim, out var empId) && empId > 0
                ? empId
                : (dto.UploadedBy > 0 ? dto.UploadedBy : task.AssignedBy);

            var emp = await _employeeRepository.GetByIdAsync(uploadedBy);
            if (emp == null || emp.IsDeleted)
            {
                uploadedBy = task.AssignedBy > 0 ? task.AssignedBy : task.CreatedBy;
            }

            var attachment = new TaskAttachmentEntity
            {
                TaskId = dto.TaskId,
                DocumentName = dto.DocumentName,
                FileName = fileName,
                FilePath = Path.Combine(
                    "Uploads",
                    "TaskAttachments",
                    fileName),
                FileExtension = fileExtension,
                FileSize = dto.File.Length,
                UploadedBy = uploadedBy,
                UploadedDate = DateTime.Now,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            await _repository.Create(attachment);

            _logger.LogInformation(
                "Successfully created Task Attachment with ID: {AttachmentId}",
                attachment.AttachmentId);

            return new TaskAttachmentDto
            {
                AttachmentId = attachment.AttachmentId,
                TaskId = attachment.TaskId,
                DocumentName = attachment.DocumentName,
                FileName = attachment.FileName,
                FilePath = attachment.FilePath,
                FileExtension = attachment.FileExtension,
                FileSize = attachment.FileSize,
                UploadedBy = attachment.UploadedBy,
                UploadedDate = attachment.UploadedDate,
                IsActive = attachment.IsActive,
                IsDeleted = attachment.IsDeleted
            };
        }

        // ============================================================
        // GET ALL
        // ============================================================

        public async Task<IEnumerable<TaskAttachmentDto>>
            GetAllTaskAttachmentsAsync()
        {
            _logger.LogInformation(
                "Fetching all Task Attachments.");

            var attachments =
                await _repository.GetAll();

            return attachments
                .Where(x => !x.IsDeleted)
                .Select(x => new TaskAttachmentDto
                {
                    AttachmentId = x.AttachmentId,
                    TaskId = x.TaskId,
                    DocumentName = x.DocumentName,
                    FileName = x.FileName,
                    FilePath = x.FilePath,
                    FileExtension = x.FileExtension,
                    FileSize = x.FileSize,
                    UploadedBy = x.UploadedBy,
                    UploadedDate = x.UploadedDate,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        // ============================================================
        // GET BY TASK ID
        // ============================================================

        public async Task<IEnumerable<TaskAttachmentDto>>
            GetAttachmentsByTaskIdAsync(int taskId)
        {
            _logger.LogInformation(
                "Fetching Task Attachments for TaskId: {TaskId}",
                taskId);

            var attachments =
                await _repository.GetAll();

            return attachments
                .Where(x =>
                    x.TaskId == taskId &&
                    !x.IsDeleted)
                .Select(x => new TaskAttachmentDto
                {
                    AttachmentId = x.AttachmentId,
                    TaskId = x.TaskId,
                    DocumentName = x.DocumentName,
                    FileName = x.FileName,
                    FilePath = x.FilePath,
                    FileExtension = x.FileExtension,
                    FileSize = x.FileSize,
                    UploadedBy = x.UploadedBy,
                    UploadedDate = x.UploadedDate,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        // ============================================================
        // GET BY ID
        // ============================================================

        public async Task<TaskAttachmentDto?>
            GetTaskAttachmentByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Task Attachment with ID: {AttachmentId}",
                id);

            var attachment =
                await _repository.GetByIdAsync(id);

            if (attachment == null ||
                attachment.IsDeleted)
            {
                return null;
            }

            return new TaskAttachmentDto
            {
                AttachmentId = attachment.AttachmentId,
                TaskId = attachment.TaskId,
                DocumentName = attachment.DocumentName,
                FileName = attachment.FileName,
                FilePath = attachment.FilePath,
                FileExtension = attachment.FileExtension,
                FileSize = attachment.FileSize,
                UploadedBy = attachment.UploadedBy,
                UploadedDate = attachment.UploadedDate,
                IsActive = attachment.IsActive,
                IsDeleted = attachment.IsDeleted
            };
        }

        // ============================================================
        // UPDATE
        // ============================================================

        public async Task<bool> UpdateTaskAttachmentAsync(
            int id,
            TaskAttachmentDto dto)
        {
            _logger.LogInformation(
                "Updating Task Attachment with ID: {AttachmentId}",
                id);

            var attachment =
                await _repository.GetByIdAsync(id);

            if (attachment == null ||
                attachment.IsDeleted)
            {
                return false;
            }

            var task = await _taskRepository.GetByIdAsync(dto.TaskId);
            if (task == null || task.IsDeleted)
            {
                throw new KeyNotFoundException($"Task with ID {dto.TaskId} not found.");
            }

            attachment.TaskId = dto.TaskId;
            attachment.DocumentName = dto.DocumentName ?? string.Empty;
            attachment.IsActive = dto.IsActive;

            // If a new file is provided
            if (dto.File != null &&
                dto.File.Length > 0)
            {
                var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
                var uploadFolder = Path.Combine(
                    webRoot,
                    "Uploads",
                    "TaskAttachments");

                if (!Directory.Exists(uploadFolder))
                {
                    Directory.CreateDirectory(uploadFolder);
                }

                // Delete old file
                if (!string.IsNullOrEmpty(
                    attachment.FilePath))
                {
                    var oldFilePath =
                        Path.Combine(
                            webRoot,
                            attachment.FilePath);

                    if (File.Exists(oldFilePath))
                    {
                        File.Delete(oldFilePath);
                    }
                }

                // Create new file
                var extension =
                    Path.GetExtension(dto.File.FileName);

                var fileName =
                    Guid.NewGuid().ToString() + extension;

                var newFilePath =
                    Path.Combine(
                        uploadFolder,
                        fileName);

                using (var stream =
                       new FileStream(
                           newFilePath,
                           FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }

                attachment.FileName = fileName;

                attachment.FilePath =
                    Path.Combine(
                        "Uploads",
                        "TaskAttachments",
                        fileName);

                attachment.FileExtension = extension;

                attachment.FileSize =
                    dto.File.Length;
            }

            await _repository.Update(attachment);

            _logger.LogInformation(
                "Successfully updated Task Attachment with ID: {AttachmentId}",
                id);

            return true;
        }

        // ============================================================
        // DELETE - SOFT DELETE
        // ============================================================

        public async Task<bool> DeleteTaskAttachmentAsync(int id)
        {
            _logger.LogInformation(
                "Deleting Task Attachment with ID: {AttachmentId}",
                id);

            var attachment =
                await _repository.GetByIdAsync(id);

            if (attachment == null ||
                attachment.IsDeleted)
            {
                _logger.LogWarning(
                    "Task Attachment with ID: {AttachmentId} not found.",
                    id);

                return false;
            }

            attachment.IsDeleted = true;
            attachment.IsActive = false;

            await _repository.Update(attachment);

            _logger.LogInformation(
                "Successfully deleted Task Attachment with ID: {AttachmentId}",
                id);

            return true;
        }
    }
}

