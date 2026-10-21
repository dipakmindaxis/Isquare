using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Services
{
    public class UnitOfMeasureService : IUnitOfMeasureService
    {
        private readonly ApplicationDBContext _context;

        public UnitOfMeasureService(ApplicationDBContext context)
        {
            _context = context;
        }

        // Get all non-deleted Unit of Measures (Admin master list)
        public async Task<IEnumerable<UnitOfMeasureResponseDto>> GetAllAsync()
        {
            return await _context.UnitOfMeasures
                .OrderBy(u => u.UnitOfMeasureSortOrder ?? int.MaxValue)
                .ThenBy(u => u.UnitOfMeasureName)
                .Select(u => MapToDto(u))
                .ToListAsync();
        }

        // Get only active, non-deleted Unit of Measures (for new enquiries dropdown)
        public async Task<IEnumerable<UnitOfMeasureResponseDto>> GetActiveForDropdownAsync()
        {
            return await _context.UnitOfMeasures
                .Where(u => u.UnitOfMeasureIsActive && !u.UnitOfMeasureIsDeleted)
                .OrderBy(u => u.UnitOfMeasureSortOrder ?? int.MaxValue)
                .ThenBy(u => u.UnitOfMeasureName)
                .Select(u => MapToDto(u))
                .ToListAsync();
        }

        public async Task<UnitOfMeasureResponseDto?> GetByIdAsync(int id)
        {
            var entity = await _context.UnitOfMeasures.FindAsync(id);
            if (entity == null || entity.UnitOfMeasureIsDeleted)
            {
                return null;
            }

            return MapToDto(entity);
        }

        public async Task<UnitOfMeasureResponseDto> CreateAsync(UnitOfMeasureCreateDto dto)
        {
            // Verify code uniqueness among active/non-deleted records
            var exists = await _context.UnitOfMeasures
                .AnyAsync(u => u.UnitOfMeasureCode.ToLower() == dto.UnitOfMeasureCode.Trim().ToLower() && !u.UnitOfMeasureIsDeleted);

            if (exists)
            {
                throw new InvalidOperationException($"Unit of Measure with Code '{dto.UnitOfMeasureCode}' already exists.");
            }

            var entity = new UnitOfMeasure
            {
                UnitOfMeasureCode = dto.UnitOfMeasureCode.Trim().ToUpper(),
                UnitOfMeasureName = dto.UnitOfMeasureName.Trim(),
                UnitOfMeasureDescription = dto.UnitOfMeasureDescription?.Trim(),
                UnitOfMeasureSortOrder = dto.UnitOfMeasureSortOrder,
                UnitOfMeasureIsActive = dto.UnitOfMeasureIsActive,
                UnitOfMeasureIsDeleted = false,
                UnitOfMeasureCreatedAt = DateTime.UtcNow,
            };

            await _context.UnitOfMeasures.AddAsync(entity);
            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<UnitOfMeasureResponseDto?> UpdateAsync(int id, UnitOfMeasureUpdateDto dto)
        {
            var entity = await _context.UnitOfMeasures.FindAsync(id);
            if (entity == null || entity.UnitOfMeasureIsDeleted)
            {
                return null;
            }

            entity.UnitOfMeasureName = dto.UnitOfMeasureName.Trim();
            entity.UnitOfMeasureDescription = dto.UnitOfMeasureDescription?.Trim();
            entity.UnitOfMeasureSortOrder = dto.UnitOfMeasureSortOrder;
            entity.UnitOfMeasureIsActive = dto.UnitOfMeasureIsActive;
            entity.UnitOfMeasureUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        // Soft delete logic
        public async Task<bool> DeleteAsync(int id, int? deletedBy = null)
        {
            var entity = await _context.UnitOfMeasures.FindAsync(id);
            if (entity == null || entity.UnitOfMeasureIsDeleted)
            {
                return false;
            }

            entity.UnitOfMeasureIsDeleted = true;
            entity.UnitOfMeasureIsActive = false; // Deactivate on soft delete
            entity.UnitOfMeasureUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // Mapping Helper
        private static UnitOfMeasureResponseDto MapToDto(UnitOfMeasure entity)
        {
            return new UnitOfMeasureResponseDto
            {
                UnitOfMeasureId = entity.UnitOfMeasureId,
                UnitOfMeasureCode = entity.UnitOfMeasureCode,
                UnitOfMeasureName = entity.UnitOfMeasureName,
                UnitOfMeasureDescription = entity.UnitOfMeasureDescription,
                UnitOfMeasureSortOrder = entity.UnitOfMeasureSortOrder,
                UnitOfMeasureIsActive = entity.UnitOfMeasureIsActive,
                UnitOfMeasureIsDeleted = entity.UnitOfMeasureIsDeleted,
                UnitOfMeasureCreatedAt = entity.UnitOfMeasureCreatedAt,
                UnitOfMeasureUpdatedAt = entity.UnitOfMeasureUpdatedAt,
            };
        }
    }
}