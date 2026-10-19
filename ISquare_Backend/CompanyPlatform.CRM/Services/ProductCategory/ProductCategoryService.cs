using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Services
{
    public class ProductCategoryService : IProductCategoryService
    {
        private readonly ApplicationDBContext _context;

        public ProductCategoryService(ApplicationDBContext context)
        {
            _context = context;
        }

        // Get all non-deleted categories (Admin master list)
        public async Task<IEnumerable<ProductCategoryResponseDto>> GetAllAsync()
        {
            return await _context.ProductCategories
                .OrderBy(p => p.ProductCategorySortOrder ?? int.MaxValue)
                .ThenBy(p => p.ProductCategoryName)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        // Get only active, non-deleted categories for dropdowns
        public async Task<IEnumerable<ProductCategoryResponseDto>> GetActiveForDropdownAsync()
        {
            return await _context.ProductCategories
                .Where(p => p.ProductCategoryIsActive && !p.ProductCategoryIsDeleted)
                .OrderBy(p => p.ProductCategorySortOrder ?? int.MaxValue)
                .ThenBy(p => p.ProductCategoryName)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        public async Task<ProductCategoryResponseDto?> GetByIdAsync(int id)
        {
            var entity = await _context.ProductCategories.FindAsync(id);
            if (entity == null || entity.ProductCategoryIsDeleted)
            {
                return null;
            }

            return MapToDto(entity);
        }

        public async Task<ProductCategoryResponseDto> CreateAsync(ProductCategoryCreateDto dto)
        {
            // Verify code uniqueness among active/non-deleted records
            var exists = await _context.ProductCategories
                .AnyAsync(p => p.ProductCategoryCode.ToLower() == dto.ProductCategoryCode.Trim().ToLower() && !p.ProductCategoryIsDeleted);

            if (exists)
            {
                throw new InvalidOperationException($"Product Category with Code '{dto.ProductCategoryCode}' already exists.");
            }

            var entity = new ProductCategory
            {
                ProductCategoryCode = dto.ProductCategoryCode.Trim().ToUpper(),
                ProductCategoryName = dto.ProductCategoryName.Trim(),
                ProductCategoryDescription = dto.ProductCategoryDescription?.Trim(),
                ProductCategorySortOrder = dto.ProductCategorySortOrder,
                ProductCategoryIsActive = dto.ProductCategoryIsActive,
                ProductCategoryIsDeleted = false,
                ProductCategoryCreatedAt = DateTime.UtcNow,
            };

            await _context.ProductCategories.AddAsync(entity);
            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<ProductCategoryResponseDto?> UpdateAsync(int id, ProductCategoryUpdateDto dto)
        {
            var entity = await _context.ProductCategories.FindAsync(id);
            if (entity == null || entity.ProductCategoryIsDeleted)
            {
                return null;
            }

            entity.ProductCategoryName = dto.ProductCategoryName.Trim();
            entity.ProductCategoryDescription = dto.ProductCategoryDescription?.Trim();
            entity.ProductCategorySortOrder = dto.ProductCategorySortOrder;
            entity.ProductCategoryIsActive = dto.ProductCategoryIsActive;
            entity.ProductCategoryUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        // Soft delete logic
        public async Task<bool> DeleteAsync(int id, int? deletedBy = null)
        {
            var entity = await _context.ProductCategories.FindAsync(id);
            if (entity == null || entity.ProductCategoryIsDeleted)
            {
                return false;
            }

            entity.ProductCategoryIsDeleted = true;
            entity.ProductCategoryIsActive = false; // Deactivate on delete
            entity.ProductCategoryUpdatedAt = DateTime.UtcNow;
            if (deletedBy.HasValue)
            {
                entity.ProductCategoryUpdatedBy = deletedBy.Value;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Mapping Helper
        private static ProductCategoryResponseDto MapToDto(ProductCategory entity)
        {
            return new ProductCategoryResponseDto
            {
                ProductCategoryId = entity.ProductCategoryId,
                ProductCategoryCode = entity.ProductCategoryCode,
                ProductCategoryName = entity.ProductCategoryName,
                ProductCategoryDescription = entity.ProductCategoryDescription,
                ProductCategorySortOrder = entity.ProductCategorySortOrder,
                ProductCategoryIsActive = entity.ProductCategoryIsActive,
                ProductCategoryIsDeleted = entity.ProductCategoryIsDeleted,
                ProductCategoryCreatedAt = entity.ProductCategoryCreatedAt,
                ProductCategoryUpdatedAt = entity.ProductCategoryUpdatedAt,
            };
        }
    }
}