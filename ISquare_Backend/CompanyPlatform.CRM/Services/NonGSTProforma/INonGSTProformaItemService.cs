using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.NonGSTProforma;

namespace CompanyPlatform.CRM.Services.NonGSTProforma
{
    public interface INonGSTProformaItemService
    {
        Task<IEnumerable<NonGSTProformaItemDto>> GetAllNonGSTProformaItemsAsync();
        Task<IEnumerable<NonGSTProformaItemDto>> GetItemsByProformaIdAsync(int nonGSTProformaId);
        Task<NonGSTProformaItemDto?> GetNonGSTProformaItemByIdAsync(int id);
        Task<NonGSTProformaItemDto> CreateNonGSTProformaItemAsync(NonGSTProformaItemDto dto);
        Task<bool> UpdateNonGSTProformaItemAsync(int id, NonGSTProformaItemDto dto);
        Task<bool> DeleteNonGSTProformaItemAsync(int id);
    }
}
