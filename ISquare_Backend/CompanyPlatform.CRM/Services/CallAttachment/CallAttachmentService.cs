using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CallAttachment;
using CompanyPlatform.Core.Repository;

namespace CompanyPlatform.CRM.Services.CallAttachment
{
    public class CallAttachmentService : ICallAttachmentService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Call.CallAttachment> _repository;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<CallAttachmentService> _logger;

        public CallAttachmentService(
            IRepositories<CompanyPlatform.Core.Models.CRM.Call.CallAttachment> repository,
            IWebHostEnvironment environment,
            ILogger<CallAttachmentService> logger)
        {
            _repository = repository;
            _environment = environment;
            _logger = logger;
        }

        public async Task<CallAttachmentDto> CreateCallAttachmentAsync(CreateCallAttachmentDto dto)
        {
            _logger.LogInformation("Creating Call Attachment.");

            if (dto.File == null || dto.File.Length == 0)
                throw new Exception("Please select a file.");

            var uploadFolder = Path.Combine(
                _environment.WebRootPath,
                "Uploads",
                "CallAttachments");

            if (!Directory.Exists(uploadFolder))
                Directory.CreateDirectory(uploadFolder);

            var fileExtension = Path.GetExtension(dto.File.FileName);
            var fileName = Guid.NewGuid().ToString() + fileExtension;

            var filePath = Path.Combine(uploadFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            var attachment = new CompanyPlatform.Core.Models.CRM.Call.CallAttachment {
                CallId = dto.CallId,
                DocumentName = dto.DocumentName,
                FileName = fileName,
                FilePath = Path.Combine("Uploads", "CallAttachments", fileName),
                FileExtension = fileExtension,
                FileSize = dto.File.Length,
                UploadedBy = 1, // TODO: Replace with Logged-in User Id
                UploadedDate = DateTime.Now,
                IsActive = dto.IsActive
            };

            await _repository.Create(attachment);

            return new CallAttachmentDto
            {
                AttachmentId = attachment.AttachmentId,
                CallId = attachment.CallId,
                DocumentName = attachment.DocumentName,
                UploadedBy = attachment.UploadedBy,
                IsActive = attachment.IsActive,
                FileName = attachment.FileName,
                FilePath = attachment.FilePath,
                FileExtension = attachment.FileExtension,
                FileSize = attachment.FileSize,
                UploadedDate = attachment.UploadedDate
            };
        }

        public async Task<IEnumerable<CallAttachmentDto>> GetAllCallAttachmentsAsync()
        {
            _logger.LogInformation("Fetching all Call Attachments.");

            var attachments = await _repository.GetAll();

            return attachments
                .Where(x => x.IsActive && !x.IsDeleted)
                .Select(x => new CallAttachmentDto
                {
                    AttachmentId = x.AttachmentId,
                    CallId = x.CallId,
                    DocumentName = x.DocumentName,
                    UploadedBy = x.UploadedBy,
                    IsActive = x.IsActive,
                    FileName = x.FileName,
                    FilePath = x.FilePath,
                    FileExtension = x.FileExtension,
                    FileSize = x.FileSize,
                    UploadedDate = x.UploadedDate
                });
        }

        public async Task<CallAttachmentDto?> GetCallAttachmentByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Call Attachment with ID : {AttachmentId}", id);

            var attachment = await _repository.GetByIdAsync(id);

            if (attachment == null || attachment.IsDeleted)
                return null;

            return new CallAttachmentDto
            {
                AttachmentId = attachment.AttachmentId,
                CallId = attachment.CallId,
                DocumentName = attachment.DocumentName,
                UploadedBy = attachment.UploadedBy,
                IsActive = attachment.IsActive,
                FileName = attachment.FileName,
                FilePath = attachment.FilePath,
                FileExtension = attachment.FileExtension,
                FileSize = attachment.FileSize,
                UploadedDate = attachment.UploadedDate
            };
        }

        public async Task<bool> UpdateCallAttachmentAsync(int id, CallAttachmentDto dto)
        {
            _logger.LogInformation("Updating Call Attachment.");

            var attachment = await _repository.GetByIdAsync(id);

            if (attachment == null || attachment.IsDeleted)
                return false;

            attachment.CallId = dto.CallId;
            attachment.DocumentName = dto.DocumentName;
            attachment.UploadedBy = dto.UploadedBy;

            if (dto.File != null)
            {
                var uploadFolder = Path.Combine(
                    _environment.WebRootPath,
                    "Uploads",
                    "CallAttachments");

                if (!Directory.Exists(uploadFolder))
                    Directory.CreateDirectory(uploadFolder);

                var oldFile = Path.Combine(_environment.WebRootPath, attachment.FilePath);

                if (File.Exists(oldFile))
                    File.Delete(oldFile);

                var extension = Path.GetExtension(dto.File.FileName);
                var fileName = Guid.NewGuid().ToString() + extension;
                var filePath = Path.Combine(uploadFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }

                attachment.FileName = fileName;
                attachment.FilePath = Path.Combine("Uploads", "CallAttachments", fileName);
                attachment.FileExtension = extension;
                attachment.FileSize = dto.File.Length;
            }

            await _repository.Update(attachment);

            return true;
        }

        public async Task<bool> DeleteCallAttachmentAsync(int id)
        {
            _logger.LogInformation("Deleting Call Attachment.");

            var attachment = await _repository.GetByIdAsync(id);

            if (attachment == null)
                return false;

            attachment.IsDeleted = true;
            attachment.IsActive = false;

            await _repository.Update(attachment);

            return true;
        }
    }
}