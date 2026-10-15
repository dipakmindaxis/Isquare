using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.ActivityType;
using Microsoft.Extensions.Logging;

using ActivityTypeEntity =
    CompanyPlatform.Core.Models.CRM.Company.ActivityType;

namespace CompanyPlatform.CRM.Services.ActivityType
{
    public class ActivityTypeService : IActivityTypeService
    {
        private readonly IRepositories<ActivityTypeEntity> _repository;
        private readonly ILogger<ActivityTypeService> _logger;

        public ActivityTypeService(
            IRepositories<ActivityTypeEntity> repository,
            ILogger<ActivityTypeService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<ActivityTypeDto>> GetAllActivityTypesAsync()
        {
            _logger.LogInformation("Fetching all activity types.");

            var items = await _repository.FindByCondition(
                x => !x.IsDeleted);

            return items.Select(x => new ActivityTypeDto
            {
                ID = x.ID,
                ActivityName = x.ActivityName,
                IsActive = x.IsActive,
                IsDeleted = x.IsDeleted
            });
        }

        public async Task<ActivityTypeDto?> GetActivityTypeByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching activity type by ID: {ID}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning(
                    "Activity type with ID: {ID} not found.",
                    id);

                return null;
            }

            return new ActivityTypeDto
            {
                ID = item.ID,
                ActivityName = item.ActivityName,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<ActivityTypeDto> CreateActivityTypeAsync(
            ActivityTypeDto dto)
        {
            _logger.LogInformation(
                "Creating activity type: {ActivityName}",
                dto.ActivityName);

            var entity = new ActivityTypeEntity
            {
                ActivityName = dto.ActivityName,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            await _repository.Create(entity);

            dto.ID = entity.ID;
            dto.IsDeleted = entity.IsDeleted;

            _logger.LogInformation(
                "Successfully created activity type with ID: {ID}",
                entity.ID);

            return dto;
        }

        public async Task<bool> UpdateActivityTypeAsync(
            int id,
            ActivityTypeDto dto)
        {
            _logger.LogInformation(
                "Updating activity type with ID: {ID}",
                id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsDeleted)
            {
                _logger.LogWarning(
                    "Activity type with ID: {ID} not found.",
                    id);

                return false;
            }

            entity.ActivityName = dto.ActivityName;
            entity.IsActive = dto.IsActive;

            await _repository.Update(entity);

            _logger.LogInformation(
                "Successfully updated activity type with ID: {ID}",
                id);

            return true;
        }

        public async Task<bool> DeleteActivityTypeAsync(int id)
        {
            _logger.LogInformation(
                "Deleting activity type with ID: {ID}",
                id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsDeleted)
            {
                _logger.LogWarning(
                    "Activity type with ID: {ID} not found.",
                    id);

                return false;
            }

            entity.IsDeleted = true;
            entity.IsActive = false;

            await _repository.SoftDelete(entity);

            _logger.LogInformation(
                "Successfully deleted activity type with ID: {ID}",
                id);

            return true;
        }
    }
}




//using CompanyPlatform.Core.Repository;
//using Microsoft.Extensions.Logging;

//using ActivityTypeEntity =
//    CompanyPlatform.Core.Models.CRM.Company.ActivityType;

//namespace CompanyPlatform.CRM.Services.ActivityType
//{
//    public class ActivityTypeService : IActivityTypeService
//    {
//        private readonly IRepositories<ActivityTypeEntity> _repository;
//        private readonly ILogger<ActivityTypeService> _logger;

//        public ActivityTypeService(
//            IRepositories<ActivityTypeEntity> repository,
//            ILogger<ActivityTypeService> logger)
//        {
//            _repository = repository;
//            _logger = logger;
//        }

//        public async Task<IEnumerable<ActivityTypeDto>> GetAllActivityTypesAsync()
//        {
//            _logger.LogInformation("Fetching all activity types.");

//            var items = await _repository.FindByCondition(
//                x => !x.IsDeleted);

//            return items.Select(x => new ActivityTypeDto
//            {
//                ID = x.ID,
//                ActivityName = x.ActivityName,
//                IsActive = x.IsActive
//            });
//        }

//        public async Task<ActivityTypeDto?> GetActivityTypeByIdAsync(int id)
//        {
//            _logger.LogInformation(
//                "Fetching activity type by ID: {ID}",
//                id);

//            var item = await _repository.GetByIdAsync(id);

//            if (item == null || item.IsDeleted)
//            {
//                _logger.LogWarning(
//                    "Activity type with ID: {ID} not found.",
//                    id);

//                return null;
//            }

//            return new ActivityTypeDto
//            {
//                ID = item.ID,
//                ActivityName = item.ActivityName,
//                IsActive = item.IsActive
//            };
//        }

//        public async Task<ActivityTypeDto> CreateActivityTypeAsync(
//            ActivityTypeDto dto)
//        {
//            _logger.LogInformation(
//                "Creating activity type: {ActivityName}",
//                dto.ActivityName);

//            var entity = new ActivityTypeEntity
//            {
//                ActivityName = dto.ActivityName,
//                IsActive = dto.IsActive,
//                IsDeleted = false
//            };

//            await _repository.Create(entity);

//            dto.ID = entity.ID;

//            _logger.LogInformation(
//                "Successfully created activity type with ID: {ID}",
//                entity.ID);

//            return dto;
//        }

//        public async Task<bool> UpdateActivityTypeAsync(
//            int id,
//            ActivityTypeDto dto)
//        {
//            _logger.LogInformation(
//                "Updating activity type with ID: {ID}",
//                id);

//            var entity = await _repository.GetByIdAsync(id);

//            if (entity == null || entity.IsDeleted)
//            {
//                _logger.LogWarning(
//                    "Activity type with ID: {ID} not found.",
//                    id);

//                return false;
//            }

//            entity.ActivityName = dto.ActivityName;
//            entity.IsActive = dto.IsActive;

//            await _repository.Update(entity);

//            _logger.LogInformation(
//                "Successfully updated activity type with ID: {ID}",
//                id);

//            return true;
//        }

//        public async Task<bool> DeleteActivityTypeAsync(int id)
//        {
//            _logger.LogInformation(
//                "Deleting activity type with ID: {ID}",
//                id);

//            var entity = await _repository.GetByIdAsync(id);

//            if (entity == null || entity.IsDeleted)
//            {
//                _logger.LogWarning(
//                    "Activity type with ID: {ID} not found.",
//                    id);

//                return false;
//            }

//            entity.IsDeleted = true;

//            await _repository.SoftDelete(entity);

//            _logger.LogInformation(
//                "Successfully deleted activity type with ID: {ID}",
//                id);

//            return true;
//        }
//    }
//}




//using CompanyPlatform.Core.Repository;
//using Microsoft.Extensions.Logging;

//namespace CompanyPlatform.CRM.Services.ActivityType
//{
//    public class ActivityTypeService : IActivityTypeService
//    {
//        private readonly IRepositories<Model.ActivityType> _repository;
//        private readonly ILogger<ActivityTypeService> _logger;

//        public ActivityTypeService(
//            IRepositories<Model.ActivityType> repository,
//            ILogger<ActivityTypeService> logger)
//        {
//            _repository = repository;
//            _logger = logger;
//        }

//        public async Task<IEnumerable<ActivityTypeDto>> GetAllActivityTypesAsync()
//        {
//            _logger.LogInformation("Fetching all activity types.");

//            var items = await _repository.FindByCondition(x => !x.IsDeleted);

//            return items.Select(x => new ActivityTypeDto
//            {
//                ID = x.ID,
//                ActivityName = x.ActivityName,
//                IsActive = x.IsActive
//            });
//        }

//        public async Task<ActivityTypeDto> GetActivityTypeByIdAsync(int id)
//        {
//            _logger.LogInformation("Fetching activity type by ID: {ID}", id);

//            var item = await _repository.GetByIdAsync(id);

//            if (item == null || item.IsDeleted)
//            {
//                _logger.LogWarning("Activity type with ID: {ID} not found.", id);
//                return null;
//            }

//            return new ActivityTypeDto
//            {
//                ID = item.ID,
//                ActivityName = item.ActivityName,
//                IsActive = item.IsActive
//            };
//        }

//        public async Task<ActivityTypeDto> CreateActivityTypeAsync(ActivityTypeDto dto)
//        {
//            _logger.LogInformation("Creating activity type: {ActivityName}", dto.ActivityName);

//            var entity = new Model.ActivityType
//            {
//                ActivityName = dto.ActivityName,
//                IsActive = dto.IsActive,
//                IsDeleted = false
//            };

//            await _repository.Create(entity);

//            dto.ID = entity.ID;

//            _logger.LogInformation("Successfully created activity type with ID: {ID}", entity.ID);

//            return dto;
//        }

//        public async Task<bool> UpdateActivityTypeAsync(int id, ActivityTypeDto dto)
//        {
//            _logger.LogInformation("Updating activity type with ID: {ID}", id);

//            var entity = await _repository.GetByIdAsync(id);

//            if (entity == null || entity.IsDeleted)
//            {
//                _logger.LogWarning("Activity type with ID: {ID} not found.", id);
//                return false;
//            }

//            entity.ActivityName = dto.ActivityName;
//            entity.IsActive = dto.IsActive;

//            await _repository.Update(entity);

//            _logger.LogInformation("Successfully updated activity type with ID: {ID}", id);

//            return true;
//        }

//        public async Task<bool> DeleteActivityTypeAsync(int id)
//        {
//            _logger.LogInformation("Deleting activity type with ID: {ID}", id);

//            var entity = await _repository.GetByIdAsync(id);

//            if (entity == null || entity.IsDeleted)
//            {
//                _logger.LogWarning("Activity type with ID: {ID} not found.", id);
//                return false;
//            }

//            entity.IsDeleted = true;

//            await _repository.SoftDelete(entity);

//            _logger.LogInformation("Successfully deleted activity type with ID: {ID}", id);

//            return true;
//        }
//    }
//}