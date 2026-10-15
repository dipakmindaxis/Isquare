using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.Meeting;
using CompanyPlatform.Core.Models.CRM.Company;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Services
{
    public class ReminderHistoryService : IReminderHistoryService
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<ReminderHistoryService> _logger;

        public ReminderHistoryService(
            ApplicationDBContext context,
            ILogger<ReminderHistoryService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<ReminderHistoryDto>> GetAllAsync()
        {
            return await _context.ReminderHistories
                .Where(x => !x.IsDeleted)
                .Select(x => new ReminderHistoryDto
                {
                    ReminderHistoryId = x.ReminderHistoryId,
                    ReminderId = x.ReminderId,
                    ReminderStatusId = x.ReminderStatusId,
                    Remarks = x.Remarks,
                    UpdatedBy = x.UpdatedBy,
                    UpdatedDate = x.UpdatedDate,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<ReminderHistoryDto?> GetByIdAsync(int id)
        {
            var data = await _context.ReminderHistories
                .FirstOrDefaultAsync(x =>
                    x.ReminderHistoryId == id &&
                    !x.IsDeleted);

            if (data == null)
            {
                return null;
            }

            return new ReminderHistoryDto
            {
                ReminderHistoryId = data.ReminderHistoryId,
                ReminderId = data.ReminderId,
                ReminderStatusId = data.ReminderStatusId,
                Remarks = data.Remarks,
                UpdatedBy = data.UpdatedBy,
                UpdatedDate = data.UpdatedDate,
                IsActive = data.IsActive,
                IsDeleted = data.IsDeleted
            };
        }

        public async Task<bool> CreateAsync(ReminderHistoryDto dto)
        {
            var history = new ReminderHistory
            {
                ReminderId = dto.ReminderId,
                ReminderStatusId = dto.ReminderStatusId,
                Remarks = dto.Remarks,
                UpdatedBy = dto.UpdatedBy,
                UpdatedDate = dto.UpdatedDate,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            await _context.ReminderHistories.AddAsync(history);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateAsync( int id,ReminderHistoryDto dto)
        {
            _logger.LogInformation("Updating ReminderHistoryId: {ReminderHistoryId}",id);

            var history = await _context.ReminderHistories
                .FirstOrDefaultAsync(x =>
                    x.ReminderHistoryId == id &&
                    !x.IsDeleted);

            if (history == null)
            {
                _logger.LogWarning(
                    "ReminderHistoryId: {ReminderHistoryId} not found",
                    id);

                return false;
            }

            history.ReminderStatusId = dto.ReminderStatusId;
            history.Remarks = dto.Remarks;
            history.UpdatedBy = dto.UpdatedBy;
            history.UpdatedDate = dto.UpdatedDate;
            history.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "ReminderHistoryId: {ReminderHistoryId} updated successfully",
                id);

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var history = await _context.ReminderHistories
                .FirstOrDefaultAsync(x =>
                    x.ReminderHistoryId == id &&
                    !x.IsDeleted);

            if (history == null)
            {
                return false;
            }

            history.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}