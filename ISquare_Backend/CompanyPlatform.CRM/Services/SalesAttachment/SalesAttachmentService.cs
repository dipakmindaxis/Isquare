using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO.SalesAttachment;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using SalesAttachmentEntity = CompanyPlatform.Core.Models.CRM.SalesAttachment;

namespace CompanyPlatform.CRM.Services.SalesAttachment
{
    public class SalesAttachmentService : ISalesAttachmentService
    {
        private readonly IRepositories<SalesAttachmentEntity> _repository;
        private readonly ILogger<SalesAttachmentService> _logger;
        private readonly string _uploadDirectory;

        private const long MaxFileSize = 10 * 1024 * 1024;

        private static readonly string[] AllowedExtensions =
        {
            ".pdf", ".png", ".jpg", ".jpeg",
            ".doc", ".docx", ".xls", ".xlsx"
        };

        public SalesAttachmentService(
            IRepositories<SalesAttachmentEntity> repository,
            ILogger<SalesAttachmentService> logger,
            IWebHostEnvironment environment)
        {
            _repository = repository;
            _logger = logger;

            _uploadDirectory = Path.Combine(
                environment.ContentRootPath,
                "App_Data",
                "SalesAttachments");
        }

        public async Task<IEnumerable<SalesAttachmentDto>>
            GetAllSalesAttachmentsAsync()
        {
            var attachments = await _repository.GetAll();

            return attachments
                .Where(x => !x.IsDeleted && x.IsActive)
                .OrderByDescending(x => x.UploadedDate)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<SalesAttachmentDto?>
            GetSalesAttachmentByIdAsync(int id)
        {
            var attachment = await _repository.GetByIdAsync(id);

            if (attachment == null ||
                attachment.IsDeleted ||
                !attachment.IsActive)
            {
                return null;
            }

            return MapToDto(attachment);
        }

        public async Task<SalesAttachmentDto>
            UploadSalesAttachmentAsync(
                SalesAttachmentUploadDto dto,
                int? uploadedBy)
        {
            if (dto.File == null || dto.File.Length == 0)
            {
                throw new ArgumentException(
                    "Please select a file to upload.");
            }

            if (dto.File.Length > MaxFileSize)
            {
                throw new ArgumentException(
                    "Maximum allowed file size is 10 MB.");
            }

            var extension = Path.GetExtension(dto.File.FileName);

            if (string.IsNullOrWhiteSpace(extension) ||
                !AllowedExtensions.Contains(
                    extension,
                    StringComparer.OrdinalIgnoreCase))
            {
                throw new ArgumentException(
                    "This file type is not allowed.");
            }

            Directory.CreateDirectory(_uploadDirectory);

            var originalFileName =
                Path.GetFileName(dto.File.FileName);

            var storedFileName =
                $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";

            var physicalPath = Path.Combine(
                _uploadDirectory,
                storedFileName);

            var fileSaved = false;

            try
            {
                await using (var stream = new FileStream(
                    physicalPath,
                    FileMode.CreateNew,
                    FileAccess.Write,
                    FileShare.None))
                {
                    await dto.File.CopyToAsync(stream);
                }

                fileSaved = true;

                var attachment = new SalesAttachmentEntity
                {
                    FileName = originalFileName,
                    StoredFileName = storedFileName,
                    FilePath = Path.Combine(
                        "App_Data",
                        "SalesAttachments",
                        storedFileName),
                    ContentType = dto.File.ContentType,
                    FileSize = dto.File.Length,
                    CustomerId = dto.CustomerId,
                    EnquiryId = dto.EnquiryId,
                    SalesActivityId = dto.SalesActivityId,
                    DocumentType = dto.DocumentType,
                    UploadedBy = uploadedBy,
                    UploadedDate = DateTime.UtcNow,
                    IsActive = true,
                    IsDeleted = false
                };

                await _repository.Create(attachment);

                _logger.LogInformation(
                    "Sales attachment uploaded. ID: {Id}",
                    attachment.SalesAttachmentId);

                return MapToDto(attachment);
            }
            catch
            {
                // Remove the file if the database operation fails.
                if (fileSaved && File.Exists(physicalPath))
                {
                    File.Delete(physicalPath);
                }

                throw;
            }
        }

        public async Task<(Stream Stream, string ContentType, string FileName)?>
            DownloadSalesAttachmentAsync(int id)
        {
            var attachment = await _repository.GetByIdAsync(id);

            if (attachment == null ||
                attachment.IsDeleted ||
                !attachment.IsActive)
            {
                return null;
            }

            var physicalPath = Path.GetFullPath(
                Path.Combine(
                    _uploadDirectory,
                    attachment.StoredFileName));

            var uploadRoot = Path.GetFullPath(_uploadDirectory)
                + Path.DirectorySeparatorChar;

            if (!physicalPath.StartsWith(
                uploadRoot,
                StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Invalid attachment file path.");
            }

            if (!File.Exists(physicalPath))
            {
                return null;
            }

            Stream stream = new FileStream(
                physicalPath,
                FileMode.Open,
                FileAccess.Read,
                FileShare.Read);

            return (
                stream,
                attachment.ContentType ?? "application/octet-stream",
                attachment.FileName
            );
        }

        public async Task<bool>
            DeleteSalesAttachmentAsync(int id)
        {
            var attachment = await _repository.GetByIdAsync(id);

            if (attachment == null || attachment.IsDeleted)
            {
                return false;
            }

            attachment.IsDeleted = true;
            attachment.IsActive = false;

            await _repository.Update(attachment);

            _logger.LogInformation(
                "Sales attachment {Id} soft-deleted.",
                id);

            return true;
        }

        private static SalesAttachmentDto MapToDto(
            SalesAttachmentEntity attachment)
        {
            return new SalesAttachmentDto
            {
                SalesAttachmentId = attachment.SalesAttachmentId,
                FileName = attachment.FileName,
                FileSize = attachment.FileSize,
                ContentType = attachment.ContentType,
                CustomerId = attachment.CustomerId,
                EnquiryId = attachment.EnquiryId,
                SalesActivityId = attachment.SalesActivityId,
                DocumentType = attachment.DocumentType,
                UploadedBy = attachment.UploadedBy,
                UploadedDate = attachment.UploadedDate,
                IsActive = attachment.IsActive
            };
        }
    }
}

