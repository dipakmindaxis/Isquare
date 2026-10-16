using CompanyPlatform.Core.DTO.Contact;

namespace CompanyPlatform.Core.Services
{
    public interface IContactService
    {
        Task<IEnumerable<ContactDto>> GetAllContactsAsync();

        Task<ContactDto?> GetContactByIdAsync(int id);

        Task<IEnumerable<ContactDto>>
            GetContactsByCompanyIdAsync(int companyId);

        Task<ContactDto> CreateContactAsync(ContactDto contactDto);

        Task<bool> UpdateContactAsync(int id, ContactDto contactDto);

        Task<bool> DeleteContactAsync(int id);
    }
}