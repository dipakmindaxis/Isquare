using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Services
{
    public class CurrencyService : ICurrencyService
    {
        private readonly ApplicationDBContext _context;

        public CurrencyService(ApplicationDBContext context)
        {
            _context = context;
        }

        // Get all non-deleted Currencies (Admin master list)
        public async Task<IEnumerable<CurrencyResponseDto>> GetAllAsync()
        {
            return await _context.Currencies
                .OrderBy(c => c.CurrencySortOrder ?? int.MaxValue)
                .ThenBy(c => c.CurrencyName)
                .Select(c => MapToDto(c))
                .ToListAsync();
        }

        // Get only active, non-deleted Currencies (for new enquiries dropdown)
        public async Task<IEnumerable<CurrencyResponseDto>> GetActiveForDropdownAsync()
        {
            return await _context.Currencies
                .Where(c => c.CurrencyIsActive && !c.CurrencyIsDeleted)
                .OrderBy(c => c.CurrencySortOrder ?? int.MaxValue)
                .ThenBy(c => c.CurrencyName)
                .Select(c => MapToDto(c))
                .ToListAsync();
        }

        public async Task<CurrencyResponseDto?> GetByIdAsync(int id)
        {
            var entity = await _context.Currencies.FindAsync(id);
            if (entity == null || entity.CurrencyIsDeleted)
            {
                return null;
            }

            return MapToDto(entity);
        }

        public async Task<CurrencyResponseDto> CreateAsync(CurrencyCreateDto dto)
        {
            // Verify code uniqueness among active/non-deleted records
            var exists = await _context.Currencies
                .AnyAsync(c => c.CurrencyCode.ToLower() == dto.CurrencyCode.Trim().ToLower() && !c.CurrencyIsDeleted);

            if (exists)
            {
                throw new InvalidOperationException($"Currency with Code '{dto.CurrencyCode}' already exists.");
            }

            var entity = new Currency
            {
                CurrencyCode = dto.CurrencyCode.Trim().ToUpper(),
                CurrencyName = dto.CurrencyName.Trim(),
                CurrencyDescription = dto.CurrencyDescription?.Trim(),
                CurrencySortOrder = dto.CurrencySortOrder,
                CurrencyIsActive = dto.CurrencyIsActive,
                CurrencyIsDeleted = false,
                CurrencyCreatedAt = DateTime.UtcNow,
            };

            await _context.Currencies.AddAsync(entity);
            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<CurrencyResponseDto?> UpdateAsync(int id, CurrencyUpdateDto dto)
        {
            var entity = await _context.Currencies.FindAsync(id);
            if (entity == null || entity.CurrencyIsDeleted)
            {
                return null;
            }

            entity.CurrencyName = dto.CurrencyName.Trim();
            entity.CurrencyDescription = dto.CurrencyDescription?.Trim();
            entity.CurrencySortOrder = dto.CurrencySortOrder;
            entity.CurrencyIsActive = dto.CurrencyIsActive;
            entity.CurrencyUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        // Soft delete logic
        public async Task<bool> DeleteAsync(int id, int? deletedBy = null)
        {
            var entity = await _context.Currencies.FindAsync(id);
            if (entity == null || entity.CurrencyIsDeleted)
            {
                return false;
            }

            entity.CurrencyIsDeleted = true;
            entity.CurrencyIsActive = false; // Deactivate on soft delete
            entity.CurrencyUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // Mapping Helper
        private static CurrencyResponseDto MapToDto(Currency entity)
        {
            return new CurrencyResponseDto
            {
                CurrencyId = entity.CurrencyId,
                CurrencyCode = entity.CurrencyCode,
                CurrencyName = entity.CurrencyName,
                CurrencyDescription = entity.CurrencyDescription,
                CurrencySortOrder = entity.CurrencySortOrder,
                CurrencyIsActive = entity.CurrencyIsActive,
                CurrencyIsDeleted = entity.CurrencyIsDeleted,
                CurrencyCreatedAt = entity.CurrencyCreatedAt,
                CurrencyUpdatedAt = entity.CurrencyUpdatedAt,
            };
        }
    }
}