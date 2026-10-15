using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.LocationMasters;
using CompanyPlatform.CRM.Services.LocationMasters;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/state")]
    [ApiController]
    [Authorize]
    public class StateController : ControllerBase
    {
        private readonly IStateService _stateService;
        private readonly ILogger<StateController> _logger;

        public StateController(
            IStateService stateService,
            ILogger<StateController> logger)
        {
            _stateService = stateService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStates()
        {
            _logger.LogInformation("API endpoint called: GetAllStates");

            var states = await _stateService.GetAllStatesAsync();

            return Ok(states);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStateById(int id)
        {
            _logger.LogInformation("API endpoint called: GetStateById for ID: {Id}", id);

            try
            {
                var state = await _stateService.GetStateByIdAsync(id);

                return Ok(state);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex.Message);

                return NotFound(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateState([FromBody] StateDto dto)
        {
            _logger.LogInformation("API endpoint called: CreateState with Name: {StateName}", dto.StateName);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var state = await _stateService.CreateStateAsync(dto);

            return Ok(new
            {
                message = $"State '{state.StateName}' created successfully.",
                state
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateState(int id, [FromBody] StateDto dto)
        {
            _logger.LogInformation("API endpoint called: UpdateState for ID: {Id}", id);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                await _stateService.UpdateStateAsync(id, dto);

                return Ok(new
                {
                    message = "State updated successfully."
                });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex.Message);

                return NotFound(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteState(int id)
        {
            _logger.LogInformation("API endpoint called: DeleteState for ID: {Id}", id);

            try
            {
                await _stateService.DeleteStateAsync(id);

                return Ok(new
                {
                    message = "State deleted successfully."
                });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex.Message);

                return NotFound(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("country/{countryId}")]
        public async Task<IActionResult> GetStatesByCountry(int countryId)
        {
            _logger.LogInformation("API endpoint called: GetStatesByCountry for Country ID: {CountryId}", countryId);

            var states = await _stateService.GetStatesByCountryAsync(countryId);

            return Ok(states);
        }
    }
}