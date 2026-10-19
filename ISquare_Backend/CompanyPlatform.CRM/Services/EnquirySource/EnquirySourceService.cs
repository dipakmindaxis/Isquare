using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using Microsoft.EntityFrameworkCore;
using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.Services
{
    public class EnquirySourceService : IEnquirySourceService
    {
        private readonly ApplicationDBContext _context;

        public EnquirySourceService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EnquirySourceResponseDto>> GetAllAsync()
        {
            return await _context.EnquirySources
                .OrderBy(e => e.EnquirySourceSortOrder ?? int.MaxValue)
                .ThenBy(e => e.EnquirySourceName)
                .Select(e => MapToDto(e))
                .ToListAsync();
        }

        // Returns only active values for new enquiry dropdowns
        public async Task<IEnumerable<EnquirySourceResponseDto>> GetActiveForDropdownAsync()
        {
            return await _context.EnquirySources
                .Where(e => e.EnquirySourceIsActive)
                .OrderBy(e => e.EnquirySourceSortOrder ?? int.MaxValue)
                .ThenBy(e => e.EnquirySourceName)
                .Select(e => MapToDto(e))
                .ToListAsync();
        }

        public async Task<EnquirySourceResponseDto?> GetByIdAsync(int id)
        {
            var entity = await _context.EnquirySources.FindAsync(id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<EnquirySourceResponseDto> CreateAsync(EnquirySourceCreateDto dto)
        {
            // Check for code uniqueness
            var exists = await _context.EnquirySources
                .AnyAsync(e => e.EnquirySourceCode.ToLower() == dto.EnquirySourceCode.Trim().ToLower());

            if (exists)
            {
                throw new InvalidOperationException($"Enquiry Source with Code '{dto.EnquirySourceCode}' already exists.");
            }

            var entity = new EnquirySource
            {
                EnquirySourceCode = dto.EnquirySourceCode.Trim().ToUpper(),
                EnquirySourceName = dto.EnquirySourceName.Trim(),
                EnquirySourceDescription = dto.EnquirySourceDescription?.Trim(),
                EnquirySourceSortOrder = dto.EnquirySourceSortOrder,
                EnquirySourceIsActive = dto.EnquirySourceIsActive,
                EnquirySourceCreatedAt = DateTime.UtcNow,
            };

            await _context.EnquirySources.AddAsync(entity);
            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<EnquirySourceResponseDto?> UpdateAsync(int id, EnquirySourceUpdateDto dto)
        {
            var entity = await _context.EnquirySources.FindAsync(id);
            if (entity == null)
            {
                return null;
            }

            entity.EnquirySourceName = dto.EnquirySourceName.Trim();
            entity.EnquirySourceDescription = dto.EnquirySourceDescription?.Trim();
            entity.EnquirySourceSortOrder = dto.EnquirySourceSortOrder;
            entity.EnquirySourceIsActive = dto.EnquirySourceIsActive;
            entity.EnquirySourceUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.EnquirySources.FindAsync(id);
            if (entity == null) return false;

            _context.EnquirySources.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        // Helper mapper
        private static EnquirySourceResponseDto MapToDto(EnquirySource entity)
        {
            return new EnquirySourceResponseDto
            {
                EnquirySourceId = entity.EnquirySourceId,
                EnquirySourceCode = entity.EnquirySourceCode,
                EnquirySourceName = entity.EnquirySourceName,
                EnquirySourceDescription = entity.EnquirySourceDescription,
                EnquirySourceSortOrder = entity.EnquirySourceSortOrder,
                EnquirySourceIsActive = entity.EnquirySourceIsActive,
                EnquirySourceCreatedAt = entity.EnquirySourceCreatedAt,
                EnquirySourceUpdatedAt = entity.EnquirySourceUpdatedAt,
            };
        }
    }
}