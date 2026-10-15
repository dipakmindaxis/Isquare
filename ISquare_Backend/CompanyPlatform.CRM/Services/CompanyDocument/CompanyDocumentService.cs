using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CompanyDocument;
using CompanyPlatform.Core.Repository;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.CompanyDocument
{
    public class CompanyDocumentService : ICompanyDocumentService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyDocument> _repository;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<CompanyDocumentService> _logger;

        public CompanyDocumentService(
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyDocument> repository,
            IWebHostEnvironment environment,
            ILogger<CompanyDocumentService> logger)
        {
            _repository = repository;
            _environment = environment;
            _logger = logger;
        }

        public async Task<IEnumerable<CompanyDocumentDto>> GetAllCompanyDocumentsAsync()
        {
            _logger.LogInformation("Fetching all company documents.");

            var documents = await _repository.GetAll();

            return documents
                .Where(x => x.IsActive)
                .Select(x => new CompanyDocumentDto
                {
                    DocumentId = x.DocumentId,
                    CompanyId = x.CompanyId,
                    DocumentTypeId = x.DocumentTypeId,
                    DocumentName = x.DocumentName,
                    FileName = x.FileName,
                    FilePath = x.FilePath,
                    FileExtension = x.FileExtension,
                    FileSize = x.FileSize,
                    UploadedBy = x.UploadedBy,
                    UploadedDate = x.UploadedDate,
                    IsActive = x.IsActive
                });
        }

        public async Task<CompanyDocumentDto> GetCompanyDocumentByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Company Document with ID : {DocumentId}", id);

            var document = await _repository.GetByIdAsync(id);

            if (document == null || !document.IsActive)
            {
                _logger.LogWarning("Company Document not found.");
                return null;
            }

            return new CompanyDocumentDto
            {
                DocumentId = document.DocumentId,
                CompanyId = document.CompanyId,
                DocumentTypeId = document.DocumentTypeId,
                DocumentName = document.DocumentName,
                FileName = document.FileName,
                FilePath = document.FilePath,
                FileExtension = document.FileExtension,
                FileSize = document.FileSize,
                UploadedBy = document.UploadedBy,
                UploadedDate = document.UploadedDate,
                IsActive = document.IsActive
            };
        }

        public async Task<CompanyDocumentDto> CreateCompanyDocumentAsync(CompanyDocumentDto dto)
        {
            _logger.LogInformation("Creating Company Document.");

            if (dto.File == null || dto.File.Length == 0)
                throw new ArgumentException("Please select a file.");

            var uploadFolder = Path.Combine(
                _environment.WebRootPath,
                "Uploads",
                "CompanyDocuments");

            if (!Directory.Exists(uploadFolder))
                Directory.CreateDirectory(uploadFolder);

            var extension = Path.GetExtension(dto.File.FileName);
            var fileName = Guid.NewGuid().ToString() + extension;
            var filePath = Path.Combine(uploadFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            var document = new CompanyPlatform.Core.Models.CRM.Company.CompanyDocument {
                CompanyId = dto.CompanyId,
                DocumentTypeId = dto.DocumentTypeId,
                DocumentName = dto.DocumentName,
                FileName = fileName,
                FilePath = Path.Combine("Uploads", "CompanyDocuments", fileName),
                FileExtension = extension,
                FileSize = dto.File.Length,
                UploadedBy = dto.UploadedBy,
                UploadedDate = DateTime.Now,
                IsActive = dto.IsActive ?? true
            };

            await _repository.Create(document);

            return new CompanyDocumentDto
            {
                DocumentId = document.DocumentId,
                CompanyId = document.CompanyId,
                DocumentTypeId = document.DocumentTypeId,
                DocumentName = document.DocumentName,
                FileName = document.FileName,
                FilePath = document.FilePath,
                FileExtension = document.FileExtension,
                FileSize = document.FileSize,
                UploadedBy = document.UploadedBy,
                UploadedDate = document.UploadedDate,
                IsActive = document.IsActive
            };
        }

        public async Task<bool> UpdateCompanyDocumentAsync(
            int id,
            CompanyDocumentDto dto)
        {
            _logger.LogInformation(
                "Updating Company Document with ID: {DocumentId}",
                id);

            var document = await _repository.GetByIdAsync(id);

            if (document == null)
                return false;

            document.CompanyId = dto.CompanyId;
            document.DocumentTypeId = dto.DocumentTypeId;
            document.DocumentName = dto.DocumentName;
            document.UploadedBy = dto.UploadedBy;
            if (dto.IsActive.HasValue)
            {
                document.IsActive = dto.IsActive.Value;
            }

            if (dto.File != null && dto.File.Length > 0)
            {
                var uploadFolder = Path.Combine(
                    _environment.WebRootPath,
                    "Uploads",
                    "CompanyDocuments");

                if (!Directory.Exists(uploadFolder))
                    Directory.CreateDirectory(uploadFolder);

                // Delete old physical file
                if (!string.IsNullOrEmpty(document.FilePath))
                {
                    var oldFile = Path.Combine(
                        _environment.WebRootPath,
                        document.FilePath);

                    if (File.Exists(oldFile))
                        File.Delete(oldFile);
                }

                // Generate new file name
                var extension = Path.GetExtension(dto.File.FileName);

                var fileName = Guid.NewGuid().ToString() + extension;

                var filePath = Path.Combine(
                    uploadFolder,
                    fileName);

                // Save new file
                using (var stream = new FileStream(
                    filePath,
                    FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }

                // Update file information
                document.FileName = fileName;

                document.FilePath = Path.Combine(
                    "Uploads",
                    "CompanyDocuments",
                    fileName);

                document.FileExtension = extension;

                document.FileSize = dto.File.Length;
            }

            await _repository.Update(document);

            return true;
        }
        public async Task<bool> DeleteCompanyDocumentAsync(int id)
        {
            _logger.LogInformation("Deleting Company Document.");

            var document = await _repository.GetByIdAsync(id);

            if (document == null)
                return false;

            document.IsActive = false;

            await _repository.Update(document);

            return true;
        }
    }
}