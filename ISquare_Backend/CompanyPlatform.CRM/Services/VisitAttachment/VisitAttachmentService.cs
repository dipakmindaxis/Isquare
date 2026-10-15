using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.VisitAttachment;
using System.Security.Claims;
using CompanyPlatform.CRM.DTO.Meeting;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Models.CRM.Company;
using VisitAttachmentEntity = CompanyPlatform.Core.Models.CRM.Company.VisitAttachment;

namespace CompanyPlatform.CRM.Services.VisitAttachment
{
    public class VisitAttachmentService : IVisitAttachmentService
    {
        private readonly IRepositories<VisitAttachmentEntity> _repository;
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<VisitAttachmentService> _logger;

        public VisitAttachmentService(
            IRepositories<VisitAttachmentEntity> repository,
            IWebHostEnvironment environment,
            IHttpContextAccessor httpContextAccessor,
            ILogger<VisitAttachmentService> logger)
        {
            _repository = repository;
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<VisitAttachmentDto> CreateVisitAttachmentAsync(CreateVisitAttachmentDto dto)
        {
            _logger.LogInformation("Creating Visit Attachment.");

            if (dto.File == null || dto.File.Length == 0)
                throw new Exception("Please select a file.");

            var uploadFolder = Path.Combine(
                _environment.WebRootPath,
                "Uploads",
                "VisitAttachments");

            if (!Directory.Exists(uploadFolder))
                Directory.CreateDirectory(uploadFolder);

            var fileExtension = Path.GetExtension(dto.File.FileName);
            var fileName = Guid.NewGuid().ToString() + fileExtension;

            var filePath = Path.Combine(uploadFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            var employeeIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("EmployeeId");
            int uploadedBy = int.TryParse(employeeIdClaim, out var empId) ? empId : 0;

            var attachment = new VisitAttachmentEntity
            {
                VisitId = dto.VisitId,
                DocumentName = dto.DocumentName,
                FileName = fileName,
                FilePath = Path.Combine("Uploads", "VisitAttachments", fileName),
                FileExtension = fileExtension,
                FileSize = dto.File.Length,
                UploadedBy = uploadedBy,
                UploadedDate = DateTime.Now,
                IsActive = dto.IsActive
            };

            await _repository.Create(attachment);

            _logger.LogInformation("Successfully created Visit Attachment with ID: {AttachmentId}", attachment.AttachmentId);

            return new VisitAttachmentDto
            {
                AttachmentId = attachment.AttachmentId,
                VisitId = attachment.VisitId,
                DocumentName = attachment.DocumentName,
                UploadedBy = attachment.UploadedBy,
                IsActive = attachment.IsActive
            };
        }

        public async Task<IEnumerable<VisitAttachmentDto>> GetAllVisitAttachmentsAsync()
        {
            _logger.LogInformation("Fetching all Visit Attachments.");

            var attachments = await _repository.GetAll();

            return attachments
                .Where(x => x.IsActive && !x.IsDeleted)
                .Select(x => new VisitAttachmentDto
                {
                    AttachmentId = x.AttachmentId,
                    VisitId = x.VisitId,
                    DocumentName = x.DocumentName,
                    UploadedBy = x.UploadedBy,
                    IsActive = x.IsActive
                });
        }

        public async Task<VisitAttachmentDto?> GetVisitAttachmentByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Visit Attachment with ID : {AttachmentId}", id);

            var attachment = await _repository.GetByIdAsync(id);

            if (attachment == null || attachment.IsDeleted)
                return null;

            return new VisitAttachmentDto
            {
                AttachmentId = attachment.AttachmentId,
                VisitId = attachment.VisitId,
                DocumentName = attachment.DocumentName,
                UploadedBy = attachment.UploadedBy,
                IsActive = attachment.IsActive
            };
        }

        public async Task<bool> UpdateVisitAttachmentAsync(int id, VisitAttachmentDto dto)
        {
            _logger.LogInformation("Updating Visit Attachment with ID: {AttachmentId}", id);

            var attachment = await _repository.GetByIdAsync(id);

            if (attachment == null || attachment.IsDeleted)
                return false;

            attachment.VisitId = dto.VisitId;
            attachment.DocumentName = dto.DocumentName;

            if (dto.File != null)
            {
                var uploadFolder = Path.Combine(
                    _environment.WebRootPath,
                    "Uploads",
                    "VisitAttachments");

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
                attachment.FilePath = Path.Combine("Uploads", "VisitAttachments", fileName);
                attachment.FileExtension = extension;
                attachment.FileSize = dto.File.Length;
            }

            await _repository.Update(attachment);

            _logger.LogInformation("Successfully updated Visit Attachment with ID: {AttachmentId}", id);

            return true;
        }

        public async Task<bool> DeleteVisitAttachmentAsync(int id)
        {
            _logger.LogInformation("Deleting Visit Attachment with ID: {AttachmentId}", id);

            var attachment = await _repository.GetByIdAsync(id);

            if (attachment == null)
                return false;

            attachment.IsDeleted = true;
            attachment.IsActive = false;

            await _repository.Update(attachment);

            _logger.LogInformation("Successfully deleted Visit Attachment with ID: {AttachmentId}", id);

            return true;
        }
    }
}