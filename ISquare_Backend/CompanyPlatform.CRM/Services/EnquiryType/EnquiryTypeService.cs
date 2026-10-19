using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Services
{
    public class EnquiryTypeService : IEnquiryTypeService
    {
        private readonly ApplicationDBContext _context;

        public EnquiryTypeService(ApplicationDBContext context)
        {
            _context = context;
        }

        // Get all records (for Admin/Master management)
        public async Task<IEnumerable<EnquiryTypeResponseDto>> GetAllAsync()
        {
            return await _context.EnquiryTypes
                .OrderBy(e => e.EnquiryTypeSortOrder ?? int.MaxValue)
                .ThenBy(e => e.EnquiryTypeName)
                .Select(e => MapToDto(e))
                .ToListAsync();
        }

        // Get only active records (for dropdowns when creating new enquiries)
        public async Task<IEnumerable<EnquiryTypeResponseDto>> GetActiveForDropdownAsync()
        {
            return await _context.EnquiryTypes
                .Where(e => e.EnquiryTypeIsActive)
                .OrderBy(e => e.EnquiryTypeSortOrder ?? int.MaxValue)
                .ThenBy(e => e.EnquiryTypeName)
                .Select(e => MapToDto(e))
                .ToListAsync();
        }

        public async Task<EnquiryTypeResponseDto?> GetByIdAsync(int id)
        {
            var entity = await _context.EnquiryTypes.FindAsync(id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<EnquiryTypeResponseDto> CreateAsync(EnquiryTypeCreateDto dto)
        {
            // Enforce unique code validation
            var exists = await _context.EnquiryTypes
                .AnyAsync(e => e.EnquiryTypeCode.ToLower() == dto.EnquiryTypeCode.Trim().ToLower());

            if (exists)
            {
                throw new InvalidOperationException($"Enquiry Type with Code '{dto.EnquiryTypeCode}' already exists.");
            }

            var entity = new EnquiryType
            {
                EnquiryTypeCode = dto.EnquiryTypeCode.Trim().ToUpper(),
                EnquiryTypeName = dto.EnquiryTypeName.Trim(),
                EnquiryTypeDescription = dto.EnquiryTypeDescription?.Trim(),
                EnquiryTypeSortOrder = dto.EnquiryTypeSortOrder,
                EnquiryTypeIsActive = dto.EnquiryTypeIsActive,
                EnquiryTypeCreatedAt = DateTime.UtcNow,
            };

            await _context.EnquiryTypes.AddAsync(entity);
            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<EnquiryTypeResponseDto?> UpdateAsync(int id, EnquiryTypeUpdateDto dto)
        {
            var entity = await _context.EnquiryTypes.FindAsync(id);
            if (entity == null)
            {
                return null;
            }

            entity.EnquiryTypeName = dto.EnquiryTypeName.Trim();
            entity.EnquiryTypeDescription = dto.EnquiryTypeDescription?.Trim();
            entity.EnquiryTypeSortOrder = dto.EnquiryTypeSortOrder;
            entity.EnquiryTypeIsActive = dto.EnquiryTypeIsActive;
            entity.EnquiryTypeUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.EnquiryTypes.FindAsync(id);
            if (entity == null)
            {
                return false;
            }

            _context.EnquiryTypes.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        // Mapping Helper
        private static EnquiryTypeResponseDto MapToDto(EnquiryType entity)
        {
            return new EnquiryTypeResponseDto
            {
                EnquiryTypeId = entity.EnquiryTypeId,
                EnquiryTypeCode = entity.EnquiryTypeCode,
                EnquiryTypeName = entity.EnquiryTypeName,
                EnquiryTypeDescription = entity.EnquiryTypeDescription,
                EnquiryTypeSortOrder = entity.EnquiryTypeSortOrder,
                EnquiryTypeIsActive = entity.EnquiryTypeIsActive,
                EnquiryTypeCreatedAt = entity.EnquiryTypeCreatedAt,
                EnquiryTypeUpdatedAt = entity.EnquiryTypeUpdatedAt,
            };
        }
    }
}