using CompanyPlatform.CRM.DTO.CallType;

namespace CompanyPlatform.CRM.Services.CallType
{
    public interface ICallTypeService
    {
        Task<IEnumerable<CallTypeDto>> GetAllCallTypesAsync();

        Task<CallTypeDto> GetCallTypeByIdAsync(int id);

        Task<CallTypeDto> CreateCallTypeAsync(CallTypeDto dto);

        Task<bool> UpdateCallTypeAsync(int id, CallTypeDto dto);

        Task<bool> DeleteCallTypeAsync(int id);
    }
}