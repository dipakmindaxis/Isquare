using CompanyPlatform.CRM.DTO.ActivityType;

namespace CompanyPlatform.CRM.Services.ActivityType
{
    public interface IActivityTypeService
    {
        Task<IEnumerable<ActivityTypeDto>> GetAllActivityTypesAsync();

        Task<ActivityTypeDto?> GetActivityTypeByIdAsync(int id);

        Task<ActivityTypeDto> CreateActivityTypeAsync(
            ActivityTypeDto dto);

        Task<bool> UpdateActivityTypeAsync(
            int id,
            ActivityTypeDto dto);

        Task<bool> DeleteActivityTypeAsync(int id);
    }
}




//using CompanyPlatform.CRM.DTO.ActivityType;;

//namespace CompanyPlatform.CRM.Services.ActivityType
//{
//    public interface IActivityTypeService
//    {
//        Task<IEnumerable<ActivityTypeDto>> GetAllActivityTypesAsync();

//        Task<ActivityTypeDto> GetActivityTypeByIdAsync(int id);

//        Task<ActivityTypeDto> CreateActivityTypeAsync(ActivityTypeDto dto);

//        Task<bool> UpdateActivityTypeAsync(int id, ActivityTypeDto dto);

//        Task<bool> DeleteActivityTypeAsync(int id);
//    }
//}