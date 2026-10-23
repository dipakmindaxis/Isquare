using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.HRMS;
using CompanyPlatform.CRM.DTO.LevelMaster;

namespace CompanyPlatform.CRM.Services.LevelMaster
{
    public class LevelMasterService : ILevelMasterService
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<LevelMasterService> _logger;

        public LevelMasterService(
            ApplicationDBContext context,
            ILogger<LevelMasterService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<LevelMasterDto>> GetAllAsync()
        {
            _logger.LogInformation("Fetching all non-deleted hierarchy levels.");

            var items = await _context.Tbl_LevelMasters
                .Where(x => !x.IsDeleted)
                .OrderBy(x => x.LevelOrder)
                .ToListAsync();

            return items.Select(x => new LevelMasterDto
            {
                ID = x.ID,
                LevelName = x.LevelName ?? string.Empty,
                LevelOrder = x.LevelOrder,
                IsActive = x.IsActive,
                IsDeleted = x.IsDeleted
            });
        }

        public async Task<LevelMasterDto?> GetByIdAsync(int id)
        {
            _logger.LogInformation("Fetching level by ID: {Id}", id);

            var item = await _context.Tbl_LevelMasters
                .FirstOrDefaultAsync(x => x.ID == id && !x.IsDeleted);

            if (item == null) return null;

            return new LevelMasterDto
            {
                ID = item.ID,
                LevelName = item.LevelName ?? string.Empty,
                LevelOrder = item.LevelOrder,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<LevelMasterDto> CreateAsync(CreateLevelMasterDto dto)
        {
            _logger.LogInformation("Creating new level: {LevelName}", dto.LevelName);

            var entity = new CompanyPlatform.Core.Models.HRMS.LevelMaster
            {
                LevelName = dto.LevelName.Trim(),
                LevelOrder = dto.LevelOrder > 0 ? dto.LevelOrder : 1,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            await _context.Tbl_LevelMasters.AddAsync(entity);
            await _context.SaveChangesAsync();

            return new LevelMasterDto
            {
                ID = entity.ID,
                LevelName = entity.LevelName ?? string.Empty,
                LevelOrder = entity.LevelOrder,
                IsActive = entity.IsActive,
                IsDeleted = entity.IsDeleted
            };
        }

        public async Task<bool> UpdateAsync(int id, UpdateLevelMasterDto dto)
        {
            _logger.LogInformation("Updating level ID: {Id}", id);

            var entity = await _context.Tbl_LevelMasters
                .FirstOrDefaultAsync(x => x.ID == id && !x.IsDeleted);

            if (entity == null) return false;

            entity.LevelName = dto.LevelName.Trim();
            entity.LevelOrder = dto.LevelOrder;
            entity.IsActive = dto.IsActive;

            _context.Tbl_LevelMasters.Update(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            _logger.LogInformation("Soft deleting level ID: {Id}", id);

            var entity = await _context.Tbl_LevelMasters
                .FirstOrDefaultAsync(x => x.ID == id && !x.IsDeleted);

            if (entity == null) return false;

            entity.IsDeleted = true;
            _context.Tbl_LevelMasters.Update(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
