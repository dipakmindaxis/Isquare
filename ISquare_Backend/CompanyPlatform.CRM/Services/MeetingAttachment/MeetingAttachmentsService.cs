using CompanyPlatform.Core.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.DTO.MeetingAttachment;
using DocumentFormat.OpenXml.EMMA;
using CompanyPlatform.Core.Models.CRM.Company;

namespace CompanyPlatform.Core.Services.MeetingAttachment
{
    public class MeetingAttachmentsService : IMeetingAttachmentsService
    {
        private readonly ApplicationDBContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<MeetingAttachmentsService> _logger;

        public MeetingAttachmentsService(
            ApplicationDBContext context,
            IWebHostEnvironment environment,
            ILogger<MeetingAttachmentsService> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        public async Task<List<MeetingAttachmentsDto>> GetAllAsync()
        {
            _logger.LogInformation("Fetching all meeting attachments.");
            return await _context.MeetingAttachments
                .Select(x => new MeetingAttachmentsDto
                {
                    AttachmentId = x.AttachmentId,
                    MeetingId = x.MeetingId,
                    FileName = x.FileName,
                    FilePath = x.FilePath,
                    UploadedBy = x.UploadedBy
                })
                .ToListAsync();
        }

        public async Task<MeetingAttachmentsDto?> GetByIdAsync(int attachmentId)
        {
            _logger.LogInformation("Fetching meeting attachment by ID: {AttachmentId}", attachmentId);
            return await _context.MeetingAttachments
                .Where(x => x.AttachmentId == attachmentId)
                .Select(x => new MeetingAttachmentsDto
                {
                    AttachmentId = x.AttachmentId,
                    MeetingId = x.MeetingId,
                    FileName = x.FileName,
                    FilePath = x.FilePath,
                    UploadedBy = x.UploadedBy
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<MeetingAttachmentsDto>> GetByMeetingIdAsync(int meetingId)
        {
            _logger.LogInformation("Fetching meeting attachments for Meeting ID: {MeetingId}", meetingId);
            return await _context.MeetingAttachments
                .Where(x => x.MeetingId == meetingId)
                .Select(x => new MeetingAttachmentsDto
                {
                    AttachmentId = x.AttachmentId,
                    MeetingId = x.MeetingId,
                    FileName = x.FileName,
                    FilePath = x.FilePath,
                    UploadedBy = x.UploadedBy
                })
                .ToListAsync();
        }

        public async Task<bool> UploadAsync(MeetingAttachmentsUploadDto dto)
        {
            _logger.LogInformation("Uploading attachments for Meeting ID: {MeetingId}", dto.MeetingId);

            if (dto.Files == null || !dto.Files.Any())
                return false;

            var uploadFolder = Path.Combine(
                _environment.WebRootPath,
                "Uploads",
                "MeetingAttachments");

            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            foreach (var file in dto.Files)
            {
                if (file.Length <= 0)
                    continue;

                var uniqueFileName =
                    Guid.NewGuid().ToString() +
                    Path.GetExtension(file.FileName);

                var physicalPath = Path.Combine(uploadFolder, uniqueFileName);

                using (var stream = new FileStream(physicalPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var attachment = new MeetingAttachments
                {
                    MeetingId = dto.MeetingId,
                    UploadedBy = dto.UploadedBy,
                    FileName = file.FileName,
                    FilePath = Path.Combine(
                        "Uploads",
                        "MeetingAttachments",
                        uniqueFileName).Replace("\\", "/")
                };

                _context.MeetingAttachments.Add(attachment);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully uploaded attachments for Meeting ID: {MeetingId}", dto.MeetingId);
            return true;
        }

        public async Task<bool> UpdateAsync(int attachmentId, MeetingAttachmentsDto dto)
        {
            _logger.LogInformation("Attempting to update attachment with ID: {AttachmentId}", attachmentId);
            var attachment = await _context.MeetingAttachments
                .FirstOrDefaultAsync(x => x.AttachmentId == attachmentId);

            if (attachment == null)
            {
                _logger.LogWarning("Update failed. Attachment with ID: {AttachmentId} not found.", attachmentId);
                return false;
            }

            if (dto.MeetingId > 0)
            {
                attachment.MeetingId = dto.MeetingId;
            }

            if (dto.UploadedBy > 0)
            {
                attachment.UploadedBy = dto.UploadedBy;
            }

            if (!string.IsNullOrWhiteSpace(dto.FileName))
            {
                attachment.FileName = dto.FileName;
            }

            if (dto.File != null && dto.File.Length > 0)
            {
                var uploadFolder = Path.Combine(
                    _environment.WebRootPath,
                    "Uploads",
                    "MeetingAttachments");

                if (!Directory.Exists(uploadFolder))
                {
                    Directory.CreateDirectory(uploadFolder);
                }

                if (!string.IsNullOrEmpty(attachment.FilePath))
                {
                    var oldPhysicalPath = Path.Combine(
                        _environment.WebRootPath,
                        attachment.FilePath.Replace("/", "\\"));

                    if (File.Exists(oldPhysicalPath))
                    {
                        File.Delete(oldPhysicalPath);
                    }
                }

                var uniqueFileName =
                    Guid.NewGuid().ToString() +
                    Path.GetExtension(dto.File.FileName);

                var physicalPath = Path.Combine(uploadFolder, uniqueFileName);

                using (var stream = new FileStream(physicalPath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }

                if (string.IsNullOrWhiteSpace(dto.FileName))
                {
                    attachment.FileName = dto.File.FileName;
                }

                attachment.FilePath = Path.Combine(
                    "Uploads",
                    "MeetingAttachments",
                    uniqueFileName).Replace("\\", "/");
            }

            _context.MeetingAttachments.Update(attachment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated attachment with ID: {AttachmentId}", attachmentId);
            return true;
        }

        public async Task<bool> DeleteAsync(int attachmentId)
        {
            _logger.LogInformation("Attempting to delete attachment with ID: {AttachmentId}", attachmentId);
            var attachment = await _context.MeetingAttachments
                .FirstOrDefaultAsync(x => x.AttachmentId == attachmentId);

            if (attachment == null)
            {
                _logger.LogWarning("Delete failed. Attachment with ID: {AttachmentId} not found.", attachmentId);
                return false;
            }

            var physicalPath = Path.Combine(
                _environment.WebRootPath,
                attachment.FilePath.Replace("/", "\\"));

            if (File.Exists(physicalPath))
            {
                File.Delete(physicalPath);
            }

            _context.MeetingAttachments.Remove(attachment);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully deleted attachment with ID: {AttachmentId}", attachmentId);
            return true;
        }
    }
}