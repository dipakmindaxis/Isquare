using CompanyPlatform.CRM.DTO;

namespace CompanyPlatform.Core.Models.CRM
{
    public interface ILostReasonService
    {
        Task<IEnumerable<LostReasonResponseDto>> GetAllAsync();

        // Active and non-deleted records for dropdowns (closing/updating enquiry)
        Task<IEnumerable<LostReasonResponseDto>> GetActiveForDropdownAsync();

        Task<LostReasonResponseDto?> GetByIdAsync(int id);
        Task<LostReasonResponseDto> CreateAsync(LostReasonCreateDto dto);
        Task<LostReasonResponseDto?> UpdateAsync(int id, LostReasonUpdateDto dto);

        // Soft Delete
        Task<bool> DeleteAsync(int id, int? deletedBy = null);
    }
}