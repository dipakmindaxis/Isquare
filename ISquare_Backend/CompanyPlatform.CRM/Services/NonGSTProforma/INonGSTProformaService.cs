using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.NonGSTProforma;

namespace CompanyPlatform.CRM.Services.NonGSTProforma
{
    public interface INonGSTProformaService
    {
        Task<IEnumerable<NonGSTProformaDto>> GetAllNonGSTProformasAsync();
        Task<NonGSTProformaDto?> GetNonGSTProformaByIdAsync(int id);
        Task<NonGSTProformaDto> CreateNonGSTProformaAsync(CreateNonGSTProformaDto dto);
        Task<bool> UpdateNonGSTProformaAsync(int id, UpdateNonGSTProformaDto dto);
        Task<NonGSTProformaDto?> UpdatePublicResponseAsync(string proformaNo, string status);
        Task<bool> DeleteNonGSTProformaAsync(int id);
    }
}
