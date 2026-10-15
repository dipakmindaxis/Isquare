using CompanyPlatform.Core.DTO.Meeting;
using CompanyPlatform.Core.Models.CRM.Company;
using MeetingEntity = CompanyPlatform.Core.Models.CRM.Company.Meeting;
using CompanyPlatform.Core.Repository;


namespace CompanyPlatform.Core.Services.Meeting
{
    public class MeetingService : IMeetingService
    {
        private readonly IRepositories<MeetingEntity> _meetingRepository;

        public MeetingService(IRepositories<MeetingEntity> meetingRepository)
        {
            _meetingRepository = meetingRepository;
        }

        public async Task<IEnumerable<MeetingDto>> GetAllMeetingsAsync()
        {
            var meetings = await _meetingRepository.GetAll();

            return meetings.Select(m => new MeetingDto
            {
                MeetingId = m.MeetingId,
                //CompanyId = m.CompanyId,
                //MeetingTypeId = m.MeetingTypeId,
                UserId = m.UserId,
                MeetingDate = m.MeetingDate,
                MeetingTime = m.MeetingTime,
                Duration = m.Duration,
                Location = m.Location,
                Agenda = m.Agenda,
                Outcome = m.Outcome,
                NextMeetingDate = m.NextMeetingDate,
                Status = m.Status,
                CreatedBy = m.CreatedBy,
                CreatedDate = m.CreatedDate,
                UpdatedBy = m.UpdatedBy,
                UpdatedDate = m.UpdatedDate,
                IsActive = m.IsActive,
                IsDeleted = m.IsDeleted
            });
        }

        public async Task<MeetingDto?> GetMeetingByIdAsync(int id)
        {
            var meeting = await _meetingRepository.GetById(id);

            if (meeting == null)
                return null;

            return new MeetingDto
            {
                MeetingId = meeting.MeetingId,
                //CompanyId = meeting.CompanyId,
                //MeetingTypeId = meeting.MeetingTypeId,
                UserId = meeting.UserId,
                MeetingDate = meeting.MeetingDate,
                MeetingTime = meeting.MeetingTime,
                Duration = meeting.Duration,
                Location = meeting.Location,
                Agenda = meeting.Agenda,
                Outcome = meeting.Outcome,
                NextMeetingDate = meeting.NextMeetingDate,
                Status = meeting.Status,
                CreatedBy = meeting.CreatedBy,
                CreatedDate = meeting.CreatedDate,
                UpdatedBy = meeting.UpdatedBy,
                UpdatedDate = meeting.UpdatedDate,
                IsActive = meeting.IsActive,
                IsDeleted = meeting.IsDeleted
            };
        }

        public async Task<MeetingDto> CreateMeetingAsync(MeetingDto dto)
        {
            var meeting = new MeetingEntity
            {
                //CompanyId = dto.CompanyId,
                //MeetingTypeId = dto.MeetingTypeId,
                UserId = dto.UserId,
                MeetingDate = dto.MeetingDate,
                MeetingTime = dto.MeetingTime,
                Duration = dto.Duration,
                Location = dto.Location,
                Agenda = dto.Agenda,
                Outcome = dto.Outcome,
                NextMeetingDate = dto.NextMeetingDate,
                Status = dto.Status,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsActive = true,
                IsDeleted = false
            };

            await _meetingRepository.Create(meeting);

            dto.MeetingId = meeting.MeetingId;

            return dto;
        }

        public async Task<bool> UpdateMeetingAsync(int id, MeetingDto dto)
        {
            var meeting = await _meetingRepository.GetById(id);

            if (meeting == null)
                return false;

            //meeting.CompanyId = dto.CompanyId;
            //meeting.MeetingTypeId = dto.MeetingTypeId;
            meeting.UserId = dto.UserId;
            meeting.MeetingDate = dto.MeetingDate;
            meeting.MeetingTime = dto.MeetingTime;
            meeting.Duration = dto.Duration;
            meeting.Location = dto.Location;
            meeting.Agenda = dto.Agenda;
            meeting.Outcome = dto.Outcome;
            meeting.NextMeetingDate = dto.NextMeetingDate;
            meeting.Status = dto.Status;
            meeting.UpdatedBy = dto.UpdatedBy;
            meeting.UpdatedDate = DateTime.Now;
            meeting.IsActive = dto.IsActive;
            meeting.IsDeleted = dto.IsDeleted;

            await _meetingRepository.Update(meeting);

            return true;
        }

        public async Task<bool> DeleteMeetingAsync(int id)
        {
            var meeting = await _meetingRepository.GetById(id);

            if (meeting == null)
                return false;

            meeting.IsDeleted = true;

            await _meetingRepository.Update(meeting);

            return true;
        }
    }
}