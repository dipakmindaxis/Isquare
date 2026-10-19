using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Services
{
    public class EnquiryPriorityService : IEnquiryPriorityService
    {
        private readonly ApplicationDBContext _context;

        public EnquiryPriorityService(ApplicationDBContext context)
        {
            _context = context;
        }

        // Get all non-deleted priorities (Admin master list)
        public async Task<IEnumerable<EnquiryPriorityResponseDto>> GetAllAsync()
        {
            return await _context.EnquiryPriorities
                .OrderBy(p => p.EnquiryPrioritySortOrder ?? int.MaxValue)
                .ThenBy(p => p.EnquiryPriorityName)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        // Get only active, non-deleted priorities (for new enquiries dropdown)
        public async Task<IEnumerable<EnquiryPriorityResponseDto>> GetActiveForDropdownAsync()
        {
            return await _context.EnquiryPriorities
                .Where(p => p.EnquiryPriorityIsActive && !p.EnquiryPriorityIsDeleted)
                .OrderBy(p => p.EnquiryPrioritySortOrder ?? int.MaxValue)
                .ThenBy(p => p.EnquiryPriorityName)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        public async Task<EnquiryPriorityResponseDto?> GetByIdAsync(int id)
        {
            var entity = await _context.EnquiryPriorities.FindAsync(id);
            if (entity == null || entity.EnquiryPriorityIsDeleted)
            {
                return null;
            }

            return MapToDto(entity);
        }

        public async Task<EnquiryPriorityResponseDto> CreateAsync(EnquiryPriorityCreateDto dto)
        {
            // Verify code uniqueness among active/non-deleted records
            var exists = await _context.EnquiryPriorities
                .AnyAsync(p => p.EnquiryPriorityCode.ToLower() == dto.EnquiryPriorityCode.Trim().ToLower() && !p.EnquiryPriorityIsDeleted);

            if (exists)
            {
                throw new InvalidOperationException($"Enquiry Priority with Code '{dto.EnquiryPriorityCode}' already exists.");
            }

            var entity = new EnquiryPriority
            {
                EnquiryPriorityCode = dto.EnquiryPriorityCode.Trim().ToUpper(),
                EnquiryPriorityName = dto.EnquiryPriorityName.Trim(),
                EnquiryPriorityDescription = dto.EnquiryPriorityDescription?.Trim(),
                EnquiryPrioritySortOrder = dto.EnquiryPrioritySortOrder,
                EnquiryPriorityIsActive = dto.EnquiryPriorityIsActive,
                EnquiryPriorityIsDeleted = false,
                EnquiryPriorityCreatedAt = DateTime.UtcNow,
            };

            await _context.EnquiryPriorities.AddAsync(entity);
            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<EnquiryPriorityResponseDto?> UpdateAsync(int id, EnquiryPriorityUpdateDto dto)
        {
            var entity = await _context.EnquiryPriorities.FindAsync(id);
            if (entity == null || entity.EnquiryPriorityIsDeleted)
            {
                return null;
            }

            entity.EnquiryPriorityName = dto.EnquiryPriorityName.Trim();
            entity.EnquiryPriorityDescription = dto.EnquiryPriorityDescription?.Trim();
            entity.EnquiryPrioritySortOrder = dto.EnquiryPrioritySortOrder;
            entity.EnquiryPriorityIsActive = dto.EnquiryPriorityIsActive;
            entity.EnquiryPriorityUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        // Soft delete logic
        public async Task<bool> DeleteAsync(int id, int? deletedBy = null)
        {
            var entity = await _context.EnquiryPriorities.FindAsync(id);
            if (entity == null || entity.EnquiryPriorityIsDeleted)
            {
                return false;
            }

            entity.EnquiryPriorityIsDeleted = true;
            entity.EnquiryPriorityIsActive = false; // Deactivate on soft delete
            entity.EnquiryPriorityUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // Mapping Helper
        private static EnquiryPriorityResponseDto MapToDto(EnquiryPriority entity)
        {
            return new EnquiryPriorityResponseDto
            {
                EnquiryPriorityId = entity.EnquiryPriorityId,
                EnquiryPriorityCode = entity.EnquiryPriorityCode,
                EnquiryPriorityName = entity.EnquiryPriorityName,
                EnquiryPriorityDescription = entity.EnquiryPriorityDescription,
                EnquiryPrioritySortOrder = entity.EnquiryPrioritySortOrder,
                EnquiryPriorityIsActive = entity.EnquiryPriorityIsActive,
                EnquiryPriorityIsDeleted = entity.EnquiryPriorityIsDeleted,
                EnquiryPriorityCreatedAt = entity.EnquiryPriorityCreatedAt,
                EnquiryPriorityUpdatedAt = entity.EnquiryPriorityUpdatedAt,
            };
        }
    }
}