using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;using CompanyPlatform.Core.Controllers;
using MeetingAttendeeModel = CompanyPlatform.Core.Models.CRM.Company.MeetingAttendee;

namespace CompanyPlatform.Core.Services
{
    public class MeetingAttendeeService : IMeetingAttendeeService
    {
        private readonly ApplicationDBContext _context;

        public MeetingAttendeeService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MeetingAttendeeDto>> GetAllMeetingAttendeesAsync()
        {
            return await _context.MeetingAttendees
                .Select(x => new MeetingAttendeeDto
                {
                    AttendeeId = x.AttendeeId,
                    MeetingId = x.MeetingId,
                    UserId = x.UserId,
                    IsPresent = x.IsPresent
                })
                .ToListAsync();
        }

        public async Task<MeetingAttendeeDto?> GetMeetingAttendeeByIdAsync(int id)
        {
            var attendee = await _context.MeetingAttendees
                .FirstOrDefaultAsync(x => x.AttendeeId == id);

            if (attendee == null)
                return null;

            return new MeetingAttendeeDto
            {
                AttendeeId = attendee.AttendeeId,
                MeetingId = attendee.MeetingId,
                UserId = attendee.UserId,
                IsPresent = attendee.IsPresent
            };
        }

        public async Task<MeetingAttendeeDto> CreateMeetingAttendeeAsync(
            MeetingAttendeeDto dto)
        {
            var attendee = new MeetingAttendeeModel
            {
                MeetingId = dto.MeetingId,
                UserId = dto.UserId,
                IsPresent = dto.IsPresent
            };

            _context.MeetingAttendees.Add(attendee);

            await _context.SaveChangesAsync();

            dto.AttendeeId = attendee.AttendeeId;

            return dto;
        }

        public async Task<MeetingAttendeeDto?> UpdateMeetingAttendeeAsync(
            int id,
            MeetingAttendeeDto dto)
        {
            var attendee = await _context.MeetingAttendees
                .FirstOrDefaultAsync(x => x.AttendeeId == id);

            if (attendee == null)
                return null;

            attendee.MeetingId = dto.MeetingId;
            attendee.UserId = dto.UserId;
            attendee.IsPresent = dto.IsPresent;

            await _context.SaveChangesAsync();

            return new MeetingAttendeeDto
            {
                AttendeeId = attendee.AttendeeId,
                MeetingId = attendee.MeetingId,
                UserId = attendee.UserId,
                IsPresent = attendee.IsPresent
            };
        }

        public async Task<bool> DeleteMeetingAttendeeAsync(int id)
        {
            var attendee = await _context.MeetingAttendees
                .FirstOrDefaultAsync(x => x.AttendeeId == id);

            if (attendee == null)
                return false;

            _context.MeetingAttendees.Remove(attendee);

            await _context.SaveChangesAsync();

            return true;
        }

        Task<bool> IMeetingAttendeeService.UpdateMeetingAttendeeAsync(int id, MeetingAttendeeDto dto)
        {
            throw new NotImplementedException();
        }
    }
}