using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.LocationMasters;
using CompanyPlatform.CRM.Services.LocationMasters;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/city")]
    [ApiController]
    [Authorize]
    public class CityController : ControllerBase
    {
        private readonly ICityService _cityService;
        private readonly ILogger<CityController> _logger;

        public CityController(ICityService cityService, ILogger<CityController> logger)
        {
            _cityService = cityService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllCities()
        {
            _logger.LogInformation("API endpoint called: GetAllCities");

            var cities = await _cityService.GetAllCitiesAsync();

            return Ok(cities);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCityById(int id)
        {
            _logger.LogInformation("API endpoint called: GetCityById for ID: {Id}", id);

            try
            {
                var city = await _cityService.GetCityByIdAsync(id);

                return Ok(city);
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
        public async Task<IActionResult> CreateCity([FromBody] CityDto dto)
        {
            _logger.LogInformation("API endpoint called: CreateCity with Name: {CityName}", dto.CityName);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var city = await _cityService.CreateCityAsync(dto);

            return Ok(new
            {
                message = $"City '{city.CityName}' created successfully.",
                city
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCity(int id, [FromBody] CityDto dto)
        {
            _logger.LogInformation("API endpoint called: UpdateCity for ID: {Id}", id);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                await _cityService.UpdateCityAsync(id, dto);

                return Ok(new
                {
                    message = "City updated successfully."
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
        public async Task<IActionResult> DeleteCity(int id)
        {
            _logger.LogInformation("API endpoint called: DeleteCity for ID: {Id}", id);

            try
            {
                await _cityService.DeleteCityAsync(id);

                return Ok(new
                {
                    message = "City deleted successfully."
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

        [HttpGet("state/{stateId}")]
        public async Task<IActionResult> GetCitiesByState(int stateId)
        {
            _logger.LogInformation("API endpoint called: GetCitiesByState for State ID: {StateId}", stateId);

            var cities = await _cityService.GetCitiesByStateAsync(stateId);

            return Ok(cities);
        }
    }
}