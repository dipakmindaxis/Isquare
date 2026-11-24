using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.SalesActivity;
using Microsoft.Extensions.Logging;

using SalesActivityEntity = CompanyPlatform.Core.Models.CRM.SalesActivity;

namespace CompanyPlatform.CRM.Services.SalesActivity
{
    public class SalesActivityService : ISalesActivityService
    {
        private readonly IRepositories<SalesActivityEntity> _repository;
        private readonly ILogger<SalesActivityService> _logger;

        public SalesActivityService(
            IRepositories<SalesActivityEntity> repository,
            ILogger<SalesActivityService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<SalesActivityDto>> GetAllSalesActivitiesAsync()
        {
            _logger.LogInformation("Fetching all sales activities.");

            var items = await _repository.FindByCondition(x => !x.IsDeleted);

            return items.OrderByDescending(x => x.ActivityId).Select(MapToDto);
        }

        public async Task<SalesActivityDto?> GetSalesActivityByIdAsync(int id)
        {
            _logger.LogInformation("Fetching sales activity by ID: {ID}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Sales activity with ID: {ID} not found.", id);
                return null;
            }

            return MapToDto(item);
        }

        public async Task<SalesActivityDto> CreateSalesActivityAsync(CreateSalesActivityDto dto)
        {
            _logger.LogInformation("Creating new sales activity.");

            var entity = new SalesActivityEntity
            {
                ActivityCode = dto.ActivityCode,
                CompanyId = dto.CompanyId,
                CustomerName = dto.CustomerName,
                ContactPerson = dto.ContactPerson,
                ContactPhone = dto.ContactPhone,
                ContactEmail = dto.ContactEmail,
                AssignedEmployeeId = dto.AssignedEmployeeId,
                AssignedEmployeeName = dto.AssignedEmployeeName,
                AssignedType = dto.AssignedType,
                AssignedTeamId = dto.AssignedTeamId,
                AssignedTeamName = dto.AssignedTeamName,
                ActivityType = dto.ActivityType,
                ActivitySubType = dto.ActivitySubType,
                ActivityDate = dto.ActivityDate,
                ActivityTime = dto.ActivityTime,
                DurationMinutes = dto.DurationMinutes,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Scheduled" : dto.Status,
                StatusDescription = dto.StatusDescription,
                Priority = dto.Priority,
                PriorityId = dto.PriorityId,
                Subject = dto.Subject,
                DiscussionNotes = dto.DiscussionNotes,
                Outcome = dto.Outcome,
                Location = dto.Location,
                WorkLocationId = dto.WorkLocationId,
                MeetingLink = dto.MeetingLink,
                MeetingType = dto.MeetingType,
                CallOutcome = dto.CallOutcome,
                CallType = dto.CallType,
                ProductName = dto.ProductName,
                SampleQuantity = dto.SampleQuantity,
                RelatedRecordType = dto.RelatedRecordType,
                RelatedRecordId = dto.RelatedRecordId,
                RelatedRecordCode = dto.RelatedRecordCode,
                RelatedRecordTitle = dto.RelatedRecordTitle,
                EnquiryId = dto.EnquiryId,
                DocumentCategory = dto.DocumentCategory,
                FollowUpDate = dto.FollowUpDate,
                DueTime = dto.DueTime,
                NextActionDate = dto.NextActionDate,
                NextActionDetails = dto.NextActionDetails,
                FollowUpStatus = dto.FollowUpStatus,
                FollowUpStatusId = dto.FollowUpStatusId,
                FollowUpPriorityId = dto.FollowUpPriorityId,
                ReminderTitle = dto.ReminderTitle,
                ReminderDate = dto.ReminderDate,
                ReminderTime = dto.ReminderTime,
                ReminderRemarks = dto.ReminderRemarks,
                ReminderAssignedTo = dto.ReminderAssignedTo,
                ReminderPriorityId = dto.ReminderPriorityId,
                ReminderStatusId = dto.ReminderStatusId,
                AttachmentsJson = dto.AttachmentsJson,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.UtcNow,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            // Auto-generate activity code if not provided
            if (string.IsNullOrWhiteSpace(entity.ActivityCode))
            {
                entity.ActivityCode = $"ACT-{DateTime.UtcNow.Year}-{entity.ActivityId:D4}";
                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync();
            }

            _logger.LogInformation("Sales activity created with ID: {ID}", entity.ActivityId);

            return MapToDto(entity);
        }

        public async Task<SalesActivityDto?> UpdateSalesActivityAsync(int id, UpdateSalesActivityDto dto)
        {
            _logger.LogInformation("Updating sales activity with ID: {ID}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsDeleted)
            {
                _logger.LogWarning("Sales activity with ID: {ID} not found for update.", id);
                return null;
            }

            entity.ActivityCode = dto.ActivityCode ?? entity.ActivityCode;
            entity.CompanyId = dto.CompanyId ?? entity.CompanyId;
            entity.CustomerName = dto.CustomerName ?? entity.CustomerName;
            entity.ContactPerson = dto.ContactPerson ?? entity.ContactPerson;
            entity.ContactPhone = dto.ContactPhone ?? entity.ContactPhone;
            entity.ContactEmail = dto.ContactEmail ?? entity.ContactEmail;
            entity.AssignedEmployeeId = dto.AssignedEmployeeId ?? entity.AssignedEmployeeId;
            entity.AssignedEmployeeName = dto.AssignedEmployeeName ?? entity.AssignedEmployeeName;
            entity.AssignedType = dto.AssignedType ?? entity.AssignedType;
            entity.AssignedTeamId = dto.AssignedTeamId ?? entity.AssignedTeamId;
            entity.AssignedTeamName = dto.AssignedTeamName ?? entity.AssignedTeamName;
            if (!string.IsNullOrWhiteSpace(dto.ActivityType))
            {
                entity.ActivityType = dto.ActivityType;
            }
            entity.ActivitySubType = dto.ActivitySubType ?? entity.ActivitySubType;
            entity.ActivityDate = dto.ActivityDate ?? entity.ActivityDate;
            entity.ActivityTime = dto.ActivityTime ?? entity.ActivityTime;
            entity.DurationMinutes = dto.DurationMinutes ?? entity.DurationMinutes;
            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                entity.Status = dto.Status;
            }
            entity.StatusDescription = dto.StatusDescription ?? entity.StatusDescription;
            entity.Priority = dto.Priority ?? entity.Priority;
            entity.PriorityId = dto.PriorityId ?? entity.PriorityId;
            entity.Subject = dto.Subject ?? entity.Subject;
            entity.DiscussionNotes = dto.DiscussionNotes ?? entity.DiscussionNotes;
            entity.Outcome = dto.Outcome ?? entity.Outcome;
            entity.Location = dto.Location ?? entity.Location;
            entity.WorkLocationId = dto.WorkLocationId ?? entity.WorkLocationId;
            entity.MeetingLink = dto.MeetingLink ?? entity.MeetingLink;
            entity.MeetingType = dto.MeetingType ?? entity.MeetingType;
            entity.CallOutcome = dto.CallOutcome ?? entity.CallOutcome;
            entity.CallType = dto.CallType ?? entity.CallType;
            entity.ProductName = dto.ProductName ?? entity.ProductName;
            entity.SampleQuantity = dto.SampleQuantity ?? entity.SampleQuantity;
            entity.RelatedRecordType = dto.RelatedRecordType ?? entity.RelatedRecordType;
            entity.RelatedRecordId = dto.RelatedRecordId ?? entity.RelatedRecordId;
            entity.RelatedRecordCode = dto.RelatedRecordCode ?? entity.RelatedRecordCode;
            entity.RelatedRecordTitle = dto.RelatedRecordTitle ?? entity.RelatedRecordTitle;
            entity.EnquiryId = dto.EnquiryId ?? entity.EnquiryId;
            entity.DocumentCategory = dto.DocumentCategory ?? entity.DocumentCategory;
            entity.FollowUpDate = dto.FollowUpDate ?? entity.FollowUpDate;
            entity.DueTime = dto.DueTime ?? entity.DueTime;
            entity.NextActionDate = dto.NextActionDate ?? entity.NextActionDate;
            entity.NextActionDetails = dto.NextActionDetails ?? entity.NextActionDetails;
            entity.FollowUpStatus = dto.FollowUpStatus ?? entity.FollowUpStatus;
            entity.FollowUpStatusId = dto.FollowUpStatusId ?? entity.FollowUpStatusId;
            entity.FollowUpPriorityId = dto.FollowUpPriorityId ?? entity.FollowUpPriorityId;
            entity.ReminderTitle = dto.ReminderTitle ?? entity.ReminderTitle;
            entity.ReminderDate = dto.ReminderDate ?? entity.ReminderDate;
            entity.ReminderTime = dto.ReminderTime ?? entity.ReminderTime;
            entity.ReminderRemarks = dto.ReminderRemarks ?? entity.ReminderRemarks;
            entity.ReminderAssignedTo = dto.ReminderAssignedTo ?? entity.ReminderAssignedTo;
            entity.ReminderPriorityId = dto.ReminderPriorityId ?? entity.ReminderPriorityId;
            entity.ReminderStatusId = dto.ReminderStatusId ?? entity.ReminderStatusId;
            entity.AttachmentsJson = dto.AttachmentsJson ?? entity.AttachmentsJson;
            entity.UpdatedBy = dto.UpdatedBy;
            entity.UpdatedDate = DateTime.UtcNow;
            entity.IsActive = dto.IsActive;
            entity.IsDeleted = dto.IsDeleted;

            await _repository.UpdateAsync(entity);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("Sales activity updated with ID: {ID}", id);

            return MapToDto(entity);
        }

        public async Task<bool> DeleteSalesActivityAsync(int id)
        {
            _logger.LogInformation("Deleting sales activity with ID: {ID}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsDeleted)
            {
                _logger.LogWarning("Sales activity with ID: {ID} not found for deletion.", id);
                return false;
            }

            entity.IsDeleted = true;
            entity.UpdatedDate = DateTime.UtcNow;

            await _repository.UpdateAsync(entity);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("Sales activity with ID: {ID} soft-deleted successfully.", id);

            return true;
        }

        private static SalesActivityDto MapToDto(SalesActivityEntity x)
        {
            return new SalesActivityDto
            {
                ActivityId = x.ActivityId,
                ActivityCode = x.ActivityCode,
                CompanyId = x.CompanyId,
                CustomerName = x.CustomerName,
                ContactPerson = x.ContactPerson,
                ContactPhone = x.ContactPhone,
                ContactEmail = x.ContactEmail,
                AssignedEmployeeId = x.AssignedEmployeeId,
                AssignedEmployeeName = x.AssignedEmployeeName,
                AssignedType = x.AssignedType,
                AssignedTeamId = x.AssignedTeamId,
                AssignedTeamName = x.AssignedTeamName,
                ActivityType = x.ActivityType,
                ActivitySubType = x.ActivitySubType,
                ActivityDate = x.ActivityDate,
                ActivityTime = x.ActivityTime,
                DurationMinutes = x.DurationMinutes,
                Status = x.Status,
                StatusDescription = x.StatusDescription,
                Priority = x.Priority,
                PriorityId = x.PriorityId,
                Subject = x.Subject,
                DiscussionNotes = x.DiscussionNotes,
                Outcome = x.Outcome,
                Location = x.Location,
                WorkLocationId = x.WorkLocationId,
                MeetingLink = x.MeetingLink,
                MeetingType = x.MeetingType,
                CallOutcome = x.CallOutcome,
                CallType = x.CallType,
                ProductName = x.ProductName,
                SampleQuantity = x.SampleQuantity,
                RelatedRecordType = x.RelatedRecordType,
                RelatedRecordId = x.RelatedRecordId,
                RelatedRecordCode = x.RelatedRecordCode,
                RelatedRecordTitle = x.RelatedRecordTitle,
                EnquiryId = x.EnquiryId,
                DocumentCategory = x.DocumentCategory,
                FollowUpDate = x.FollowUpDate,
                DueTime = x.DueTime,
                NextActionDate = x.NextActionDate,
                NextActionDetails = x.NextActionDetails,
                FollowUpStatus = x.FollowUpStatus,
                FollowUpStatusId = x.FollowUpStatusId,
                FollowUpPriorityId = x.FollowUpPriorityId,
                ReminderTitle = x.ReminderTitle,
                ReminderDate = x.ReminderDate,
                ReminderTime = x.ReminderTime,
                ReminderRemarks = x.ReminderRemarks,
                ReminderAssignedTo = x.ReminderAssignedTo,
                ReminderPriorityId = x.ReminderPriorityId,
                ReminderStatusId = x.ReminderStatusId,
                AttachmentsJson = x.AttachmentsJson,
                CreatedBy = x.CreatedBy,
                CreatedDate = x.CreatedDate,
                UpdatedBy = x.UpdatedBy,
                UpdatedDate = x.UpdatedDate,
                IsActive = x.IsActive,
                IsDeleted = x.IsDeleted
            };
        }
    }
}
