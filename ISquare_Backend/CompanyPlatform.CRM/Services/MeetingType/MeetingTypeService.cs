using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CompanyPlatform.Core.DTO.MeetingType;
using DocumentFormat.OpenXml.EMMA;
using CompanyPlatform.Core.Models.CRM.Company;
using MeetingTypeEntity = CompanyPlatform.Core.Models.CRM.Company.MeetingType;

namespace CompanyPlatform.Core.Services.MeetingType
{
    public class MeetingTypeService : IMeetingTypeService
    {
        private readonly IRepositories<MeetingTypeEntity> _repository;
        private readonly ILogger<MeetingTypeService> _logger;

        public MeetingTypeService(
            IRepositories<MeetingTypeEntity> repository,
            ILogger<MeetingTypeService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger;
        }

        public async Task<IEnumerable<MeetingTypeDto>> GetAllMeetingTypesAsync()
        {
            _logger.LogInformation("Fetching all active meeting types.");

            var items = await _repository.GetAll();

            return items
                .Where(m => m.IsActive == true)
                .Select(m => new MeetingTypeDto
                {
                    ID = m.ID,
                    MeetingTypeName = m.MeetingTypeName,
                    IsActive = m.IsActive
                });
        }

        public async Task<MeetingTypeDto> GetMeetingTypeByIdAsync(int id)
        {
            _logger.LogInformation("Fetching meeting type by ID: {MeetingTypeId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsActive == false)
            {
                _logger.LogWarning("Meeting type with ID: {MeetingTypeId} not found or is inactive.", id);

                return null;
            }

            return new MeetingTypeDto
            {
                ID = item.ID,
                MeetingTypeName = item.MeetingTypeName,
                IsActive = item.IsActive
            };
        }

        public async Task<MeetingTypeDto> CreateMeetingTypeAsync(MeetingTypeDto dto)
        {
            _logger.LogInformation("Creating a new meeting type with name: {MeetingTypeName}", dto.MeetingTypeName);

            var newItem = new MeetingTypeEntity
            {
                MeetingTypeName = dto.MeetingTypeName,
                IsActive = true
            };

            await _repository.Create(newItem);

            dto.ID = newItem.ID;
            dto.IsActive = newItem.IsActive;

            _logger.LogInformation("Successfully created meeting type with ID: {MeetingTypeId}", newItem.ID);

            return dto;
        }

        public async Task<bool> UpdateMeetingTypeAsync(int id, MeetingTypeDto dto)
        {
            _logger.LogInformation("Attempting to update meeting type with ID: {MeetingTypeId}", id);

            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsActive == false)
            {
                _logger.LogWarning("Update failed. Meeting type with ID: {MeetingTypeId} not found or is inactive.", id);

                return false;
            }

            itemToUpdate.MeetingTypeName = dto.MeetingTypeName;

            await _repository.Update(itemToUpdate);

            _logger.LogInformation("Successfully updated meeting type with ID: {MeetingTypeId}", id);
            return true;
        }

        public async Task<bool> DeleteMeetingTypeAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate meeting type with ID: {MeetingTypeId}", id);

            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning("Deactivation failed. Meeting type with ID: {MeetingTypeId} not found.", id);
                return false;
            }

            itemToDelete.IsActive = false;

            await _repository.Update(itemToDelete);

            _logger.LogInformation("Successfully deactivated meeting type with ID: {MeetingTypeId}", id);
            return true;
        }
    }
}
