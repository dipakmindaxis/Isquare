using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.Services;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using CompanyPlatform.CRM.DTO.Meeting;
using CompanyPlatform.CRM.VisitType;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VisitTypeController : ControllerBase
    {
        private readonly IVisitTypeService _visitTypeService;

        public VisitTypeController(IVisitTypeService visitTypeService)
        {
            _visitTypeService = visitTypeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _visitTypeService.GetAllVisitTypesAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _visitTypeService.GetVisitTypeByIdAsync(id);

            if (data == null)
                return NotFound();

            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> Create(VisitTypeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _visitTypeService.CreateVisitTypeAsync(dto);

            return CreatedAtAction(nameof(GetById), new { id = result.ID }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, VisitTypeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _visitTypeService.UpdateVisitTypeAsync(id, dto);

            if (!result)
                return NotFound();

            return Ok(new
            {
                Message = "Visit Type updated successfully."
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _visitTypeService.DeleteVisitTypeAsync(id);

            if (!result)
                return NotFound();

            return Ok(new
            {
                Message = "Visit Type deleted successfully."
            });
        }
    }
}