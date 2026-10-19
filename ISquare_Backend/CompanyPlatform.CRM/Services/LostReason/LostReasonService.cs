using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Services
{
    public class LostReasonService : ILostReasonService
    {
        private readonly ApplicationDBContext _context;

        public LostReasonService(ApplicationDBContext context)
        {
            _context = context;
        }

        // Get all non-deleted lost reasons (Admin master list)
        public async Task<IEnumerable<LostReasonResponseDto>> GetAllAsync()
        {
            return await _context.LostReasons
                .OrderBy(r => r.LostReasonSortOrder ?? int.MaxValue)
                .ThenBy(r => r.LostReasonName)
                .Select(r => MapToDto(r))
                .ToListAsync();
        }

        // Get only active, non-deleted lost reasons for dropdowns
        public async Task<IEnumerable<LostReasonResponseDto>> GetActiveForDropdownAsync()
        {
            return await _context.LostReasons
                .Where(r => r.LostReasonIsActive && !r.LostReasonIsDeleted)
                .OrderBy(r => r.LostReasonSortOrder ?? int.MaxValue)
                .ThenBy(r => r.LostReasonName)
                .Select(r => MapToDto(r))
                .ToListAsync();
        }

        public async Task<LostReasonResponseDto?> GetByIdAsync(int id)
        {
            var entity = await _context.LostReasons.FindAsync(id);
            if (entity == null || entity.LostReasonIsDeleted)
            {
                return null;
            }

            return MapToDto(entity);
        }

        public async Task<LostReasonResponseDto> CreateAsync(LostReasonCreateDto dto)
        {
            // Verify code uniqueness among active/non-deleted records
            var exists = await _context.LostReasons
                .AnyAsync(r => r.LostReasonCode.ToLower() == dto.LostReasonCode.Trim().ToLower() && !r.LostReasonIsDeleted);

            if (exists)
            {
                throw new InvalidOperationException($"Lost Reason with Code '{dto.LostReasonCode}' already exists.");
            }

            var entity = new LostReason
            {
                LostReasonCode = dto.LostReasonCode.Trim().ToUpper(),
                LostReasonName = dto.LostReasonName.Trim(),
                LostReasonDescription = dto.LostReasonDescription?.Trim(),
                LostReasonSortOrder = dto.LostReasonSortOrder,
                LostReasonIsActive = dto.LostReasonIsActive,
                LostReasonIsDeleted = false,
                LostReasonCreatedAt = DateTime.UtcNow,
            };

            await _context.LostReasons.AddAsync(entity);
            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<LostReasonResponseDto?> UpdateAsync(int id, LostReasonUpdateDto dto)
        {
            var entity = await _context.LostReasons.FindAsync(id);
            if (entity == null || entity.LostReasonIsDeleted)
            {
                return null;
            }

            entity.LostReasonName = dto.LostReasonName.Trim();
            entity.LostReasonDescription = dto.LostReasonDescription?.Trim();
            entity.LostReasonSortOrder = dto.LostReasonSortOrder;
            entity.LostReasonIsActive = dto.LostReasonIsActive;
            entity.LostReasonUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        // Soft delete logic
        public async Task<bool> DeleteAsync(int id, int? deletedBy = null)
        {
            var entity = await _context.LostReasons.FindAsync(id);
            if (entity == null || entity.LostReasonIsDeleted)
            {
                return false;
            }

            entity.LostReasonIsDeleted = true;
            entity.LostReasonIsActive = false; // Deactivate on soft delete
            entity.LostReasonUpdatedAt = DateTime.UtcNow;
          

            await _context.SaveChangesAsync();
            return true;
        }

        // Mapping Helper
        private static LostReasonResponseDto MapToDto(LostReason entity)
        {
            return new LostReasonResponseDto
            {
                LostReasonId = entity.LostReasonId,
                LostReasonCode = entity.LostReasonCode,
                LostReasonName = entity.LostReasonName,
                LostReasonDescription = entity.LostReasonDescription,
                LostReasonSortOrder = entity.LostReasonSortOrder,
                LostReasonIsActive = entity.LostReasonIsActive,
                LostReasonIsDeleted = entity.LostReasonIsDeleted,
                LostReasonCreatedAt = entity.LostReasonCreatedAt,
                LostReasonUpdatedAt = entity.LostReasonUpdatedAt,
            };
        }
    }
}