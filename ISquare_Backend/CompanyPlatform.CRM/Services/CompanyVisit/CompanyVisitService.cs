using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.Core.Repository;

namespace CompanyPlatform.CRM.Services.CompanyVisit
{
    public class CompanyVisitService : ICompanyVisitService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyVisit> _repository;
        private readonly ILogger<CompanyVisitService> _logger;

        public CompanyVisitService(
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyVisit> repository,
            ILogger<CompanyVisitService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<CompanyVisitDto>> GetAllCompanyVisitsAsync()
        {
            _logger.LogInformation("Fetching all active company visits.");

            var visits = await _repository.GetAll();

            return visits
                .Where(v => v.IsActive)
                .Select(v => new CompanyVisitDto
                {
                    VisitId = v.VisitId,
                    CompanyId = v.CompanyId,
                    VisitTypeId = v.VisitTypeId,
                    UserId = v.UserId,
                    VisitDate = v.VisitDate,
                    CheckInTime = v.CheckInTime,
                    CheckOutTime = v.CheckOutTime,
                    Location = v.Location,
                    Latitude = v.Latitude,
                    Longitude = v.Longitude,
                    Remarks = v.Remarks,
                    CreatedDate = v.CreatedDate,
                    IsActive = v.IsActive,
                    IsDeleted = v.IsDeleted
                });
        }

        public async Task<CompanyVisitDto> GetCompanyVisitByIdAsync(int id)
        {
            _logger.LogInformation("Fetching company visit by ID: {VisitId}", id);

            var visit = await _repository.GetByIdAsync(id);

            if (visit == null || visit.IsActive == false)
            {
                _logger.LogWarning("Company visit not found with ID: {VisitId}", id);
                return null;
            }

            return new CompanyVisitDto
            {
                VisitId = visit.VisitId,
                CompanyId = visit.CompanyId,
                VisitTypeId = visit.VisitTypeId,
                UserId = visit.UserId,
                VisitDate = visit.VisitDate,
                CheckInTime = visit.CheckInTime,
                CheckOutTime = visit.CheckOutTime,
                Location = visit.Location,
                Latitude = visit.Latitude,
                Longitude = visit.Longitude,
                Remarks = visit.Remarks,
                CreatedDate = visit.CreatedDate,
                IsActive = visit.IsActive,
                IsDeleted = visit.IsDeleted
            };
        }

        public async Task<CompanyVisitDto> CreateCompanyVisitAsync(CompanyVisitDto dto)
        {
            _logger.LogInformation("Creating company visit.");

            var visit = new CompanyPlatform.Core.Models.CRM.Company.CompanyVisit {
                CompanyId = dto.CompanyId,
                VisitTypeId = dto.VisitTypeId,
                UserId = dto.UserId,
                VisitDate = dto.VisitDate,
                CheckInTime = dto.CheckInTime,
                CheckOutTime = dto.CheckOutTime,
                Location = dto.Location,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Remarks = dto.Remarks,
                CreatedDate = DateTime.Now,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(visit);

            dto.VisitId = visit.VisitId;
            dto.CreatedDate = visit.CreatedDate;
            dto.IsActive = visit.IsActive;
            dto.IsDeleted = visit.IsDeleted;

            _logger.LogInformation("Company visit created successfully with ID: {VisitId}", visit.VisitId);

            return dto;
        }

        public async Task<bool> UpdateCompanyVisitAsync(int id, CompanyVisitDto dto)
        {
            _logger.LogInformation("Updating company visit with ID: {VisitId}", id);

            var visit = await _repository.GetByIdAsync(id);

            if (visit == null || visit.IsActive == false)
            {
                _logger.LogWarning("Company visit not found with ID: {VisitId}", id);
                return false;
            }

            visit.CompanyId = dto.CompanyId;
            visit.VisitTypeId = dto.VisitTypeId;
            visit.UserId = dto.UserId;
            visit.VisitDate = dto.VisitDate;
            visit.CheckInTime = dto.CheckInTime;
            visit.CheckOutTime = dto.CheckOutTime;
            visit.Location = dto.Location;
            visit.Latitude = dto.Latitude;
            visit.Longitude = dto.Longitude;
            visit.Remarks = dto.Remarks;

            await _repository.Update(visit);

            _logger.LogInformation("Company visit updated successfully.");

            return true;
        }

        public async Task<bool> DeleteCompanyVisitAsync(int id)
        {
            _logger.LogInformation("Deleting company visit with ID: {VisitId}", id);

            var visit = await _repository.GetByIdAsync(id);

            if (visit == null)
            {
                _logger.LogWarning("Company visit not found with ID: {VisitId}", id);
                return false;
            }

            visit.IsActive = false;
            visit.IsDeleted = true;

            await _repository.Update(visit);

            _logger.LogInformation("Company visit deleted successfully.");

            return true;
        }
    }
}