using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.Enquiry;
using CompanyPlatform.CRM.Services.Enquiry;

namespace CompanyPlatform.CRM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnquiryController : ControllerBase
    {
        private readonly IEnquiryService _enquiryService;
        private readonly IWebHostEnvironment _env;

        public EnquiryController(IEnquiryService enquiryService, IWebHostEnvironment env)
        {
            _enquiryService = enquiryService;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _enquiryService.GetAllEnquiriesAsync();
            return Ok(list);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _enquiryService.GetEnquiryByIdAsync(id);
            if (item == null) return NotFound(new { message = $"Enquiry with ID {id} not found." });
            return Ok(item);
        }

        [HttpGet("next-number")]
        public async Task<IActionResult> GetNextNumber()
        {
            var nextNo = await _enquiryService.GetNextEnquiryNumberAsync();
            return Ok(new { nextEnquiryNumber = nextNo });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EnquiryCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _enquiryService.CreateEnquiryAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.EnquiryId }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] EnquiryUpdateDto dto)
        {
            if (id != dto.EnquiryId)
                return BadRequest(new { message = "ID mismatch." });

            try
            {
                var success = await _enquiryService.UpdateEnquiryAsync(id, dto);
                if (!success) return NotFound();
                return Ok(new { message = "Enquiry updated successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _enquiryService.DeleteEnquiryAsync(id);
            if (!success) return NotFound();
            return Ok(new { message = "Enquiry soft-deleted successfully." });
        }

        [HttpPost("upload-doc")]
        public async Task<IActionResult> UploadDocument([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Directory.GetCurrentDirectory(), "uploads", "enquiries");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/enquiries/{fileName}";
            return Ok(new { filePath = relativePath, originalName = file.FileName });
        }
    }
}