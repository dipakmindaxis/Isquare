using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Services
{
    public class PlaceOfSupplyService : IPlaceOfSupplyService
    {
        private readonly ApplicationDBContext _context;

        public PlaceOfSupplyService(ApplicationDBContext context)
        {
            _context = context;
        }

        // Get all non-deleted Place Of Supplies (Admin master list)
        public async Task<IEnumerable<PlaceOfSupplyResponseDto>> GetAllAsync()
        {
            return await _context.PlaceOfSupplies
                .OrderBy(p => p.PlaceOfSupplySortOrder ?? int.MaxValue)
                .ThenBy(p => p.PlaceOfSupplyName)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        // Get only active, non-deleted Place Of Supplies (for new enquiries dropdown)
        public async Task<IEnumerable<PlaceOfSupplyResponseDto>> GetActiveForDropdownAsync()
        {
            return await _context.PlaceOfSupplies
                .Where(p => p.PlaceOfSupplyIsActive && !p.PlaceOfSupplyIsDeleted)
                .OrderBy(p => p.PlaceOfSupplySortOrder ?? int.MaxValue)
                .ThenBy(p => p.PlaceOfSupplyName)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        public async Task<PlaceOfSupplyResponseDto?> GetByIdAsync(int id)
        {
            var entity = await _context.PlaceOfSupplies.FindAsync(id);
            if (entity == null || entity.PlaceOfSupplyIsDeleted)
            {
                return null;
            }

            return MapToDto(entity);
        }

        public async Task<PlaceOfSupplyResponseDto> CreateAsync(PlaceOfSupplyCreateDto dto)
        {
            // Verify code uniqueness among active/non-deleted records
            var exists = await _context.PlaceOfSupplies
                .AnyAsync(p => p.PlaceOfSupplyCode.ToLower() == dto.PlaceOfSupplyCode.Trim().ToLower() && !p.PlaceOfSupplyIsDeleted);

            if (exists)
            {
                throw new InvalidOperationException($"Place of Supply with Code '{dto.PlaceOfSupplyCode}' already exists.");
            }

            var entity = new PlaceOfSupply
            {
                PlaceOfSupplyCode = dto.PlaceOfSupplyCode.Trim().ToUpper(),
                PlaceOfSupplyName = dto.PlaceOfSupplyName.Trim(),
                PlaceOfSupplyDescription = dto.PlaceOfSupplyDescription?.Trim(),
                PlaceOfSupplySortOrder = dto.PlaceOfSupplySortOrder,
                PlaceOfSupplyIsActive = dto.PlaceOfSupplyIsActive,
                PlaceOfSupplyIsDeleted = false,
                PlaceOfSupplyCreatedAt = DateTime.UtcNow,
            };

            await _context.PlaceOfSupplies.AddAsync(entity);
            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<PlaceOfSupplyResponseDto?> UpdateAsync(int id, PlaceOfSupplyUpdateDto dto)
        {
            var entity = await _context.PlaceOfSupplies.FindAsync(id);
            if (entity == null || entity.PlaceOfSupplyIsDeleted)
            {
                return null;
            }

            entity.PlaceOfSupplyName = dto.PlaceOfSupplyName.Trim();
            entity.PlaceOfSupplyDescription = dto.PlaceOfSupplyDescription?.Trim();
            entity.PlaceOfSupplySortOrder = dto.PlaceOfSupplySortOrder;
            entity.PlaceOfSupplyIsActive = dto.PlaceOfSupplyIsActive;
            entity.PlaceOfSupplyUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        // Soft delete logic
        public async Task<bool> DeleteAsync(int id, int? deletedBy = null)
        {
            var entity = await _context.PlaceOfSupplies.FindAsync(id);
            if (entity == null || entity.PlaceOfSupplyIsDeleted)
            {
                return false;
            }

            entity.PlaceOfSupplyIsDeleted = true;
            entity.PlaceOfSupplyIsActive = false; // Deactivate on soft delete
            entity.PlaceOfSupplyUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // Mapping Helper
        private static PlaceOfSupplyResponseDto MapToDto(PlaceOfSupply entity)
        {
            return new PlaceOfSupplyResponseDto
            {
                PlaceOfSupplyId = entity.PlaceOfSupplyId,
                PlaceOfSupplyCode = entity.PlaceOfSupplyCode,
                PlaceOfSupplyName = entity.PlaceOfSupplyName,
                PlaceOfSupplyDescription = entity.PlaceOfSupplyDescription,
                PlaceOfSupplySortOrder = entity.PlaceOfSupplySortOrder,
                PlaceOfSupplyIsActive = entity.PlaceOfSupplyIsActive,
                PlaceOfSupplyIsDeleted = entity.PlaceOfSupplyIsDeleted,
                PlaceOfSupplyCreatedAt = entity.PlaceOfSupplyCreatedAt,
                PlaceOfSupplyUpdatedAt = entity.PlaceOfSupplyUpdatedAt,
            };
        }
    }
}