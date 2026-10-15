using CompanyPlatform.CRM.DTO.CallType;
using CompanyPlatform.CRM.Services.CallType;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers.CallType
{
    [Route("api/[controller]")]
    [ApiController]
    public class CallTypeController : ControllerBase
    {
        private readonly ICallTypeService _callTypeService;
        private readonly ILogger<CallTypeController> _logger;

        public CallTypeController(
            ICallTypeService callTypeService,
            ILogger<CallTypeController> logger)
        {
            _callTypeService = callTypeService;
            _logger = logger;
        }

        // GET: api/CallType
        [HttpGet]
        public async Task<IActionResult> GetAllCallTypes()
        {
            try
            {
                var result = await _callTypeService.GetAllCallTypesAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all Call Types.");

                return StatusCode(500, "An error occurred while fetching Call Types.");
            }
        }

        // GET: api/CallType/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCallTypeById(int id)
        {
            try
            {
                var result = await _callTypeService.GetCallTypeByIdAsync(id);

                if (result == null)
                {
                    return NotFound($"Call Type with ID {id} not found.");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching Call Type with ID: {ID}", id);

                return StatusCode(500, "An error occurred while fetching the Call Type.");
            }
        }

        // POST: api/CallType
        [HttpPost]
        public async Task<IActionResult> CreateCallType([FromBody] CallTypeDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _callTypeService.CreateCallTypeAsync(dto);

                return CreatedAtAction(
                    nameof(GetCallTypeById),
                    new { id = result.ID },
                    result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Call Type.");

                return StatusCode(500, "An error occurred while creating the Call Type.");
            }
        }

        // PUT: api/CallType/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCallType(
            int id,
            [FromBody] CallTypeDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _callTypeService.UpdateCallTypeAsync(id, dto);

                if (!result)
                {
                    return NotFound($"Call Type with ID {id} not found.");
                }

                return Ok(new
                {
                    message = "Call Type updated successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Call Type with ID: {ID}", id);

                return StatusCode(500, "An error occurred while updating the Call Type.");
            }
        }

        // DELETE: api/CallType/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCallType(int id)
        {
            try
            {
                var result = await _callTypeService.DeleteCallTypeAsync(id);

                if (!result)
                {
                    return NotFound($"Call Type with ID {id} not found.");
                }

                return Ok(new
                {
                    message = "Call Type deleted successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting Call Type with ID: {ID}", id);

                return StatusCode(500, "An error occurred while deleting the Call Type.");
            }
        }
    }
}