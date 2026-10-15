using CompanyPlatform.CRM.DTO.Call;
using CompanyPlatform.CRM.Services.Call;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CallController : ControllerBase
    {
        private readonly ICallService _callService;
        private readonly ILogger<CallController> _logger;

        public CallController(
            ICallService callService,
            ILogger<CallController> logger)
        {
            _callService = callService;
            _logger = logger;
        }

        // GET: api/Call
        [HttpGet]
        public async Task<IActionResult> GetAllCalls()
        {
            try
            {
                var calls = await _callService.GetAllCallsAsync();
                return Ok(calls);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching calls.");
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching calls."
                });
            }
        }

        // GET: api/Call/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCallById(int id)
        {
            try
            {
                var call = await _callService.GetCallByIdAsync(id);

                if (call == null)
                {
                    return NotFound(new
                    {
                        message = $"Call with ID {id} was not found."
                    });
                }

                return Ok(call);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching call with ID {CallId}.", id);
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching the call."
                });
            }
        }

        // POST: api/Call
        [HttpPost]
        public async Task<IActionResult> CreateCall([FromBody] CallDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdCall = await _callService.CreateCallAsync(dto);

                return CreatedAtAction(
                    nameof(GetCallById),
                    new { id = createdCall.CallId },
                    createdCall);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating call.");
                return StatusCode(500, new
                {
                    message = "An error occurred while creating the call."
                });
            }
        }

        // PUT: api/Call/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCall(int id, [FromBody] CallDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updated = await _callService.UpdateCallAsync(id, dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        message = $"Call with ID {id} was not found."
                    });
                }

                return Ok(new
                {
                    message = "Call updated successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating call with ID {CallId}.", id);
                return StatusCode(500, new
                {
                    message = "An error occurred while updating the call."
                });
            }
        }

        // DELETE: api/Call/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCall(int id)
        {
            try
            {
                var deleted = await _callService.DeleteCallAsync(id);

                if (!deleted)
                {
                    return NotFound(new
                    {
                        message = $"Call with ID {id} was not found."
                    });
                }

                return Ok(new
                {
                    message = "Call deleted successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting call with ID {CallId}.", id);
                return StatusCode(500, new
                {
                    message = "An error occurred while deleting the call."
                });
            }
        }
    }
}
