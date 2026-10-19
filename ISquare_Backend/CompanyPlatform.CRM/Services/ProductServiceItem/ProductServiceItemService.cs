using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Services
{
    public class ProductServiceItemService : IProductServiceItemService
    {
        private readonly ApplicationDBContext _context;

        public ProductServiceItemService(ApplicationDBContext context)
        {
            _context = context;
        }

        // Get all non-deleted products/services (Admin master list)
        public async Task<IEnumerable<ProductServiceResponseDto>> GetAllAsync()
        {
            return await _context.ProductServices
                .OrderBy(p => p.ProductServiceSortOrder ?? int.MaxValue)
                .ThenBy(p => p.ProductServiceName)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        // Get only active, non-deleted items for dropdowns
        public async Task<IEnumerable<ProductServiceResponseDto>> GetActiveForDropdownAsync()
        {
            return await _context.ProductServices
                .Where(p => p.ProductServiceIsActive && !p.ProductServiceIsDeleted)
                .OrderBy(p => p.ProductServiceSortOrder ?? int.MaxValue)
                .ThenBy(p => p.ProductServiceName)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        public async Task<ProductServiceResponseDto?> GetByIdAsync(int id)
        {
            var entity = await _context.ProductServices.FindAsync(id);
            if (entity == null || entity.ProductServiceIsDeleted)
            {
                return null;
            }

            return MapToDto(entity);
        }

        public async Task<ProductServiceResponseDto> CreateAsync(ProductServiceCreateDto dto)
        {
            // Verify code uniqueness among active/non-deleted records
            var exists = await _context.ProductServices
                .AnyAsync(p => p.ProductServiceCode.ToLower() == dto.ProductServiceCode.Trim().ToLower() && !p.ProductServiceIsDeleted);

            if (exists)
            {
                throw new InvalidOperationException($"Product/Service with Code '{dto.ProductServiceCode}' already exists.");
            }

            var entity = new ProductServiceItem
            {
                ProductServiceCode = dto.ProductServiceCode.Trim().ToUpper(),
                ProductServiceName = dto.ProductServiceName.Trim(),
                ProductServiceDescription = dto.ProductServiceDescription?.Trim(),
                ProductServiceSortOrder = dto.ProductServiceSortOrder,
                ProductServiceIsActive = dto.ProductServiceIsActive,
                ProductServiceIsDeleted = false,
                ProductServiceCreatedAt = DateTime.UtcNow,
            };

            await _context.ProductServices.AddAsync(entity);
            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<ProductServiceResponseDto?> UpdateAsync(int id, ProductServiceUpdateDto dto)
        {
            var entity = await _context.ProductServices.FindAsync(id);
            if (entity == null || entity.ProductServiceIsDeleted)
            {
                return null;
            }

            entity.ProductServiceName = dto.ProductServiceName.Trim();
            entity.ProductServiceDescription = dto.ProductServiceDescription?.Trim();
            entity.ProductServiceSortOrder = dto.ProductServiceSortOrder;
            entity.ProductServiceIsActive = dto.ProductServiceIsActive;
            entity.ProductServiceUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        // Soft delete logic
        public async Task<bool> DeleteAsync(int id, int? deletedBy = null)
        {
            var entity = await _context.ProductServices.FindAsync(id);
            if (entity == null || entity.ProductServiceIsDeleted)
            {
                return false;
            }

            entity.ProductServiceIsDeleted = true;
            entity.ProductServiceIsActive = false; // Deactivate on delete
            entity.ProductServiceUpdatedAt = DateTime.UtcNow;
            if (deletedBy.HasValue)
            {
                entity.ProductServiceUpdatedBy = deletedBy.Value;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Mapping Helper
        private static ProductServiceResponseDto MapToDto(ProductServiceItem entity)
        {
            return new ProductServiceResponseDto
            {
                ProductServiceId = entity.ProductServiceId,
                ProductServiceCode = entity.ProductServiceCode,
                ProductServiceName = entity.ProductServiceName,
                ProductServiceDescription = entity.ProductServiceDescription,
                ProductServiceSortOrder = entity.ProductServiceSortOrder,
                ProductServiceIsActive = entity.ProductServiceIsActive,
                ProductServiceIsDeleted = entity.ProductServiceIsDeleted,
                ProductServiceCreatedAt = entity.ProductServiceCreatedAt,
                ProductServiceUpdatedAt = entity.ProductServiceUpdatedAt,
            };
        }
    }
}