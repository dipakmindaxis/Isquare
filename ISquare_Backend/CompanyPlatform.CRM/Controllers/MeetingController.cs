using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.Core.DTO.Meeting;
using CompanyPlatform.Core.Services.Meeting;
using CompanyPlatform.Core.Services;

namespace CompanyPlatform.Core.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MeetingController : ControllerBase
{
    private readonly IMeetingService _meetingService;

    public MeetingController(IMeetingService meetingService)
    {
        _meetingService = meetingService;
    }

    // GET: api/Meeting
    [HttpGet]
    public async Task<IActionResult> GetAllMeetings()
    {
        var meetings = await _meetingService.GetAllMeetingsAsync();
        return Ok(meetings);
    }

    // GET: api/Meeting/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMeetingById(int id)
    {
        var meeting = await _meetingService.GetMeetingByIdAsync(id);

        if (meeting == null)
            return NotFound(new
            {
                Status = false,
                Message = "Meeting not found."
            });

        return Ok(meeting);
    }

    // POST: api/Meeting
    [HttpPost]
    public async Task<IActionResult> CreateMeeting([FromBody] MeetingDto meetingDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _meetingService.CreateMeetingAsync(meetingDto);

        return Ok(new
        {
            Status = true,
            Message = "Meeting created successfully.",
            Data = result
        });
    }

    // PUT: api/Meeting/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMeeting(int id, [FromBody] MeetingDto meetingDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var updated = await _meetingService.UpdateMeetingAsync(id, meetingDto);

        if (!updated)
            return NotFound(new
            {
                Status = false,
                Message = "Meeting not found."
            });

        return Ok(new
        {
            Status = true,
            Message = "Meeting updated successfully."
        });
    }

    // DELETE: api/Meeting/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMeeting(int id)
    {
        var deleted = await _meetingService.DeleteMeetingAsync(id);

        if (!deleted)
            return NotFound(new
            {
                Status = false,
                Message = "Meeting not found."
            });

        return Ok(new
        {
            Status = true,
            Message = "Meeting deleted successfully."
        });
    }
}