using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.Enquiry;

namespace CompanyPlatform.CRM.Services.Enquiry
{
    public interface IEnquiryService
    {
        Task<string> GetNextEnquiryNumberAsync();
        Task<IEnumerable<EnquiryDto>> GetAllEnquiriesAsync();
        Task<EnquiryDto?> GetEnquiryByIdAsync(int id);
        Task<EnquiryDto> CreateEnquiryAsync(EnquiryCreateDto dto);
        Task<bool> UpdateEnquiryAsync(int id, EnquiryUpdateDto dto);
        Task<bool> DeleteEnquiryAsync(int id);
    }
}