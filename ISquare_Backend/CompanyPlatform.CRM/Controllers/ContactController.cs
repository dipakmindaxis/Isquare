using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.Core.DTO.Contact;
using CompanyPlatform.Core.Services;

namespace CompanyPlatform.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly IContactService _contactService;

        public ContactController(IContactService contactService)
        {
            _contactService = contactService;
        }

        // GET: api/Contact
        [HttpGet]
        public async Task<IActionResult> GetAllContacts()
        {
            var contacts = await _contactService.GetAllContactsAsync();

            return Ok(contacts);
        }

        // GET: api/Contact/2
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetContactById(int id)
        {
            var contact = await _contactService.GetContactByIdAsync(id);

            if (contact == null)
            {
                return NotFound(new
                {
                    Status = false,
                    Message = "Contact not found."
                });
            }

            return Ok(contact);
        }

        // GET: api/Contact/company/8
        [HttpGet("company/{companyId:int}")]
        public async Task<IActionResult> GetContactsByCompanyId(
            int companyId)
        {
            var contacts =
                await _contactService.GetContactsByCompanyIdAsync(companyId);

            return Ok(contacts);
        }

        // POST: api/Contact
        [HttpPost]
        public async Task<IActionResult> CreateContact(
            [FromBody] ContactDto contactDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result =
                await _contactService.CreateContactAsync(contactDto);

            return Ok(new
            {
                Status = true,
                Message = "Contact created successfully.",
                Data = result
            });
        }

        // PUT: api/Contact/2
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateContact(
            int id,
            [FromBody] ContactDto contactDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated =
                await _contactService.UpdateContactAsync(id, contactDto);

            if (!updated)
            {
                return NotFound(new
                {
                    Status = false,
                    Message = "Contact not found."
                });
            }

            return Ok(new
            {
                Status = true,
                Message = "Contact updated successfully."
            });
        }

        // DELETE: api/Contact/2
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteContact(int id)
        {
            var deleted = await _contactService.DeleteContactAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Status = false,
                    Message = "Contact not found."
                });
            }

            return Ok(new
            {
                Status = true,
                Message = "Contact deleted successfully."
            });
        }
    }
}