using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.Services.ActivityType;
using CompanyPlatform.CRM.DTO.ActivityType;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ActivityTypeController : ControllerBase
    {
        private readonly IActivityTypeService _activityTypeService;

        public ActivityTypeController(
            IActivityTypeService activityTypeService)
        {
            _activityTypeService = activityTypeService;
        }

        // GET: api/ActivityType
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data =
                await _activityTypeService.GetAllActivityTypesAsync();

            return Ok(data);
        }

        // GET: api/ActivityType/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data =
                await _activityTypeService.GetActivityTypeByIdAsync(id);

            if (data == null)
            {
                return NotFound(new
                {
                    Message = "Activity Type not found."
                });
            }

            return Ok(data);
        }

        // POST: api/ActivityType
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] ActivityTypeDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result =
                await _activityTypeService.CreateActivityTypeAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.ID },
                result);
        }

        // PUT: api/ActivityType/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] ActivityTypeDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result =
                await _activityTypeService.UpdateActivityTypeAsync(id, dto);

            if (!result)
            {
                return NotFound(new
                {
                    Message = "Activity Type not found."
                });
            }

            return Ok(new
            {
                Message = "Activity Type updated successfully."
            });
        }

        // DELETE: api/ActivityType/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result =
                await _activityTypeService.DeleteActivityTypeAsync(id);

            if (!result)
            {
                return NotFound(new
                {
                    Message = "Activity Type not found."
                });
            }

            return Ok(new
            {
                Message = "Activity Type deleted successfully."
            });
        }
    }
}






//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using CompanyPlatform.CRM.Services.ActivityType;
//using CompanyPlatform.CRM.DTO.ActivityType;

//namespace CompanyPlatform.CRM.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    [Authorize]
//    public class ActivityTypeController : ControllerBase
//    {
//        private readonly IActivityTypeService _activityTypeService;

//        public ActivityTypeController(IActivityTypeService activityTypeService)
//        {
//            _activityTypeService = activityTypeService;
//        }

//        [HttpGet]
//        public async Task<IActionResult> GetAll()
//        {
//            var data = await _activityTypeService.GetAllActivityTypesAsync();
//            return Ok(data);
//        }

//        [HttpGet("{id}")]
//        public async Task<IActionResult> GetById(int id)
//        {
//            var data = await _activityTypeService.GetActivityTypeByIdAsync(id);

//            if (data == null)
//                return NotFound();

//            return Ok(data);
//        }

//        [HttpPost]
//        public async Task<IActionResult> Create(ActivityTypeDto dto)
//        {
//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);

//            var result = await _activityTypeService.CreateActivityTypeAsync(dto);

//            return CreatedAtAction(nameof(GetById), new { id = result.ID }, result);
//        }

//        [HttpPut("{id}")]
//        public async Task<IActionResult> Update(int id, ActivityTypeDto dto)
//        {
//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);

//            var result = await _activityTypeService.UpdateActivityTypeAsync(id, dto);

//            if (!result)
//                return NotFound();

//            return Ok(new
//            {
//                Message = "Activity Type updated successfully."
//            });
//        }

//        [HttpDelete("{id}")]
//        public async Task<IActionResult> Delete(int id)
//        {
//            var result = await _activityTypeService.DeleteActivityTypeAsync(id);

//            if (!result)
//                return NotFound();

//            return Ok(new
//            {
//                Message = "Activity Type deleted successfully."
//            });
//        }
//    }
//}