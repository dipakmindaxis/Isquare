using CompanyPlatform.Core.DTO.Contact;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Services;

using ContactEntity =
    CompanyPlatform.Core.Models.CRM.Company.Contact;

namespace CompanyPlatform.Core.Services.Contact
{
    public class ContactService : IContactService
    {
        private readonly IRepositories<ContactEntity> _contactRepository;

        public ContactService(
            IRepositories<ContactEntity> contactRepository)
        {
            _contactRepository = contactRepository;
        }

        // GET: All contacts
        public async Task<IEnumerable<ContactDto>> GetAllContactsAsync()
        {
            var contacts = await _contactRepository.GetAll();

            return contacts
                .Where(c => !c.IsDeleted)
                .Select(MapToDto)
                .ToList();
        }

        // GET: Contact by ID
        public async Task<ContactDto?> GetContactByIdAsync(int id)
        {
            var contact = await _contactRepository.GetById(id);

            if (contact == null || contact.IsDeleted)
                return null;

            return MapToDto(contact);
        }

        // GET: Contacts by Company ID
        public async Task<IEnumerable<ContactDto>>
            GetContactsByCompanyIdAsync(int companyId)
        {
            var contacts = await _contactRepository.GetAll();

            return contacts
                .Where(c =>
                    c.CompanyId == companyId &&
                    !c.IsDeleted)
                .Select(MapToDto)
                .ToList();
        }

        // POST: Create contact
        public async Task<ContactDto> CreateContactAsync(ContactDto dto)
        {
            var contact = new ContactEntity
            {
                CompanyId = dto.CompanyId,
                FullName = dto.FullName,
                Department = dto.Department,
                Designation = dto.Designation,
                MobileNo = dto.MobileNo,
                AltMobileNo = dto.AltMobileNo,
                EmailAddress = dto.EmailAddress,
                AltEmailAddress = dto.AltEmailAddress,

                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,

                IsActive = true,
                IsDeleted = false
            };

            await _contactRepository.Create(contact);

            return MapToDto(contact);
        }

        // PUT: Update contact
        public async Task<bool> UpdateContactAsync(
            int id,
            ContactDto dto)
        {
            var contact = await _contactRepository.GetById(id);

            if (contact == null || contact.IsDeleted)
                return false;

            contact.CompanyId = dto.CompanyId;
            contact.FullName = dto.FullName;
            contact.Department = dto.Department;
            contact.Designation = dto.Designation;
            contact.MobileNo = dto.MobileNo;
            contact.AltMobileNo = dto.AltMobileNo;
            contact.EmailAddress = dto.EmailAddress;
            contact.AltEmailAddress = dto.AltEmailAddress;

            contact.UpdatedBy = dto.UpdatedBy;
            contact.UpdatedDate = DateTime.Now;
            contact.IsActive = dto.IsActive;

            await _contactRepository.Update(contact);

            return true;
        }

        // DELETE: Soft delete contact
        public async Task<bool> DeleteContactAsync(int id)
        {
            var contact = await _contactRepository.GetById(id);

            if (contact == null || contact.IsDeleted)
                return false;

            contact.IsDeleted = true;
            contact.IsActive = false;
            contact.UpdatedDate = DateTime.Now;

            await _contactRepository.Update(contact);

            return true;
        }

        // Entity to DTO mapping
        private static ContactDto MapToDto(ContactEntity contact)
        {
            return new ContactDto
            {
                ContactId = contact.ContactId,
                CompanyId = contact.CompanyId,
                FullName = contact.FullName,
                Department = contact.Department,
                Designation = contact.Designation,
                MobileNo = contact.MobileNo,
                AltMobileNo = contact.AltMobileNo,
                EmailAddress = contact.EmailAddress,
                AltEmailAddress = contact.AltEmailAddress,

                CreatedBy = contact.CreatedBy,
                CreatedDate = contact.CreatedDate,
                UpdatedBy = contact.UpdatedBy,
                UpdatedDate = contact.UpdatedDate,

                IsActive = contact.IsActive,
                IsDeleted = contact.IsDeleted
            };
        }
    }
}