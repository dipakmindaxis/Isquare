using CompanyPlatform.CRM.DTO.CallHistory;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.CallHistory
{
    public interface ICallHistoryService
    {
        Task<IEnumerable<CallHistoryDto>> GetAllCallHistoryAsync();

        Task<CallHistoryDto> GetCallHistoryByIdAsync(int id);

        Task<CallHistoryDto> CreateCallHistoryAsync(CallHistoryDto dto);

        Task<bool> UpdateCallHistoryAsync(int id, CallHistoryDto dto);

        Task<bool> DeleteCallHistoryAsync(int id);
    }
}