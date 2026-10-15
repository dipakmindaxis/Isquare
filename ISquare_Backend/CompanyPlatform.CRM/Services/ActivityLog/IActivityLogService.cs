using CompanyPlatform.CRM.DTO.ActivityLog;

namespace CompanyPlatform.CRM.Services.ActivityLog
{
    public interface IActivityLogService
    {
        Task<IEnumerable<ActivityLogDto>> GetAllActivityLogsAsync();

        Task<ActivityLogDto?> GetActivityLogByIdAsync(int id);

        Task<ActivityLogDto> CreateActivityLogAsync(ActivityLogDto activityLogDto);

        Task<bool> UpdateActivityLogAsync(
            int id,
            ActivityLogDto activityLogDto);

        Task<bool> DeleteActivityLogAsync(int id);
    }
}


//using CompanyPlatform.CRM.DTO.ActivityLog;

//namespace CompanyPlatform.CRM.Services.ActivityLog
//{
//    public interface IActivityLogService
//    {
//        Task<IEnumerable<ActivityLogDto>> GetAllActivityLogsAsync();

//        Task<ActivityLogDto> GetActivityLogByIdAsync(int id);

//        Task<ActivityLogDto> CreateActivityLogAsync(ActivityLogDto activityLogDto);

//        Task<bool> UpdateActivityLogAsync(int id, ActivityLogDto activityLogDto);

//        Task<bool> DeleteActivityLogAsync(int id);
//    }
//}