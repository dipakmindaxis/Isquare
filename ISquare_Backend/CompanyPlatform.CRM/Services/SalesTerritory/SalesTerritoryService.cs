using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Services
{
    public class SalesTerritoryService : ISalesTerritoryService
    {
        private readonly ApplicationDBContext _context;

        public SalesTerritoryService(ApplicationDBContext context)
        {
            _context = context;
        }

        // Get all non-deleted Sales Territories (Admin master list)
        public async Task<IEnumerable<SalesTerritoryResponseDto>> GetAllAsync()
        {
            return await _context.SalesTerritories
                .OrderBy(s => s.SalesTerritorySortOrder ?? int.MaxValue)
                .ThenBy(s => s.SalesTerritoryName)
                .Select(s => MapToDto(s))
                .ToListAsync();
        }

        // Get only active, non-deleted Sales Territories (for new enquiries dropdown)
        public async Task<IEnumerable<SalesTerritoryResponseDto>> GetActiveForDropdownAsync()
        {
            return await _context.SalesTerritories
                .Where(s => s.SalesTerritoryIsActive && !s.SalesTerritoryIsDeleted)
                .OrderBy(s => s.SalesTerritorySortOrder ?? int.MaxValue)
                .ThenBy(s => s.SalesTerritoryName)
                .Select(s => MapToDto(s))
                .ToListAsync();
        }

        public async Task<SalesTerritoryResponseDto?> GetByIdAsync(int id)
        {
            var entity = await _context.SalesTerritories.FindAsync(id);
            if (entity == null || entity.SalesTerritoryIsDeleted)
            {
                return null;
            }

            return MapToDto(entity);
        }

        public async Task<SalesTerritoryResponseDto> CreateAsync(SalesTerritoryCreateDto dto)
        {
            // Verify code uniqueness among active/non-deleted records
            var exists = await _context.SalesTerritories
                .AnyAsync(s => s.SalesTerritoryCode.ToLower() == dto.SalesTerritoryCode.Trim().ToLower() && !s.SalesTerritoryIsDeleted);

            if (exists)
            {
                throw new InvalidOperationException($"Sales Territory with Code '{dto.SalesTerritoryCode}' already exists.");
            }

            var entity = new SalesTerritory
            {
                SalesTerritoryCode = dto.SalesTerritoryCode.Trim().ToUpper(),
                SalesTerritoryName = dto.SalesTerritoryName.Trim(),
                SalesTerritoryDescription = dto.SalesTerritoryDescription?.Trim(),
                SalesTerritorySortOrder = dto.SalesTerritorySortOrder,
                SalesTerritoryIsActive = dto.SalesTerritoryIsActive,
                SalesTerritoryIsDeleted = false,
                SalesTerritoryCreatedAt = DateTime.UtcNow,
            };

            await _context.SalesTerritories.AddAsync(entity);
            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<SalesTerritoryResponseDto?> UpdateAsync(int id, SalesTerritoryUpdateDto dto)
        {
            var entity = await _context.SalesTerritories.FindAsync(id);
            if (entity == null || entity.SalesTerritoryIsDeleted)
            {
                return null;
            }

            entity.SalesTerritoryName = dto.SalesTerritoryName.Trim();
            entity.SalesTerritoryDescription = dto.SalesTerritoryDescription?.Trim();
            entity.SalesTerritorySortOrder = dto.SalesTerritorySortOrder;
            entity.SalesTerritoryIsActive = dto.SalesTerritoryIsActive;
            entity.SalesTerritoryUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        // Soft delete logic
        public async Task<bool> DeleteAsync(int id, int? deletedBy = null)
        {
            var entity = await _context.SalesTerritories.FindAsync(id);
            if (entity == null || entity.SalesTerritoryIsDeleted)
            {
                return false;
            }

            entity.SalesTerritoryIsDeleted = true;
            entity.SalesTerritoryIsActive = false; // Deactivate on soft delete
            entity.SalesTerritoryUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // Mapping Helper
        private static SalesTerritoryResponseDto MapToDto(SalesTerritory entity)
        {
            return new SalesTerritoryResponseDto
            {
                SalesTerritoryId = entity.SalesTerritoryId,
                SalesTerritoryCode = entity.SalesTerritoryCode,
                SalesTerritoryName = entity.SalesTerritoryName,
                SalesTerritoryDescription = entity.SalesTerritoryDescription,
                SalesTerritorySortOrder = entity.SalesTerritorySortOrder,
                SalesTerritoryIsActive = entity.SalesTerritoryIsActive,
                SalesTerritoryIsDeleted = entity.SalesTerritoryIsDeleted,
                SalesTerritoryCreatedAt = entity.SalesTerritoryCreatedAt,
                SalesTerritoryUpdatedAt = entity.SalesTerritoryUpdatedAt,
            };
        }
    }
}