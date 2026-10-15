using CompanyPlatform.CRM.DTO.Call;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Call
{
    public interface ICallService
    {
        Task<IEnumerable<CallDto>> GetAllCallsAsync();

        Task<CallDto> GetCallByIdAsync(int id);

        Task<CallDto> CreateCallAsync(CallDto dto);

        Task<bool> UpdateCallAsync(int id, CallDto dto);

        Task<bool> DeleteCallAsync(int id);
    }
}