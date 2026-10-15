using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.LocationMasters;
using CompanyPlatform.CRM.Services.LocationMasters;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/country")]
    [ApiController]
    [Authorize]
    public class CountryController : ControllerBase
    {
        private readonly ICountryService _countryService;
        private readonly ILogger<CountryController> _logger;

        public CountryController(ICountryService countryService,ILogger<CountryController> logger)
        {
            _countryService = countryService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCountries()
        {
            _logger.LogInformation("API endpoint called: GetAllCountries");

            var countries = await _countryService.GetAllCountriesAsync();

            return Ok(countries);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCountryById(int id)
        {
            _logger.LogInformation("API endpoint called: GetCountryById for ID: {Id}", id);

            try
            {
                var country = await _countryService.GetCountryByIdAsync(id);

                return Ok(country);
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
        public async Task<IActionResult> CreateCountry([FromBody] CountryDto dto)
        {
            _logger.LogInformation("API endpoint called: CreateCountry with Name: {CountryName}", dto.CountryName);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var country = await _countryService.CreateCountryAsync(dto);

            return Ok(new
            {
                message = $"Country '{country.CountryName}' created successfully.",
                country
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCountry(int id, [FromBody] CountryDto dto)
        {
            _logger.LogInformation("API endpoint called: UpdateCountry for ID: {Id}", id);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                await _countryService.UpdateCountryAsync(id, dto);

                return Ok(new
                {
                    message = "Country updated successfully."
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
        public async Task<IActionResult> DeleteCountry(int id)
        {
            _logger.LogInformation("API endpoint called: DeleteCountry for ID: {Id}", id);

            try
            {
                await _countryService.DeleteCountryAsync(id);

                return Ok(new
                {
                    message = "Country deleted successfully."
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
    }
}