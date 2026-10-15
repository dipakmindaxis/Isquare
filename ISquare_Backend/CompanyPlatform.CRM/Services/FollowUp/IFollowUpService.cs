using CompanyPlatform.CRM.DTO.FollowUp;

namespace CompanyPlatform.CRM.Services.FollowUp
{
    public interface IFollowUpService
    {
        Task<IEnumerable<FollowUpDto>> GetAllFollowUpsAsync();

        Task<FollowUpDto?> GetFollowUpByIdAsync(int id);

        Task<FollowUpDto> CreateFollowUpAsync(FollowUpDto dto);

        Task<bool> UpdateFollowUpAsync(int id, FollowUpDto dto);

        Task<bool> DeleteFollowUpAsync(int id);
    }
}