using CompanyPlatform.CRM.DTO.CompanyProfile;

namespace CompanyPlatform.CRM.Services.CompanyProfile
{
    public interface ICompanyProfileService
    {
        Task<IEnumerable<CompanyProfileDto>> GetAllAsync();

        Task<CompanyProfileDto?> GetByIdAsync(int id);

        Task<CompanyProfileDto> CreateAsync(
            CompanyProfileDto dto);

        Task<bool> UpdateAsync(
            int id, CompanyProfileDto dto);

        Task<bool> DeleteAsync(int id);
    }
}