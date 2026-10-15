using CompanyPlatform.Core.DTO.Meeting;
using CompanyPlatform.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Controllers;

[Route("api/reminderstatuses")]
[ApiController]
[Authorize]
public class ReminderStatusController : ControllerBase
{
    private readonly IReminderStatusService _reminderStatusService;
    private readonly ILogger<ReminderStatusController> _logger;

    public ReminderStatusController(
        IReminderStatusService reminderStatusService,
        ILogger<ReminderStatusController> logger)
    {
        _reminderStatusService = reminderStatusService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        _logger.LogInformation("API endpoint called: GetAll Reminder Statuses");

        var reminderStatuses =
            await _reminderStatusService.GetAllReminderStatusesAsync();

        return Ok(reminderStatuses);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        _logger.LogInformation(
            "API endpoint called: GetById for Reminder Status ID: {ReminderStatusId}",
            id);

        var reminderStatus =
            await _reminderStatusService.GetReminderStatusByIdAsync(id);

        if (reminderStatus == null)
        {
            _logger.LogWarning(
                "GetById failed. Reminder Status with ID {ReminderStatusId} not found or is inactive.",
                id);

            return NotFound(new
            {
                message = $"Reminder Status with ID {id} not found or is inactive."
            });
        }

        return Ok(reminderStatus);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Create(
        [FromBody] ReminderStatusDto reminderStatusDto)
    {
        _logger.LogInformation(
            "API endpoint called: Create Reminder Status");

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var createdReminderStatus = await _reminderStatusService.CreateReminderStatusAsync(
                reminderStatusDto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = createdReminderStatus.ID },
            createdReminderStatus);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] ReminderStatusDto reminderStatusDto)
    {
        _logger.LogInformation(
            "API endpoint called: Update Reminder Status for ID: {ReminderStatusId}",
            id);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result =
            await _reminderStatusService.UpdateReminderStatusAsync(
                id,
                reminderStatusDto);

        if (!result)
        {
            _logger.LogWarning(
                "Update failed. Reminder Status with ID {ReminderStatusId} not found or is inactive.",
                id);

            return NotFound(new
            {
                message = $"Reminder Status with ID {id} not found or is inactive."
            });
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        _logger.LogInformation(
            "API endpoint called: Delete Reminder Status for ID: {ReminderStatusId}",
            id);

        var result =
            await _reminderStatusService.DeleteReminderStatusAsync(id);

        if (!result)
        {
            _logger.LogWarning(
                "Delete failed. Reminder Status with ID {ReminderStatusId} not found.",
                id);

            return NotFound(new
            {
                message = $"Reminder Status with ID {id} not found."
            });
        }

        return Ok(new
        {
            message = $"Reminder Status with ID {id} has been deactivated."
        });
    }
}