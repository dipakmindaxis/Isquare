using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.Services;

namespace CompanyPlatform.Core.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MeetingAttendeeController : ControllerBase
    {
        private readonly IMeetingAttendeeService _service;

        public MeetingAttendeeController(IMeetingAttendeeService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllMeetingAttendeesAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetMeetingAttendeeByIdAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MeetingAttendeeDto dto)
        {
            var result = await _service.CreateMeetingAttendeeAsync(dto);

            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MeetingAttendeeDto dto)
        {
            var success = await _service.UpdateMeetingAttendeeAsync(id, dto);

            if (!success)
                return NotFound();

            return Ok("Updated Successfully");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteMeetingAttendeeAsync(id);

            if (!success)
                return NotFound();

            return Ok("Deleted Successfully");
        }
    }

    public class MeetingAttendeeDto
    {
        public int AttendeeId { get; internal set; }
        public int MeetingId { get; internal set; }
        public int UserId { get; internal set; }
        public bool IsPresent { get; internal set; }
    }
}