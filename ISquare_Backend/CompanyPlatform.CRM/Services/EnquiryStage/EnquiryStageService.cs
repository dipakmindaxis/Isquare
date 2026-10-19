using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Services
{
    public class EnquiryStageService : IEnquiryStageService
    {
        private readonly ApplicationDBContext _context;

        public EnquiryStageService(ApplicationDBContext context)
        {
            _context = context;
        }

        // Get all non-deleted stages (Admin master list)
        public async Task<IEnumerable<EnquiryStageResponseDto>> GetAllAsync()
        {
            return await _context.EnquiryStages
                .OrderBy(s => s.EnquiryStageSortOrder ?? int.MaxValue)
                .ThenBy(s => s.EnquiryStageName)
                .Select(s => MapToDto(s))
                .ToListAsync();
        }

        // Get only active, non-deleted stages for dropdowns
        public async Task<IEnumerable<EnquiryStageResponseDto>> GetActiveForDropdownAsync()
        {
            return await _context.EnquiryStages
                .Where(s => s.EnquiryStageIsActive && !s.EnquiryStageIsDeleted)
                .OrderBy(s => s.EnquiryStageSortOrder ?? int.MaxValue)
                .ThenBy(s => s.EnquiryStageName)
                .Select(s => MapToDto(s))
                .ToListAsync();
        }

        public async Task<EnquiryStageResponseDto?> GetByIdAsync(int id)
        {
            var entity = await _context.EnquiryStages.FindAsync(id);
            if (entity == null || entity.EnquiryStageIsDeleted)
            {
                return null;
            }

            return MapToDto(entity);
        }

        public async Task<EnquiryStageResponseDto> CreateAsync(EnquiryStageCreateDto dto)
        {
            // Verify code uniqueness among active/non-deleted records
            var exists = await _context.EnquiryStages
                .AnyAsync(s => s.EnquiryStageCode.ToLower() == dto.EnquiryStageCode.Trim().ToLower() && !s.EnquiryStageIsDeleted);

            if (exists)
            {
                throw new InvalidOperationException($"Enquiry Stage with Code '{dto.EnquiryStageCode}' already exists.");
            }

            var entity = new EnquiryStage
            {
                EnquiryStageCode = dto.EnquiryStageCode.Trim().ToUpper(),
                EnquiryStageName = dto.EnquiryStageName.Trim(),
                EnquiryStageDescription = dto.EnquiryStageDescription?.Trim(),
                EnquiryStageSortOrder = dto.EnquiryStageSortOrder,
                EnquiryStageIsActive = dto.EnquiryStageIsActive,
                EnquiryStageIsDeleted = false,
                EnquiryStageCreatedAt = DateTime.UtcNow,
            };

            await _context.EnquiryStages.AddAsync(entity);
            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<EnquiryStageResponseDto?> UpdateAsync(int id, EnquiryStageUpdateDto dto)
        {
            var entity = await _context.EnquiryStages.FindAsync(id);
            if (entity == null || entity.EnquiryStageIsDeleted)
            {
                return null;
            }

            entity.EnquiryStageName = dto.EnquiryStageName.Trim();
            entity.EnquiryStageDescription = dto.EnquiryStageDescription?.Trim();
            entity.EnquiryStageSortOrder = dto.EnquiryStageSortOrder;
            entity.EnquiryStageIsActive = dto.EnquiryStageIsActive;
            entity.EnquiryStageUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        // Soft delete logic
        public async Task<bool> DeleteAsync(int id, int? deletedBy = null)
        {
            var entity = await _context.EnquiryStages.FindAsync(id);
            if (entity == null || entity.EnquiryStageIsDeleted)
            {
                return false;
            }

            entity.EnquiryStageIsDeleted = true;
            entity.EnquiryStageIsActive = false; // Deactivate on delete
            entity.EnquiryStageUpdatedAt = DateTime.UtcNow;
            

            await _context.SaveChangesAsync();
            return true;
        }

        // Mapping Helper
        private static EnquiryStageResponseDto MapToDto(EnquiryStage entity)
        {
            return new EnquiryStageResponseDto
            {
                EnquiryStageId = entity.EnquiryStageId,
                EnquiryStageCode = entity.EnquiryStageCode,
                EnquiryStageName = entity.EnquiryStageName,
                EnquiryStageDescription = entity.EnquiryStageDescription,
                EnquiryStageSortOrder = entity.EnquiryStageSortOrder,
                EnquiryStageIsActive = entity.EnquiryStageIsActive,
                EnquiryStageIsDeleted = entity.EnquiryStageIsDeleted,
                EnquiryStageCreatedAt = entity.EnquiryStageCreatedAt,
                EnquiryStageUpdatedAt = entity.EnquiryStageUpdatedAt,
            };
        }
    }
}