using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Services
{
    public class EnquiryStatusService : IEnquiryStatusService
    {
        private readonly ApplicationDBContext _context;

        public EnquiryStatusService(ApplicationDBContext context)
        {
            _context = context;
        }

        // Get all non-deleted statuses (Admin master list)
        public async Task<IEnumerable<EnquiryStatusResponseDto>> GetAllAsync()
        {
            return await _context.EnquiryStatuses
                .OrderBy(s => s.EnquiryStatusSortOrder ?? int.MaxValue)
                .ThenBy(s => s.EnquiryStatusName)
                .Select(s => MapToDto(s))
                .ToListAsync();
        }

        // Get only active, non-deleted statuses for dropdowns
        public async Task<IEnumerable<EnquiryStatusResponseDto>> GetActiveForDropdownAsync()
        {
            return await _context.EnquiryStatuses
                .Where(s => s.EnquiryStatusIsActive && !s.EnquiryStatusIsDeleted)
                .OrderBy(s => s.EnquiryStatusSortOrder ?? int.MaxValue)
                .ThenBy(s => s.EnquiryStatusName)
                .Select(s => MapToDto(s))
                .ToListAsync();
        }

        public async Task<EnquiryStatusResponseDto?> GetByIdAsync(int id)
        {
            var entity = await _context.EnquiryStatuses.FindAsync(id);
            if (entity == null || entity.EnquiryStatusIsDeleted)
            {
                return null;
            }

            return MapToDto(entity);
        }

        public async Task<EnquiryStatusResponseDto> CreateAsync(EnquiryStatusCreateDto dto)
        {
            // Verify code uniqueness among active/non-deleted records
            var exists = await _context.EnquiryStatuses
                .AnyAsync(s => s.EnquiryStatusCode.ToLower() == dto.EnquiryStatusCode.Trim().ToLower() && !s.EnquiryStatusIsDeleted);

            if (exists)
            {
                throw new InvalidOperationException($"Enquiry Status with Code '{dto.EnquiryStatusCode}' already exists.");
            }

            var entity = new EnquiryStatus
            {
                EnquiryStatusCode = dto.EnquiryStatusCode.Trim().ToUpper(),
                EnquiryStatusName = dto.EnquiryStatusName.Trim(),
                EnquiryStatusDescription = dto.EnquiryStatusDescription?.Trim(),
                EnquiryStatusSortOrder = dto.EnquiryStatusSortOrder,
                EnquiryStatusIsActive = dto.EnquiryStatusIsActive,
                EnquiryStatusIsDeleted = false,
                EnquiryStatusCreatedAt = DateTime.UtcNow,
            };

            await _context.EnquiryStatuses.AddAsync(entity);
            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<EnquiryStatusResponseDto?> UpdateAsync(int id, EnquiryStatusUpdateDto dto)
        {
            var entity = await _context.EnquiryStatuses.FindAsync(id);
            if (entity == null || entity.EnquiryStatusIsDeleted)
            {
                return null;
            }

            entity.EnquiryStatusName = dto.EnquiryStatusName.Trim();
            entity.EnquiryStatusDescription = dto.EnquiryStatusDescription?.Trim();
            entity.EnquiryStatusSortOrder = dto.EnquiryStatusSortOrder;
            entity.EnquiryStatusIsActive = dto.EnquiryStatusIsActive;
            entity.EnquiryStatusUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        // Soft delete implementation
        public async Task<bool> DeleteAsync(int id, int? deletedBy = null)
        {
            var entity = await _context.EnquiryStatuses.FindAsync(id);
            if (entity == null || entity.EnquiryStatusIsDeleted)
            {
                return false;
            }

            entity.EnquiryStatusIsDeleted = true;
            entity.EnquiryStatusIsActive = false; // Deactivate on soft delete
            entity.EnquiryStatusUpdatedAt = DateTime.UtcNow;
  
            await _context.SaveChangesAsync();
            return true;
        }

        // Mapping Helper
        private static EnquiryStatusResponseDto MapToDto(EnquiryStatus entity)
        {
            return new EnquiryStatusResponseDto
            {
                EnquiryStatusId = entity.EnquiryStatusId,
                EnquiryStatusCode = entity.EnquiryStatusCode,
                EnquiryStatusName = entity.EnquiryStatusName,
                EnquiryStatusDescription = entity.EnquiryStatusDescription,
                EnquiryStatusSortOrder = entity.EnquiryStatusSortOrder,
                EnquiryStatusIsActive = entity.EnquiryStatusIsActive,
                EnquiryStatusIsDeleted = entity.EnquiryStatusIsDeleted,
                EnquiryStatusCreatedAt = entity.EnquiryStatusCreatedAt,
                EnquiryStatusUpdatedAt = entity.EnquiryStatusUpdatedAt,
            };
        }
    }
}