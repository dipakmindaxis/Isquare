using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CompanyNote;
using CompanyPlatform.Core.Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.CompanyNote
{
    public class CompanyNoteService : ICompanyNoteService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyNote> _repository;
        private readonly ILogger<CompanyNoteService> _logger;

        public CompanyNoteService(
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyNote> repository,
            ILogger<CompanyNoteService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<CompanyNoteDto>> GetAllCompanyNotesAsync()
        {
            _logger.LogInformation("Fetching all active company notes.");

            var items = await _repository.GetAll();

            return items
                .Where(x => x.IsDeleted == false)
                .Select(x => new CompanyNoteDto
                {
                    NoteId = x.NoteId,
                    CompanyId = x.CompanyId,
                    UserId = x.UserId,
                    Notes = x.Notes,
                    CreatedDate = x.CreatedDate,
                    UpdatedDate = x.UpdatedDate,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<CompanyNoteDto> GetCompanyNoteByIdAsync(int id)
        {
            _logger.LogInformation("Fetching company note by ID: {NoteId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted == true)
            {
                _logger.LogWarning("Company Note with ID: {NoteId} not found or is inactive.", id);
                return null;
            }

            return new CompanyNoteDto
            {
                NoteId = item.NoteId,
                CompanyId = item.CompanyId,
                UserId = item.UserId,
                Notes = item.Notes,
                CreatedDate = item.CreatedDate,
                UpdatedDate = item.UpdatedDate,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<CompanyNoteDto> CreateCompanyNoteAsync(CompanyNoteDto dto)
        {
            _logger.LogInformation("Creating a new company note.");

            var newItem = new CompanyPlatform.Core.Models.CRM.Company.CompanyNote {
                CompanyId = dto.CompanyId,
                UserId = dto.UserId,
                Notes = dto.Notes,
                CreatedDate = System.DateTime.Now,
                UpdatedDate = null,
                IsDeleted = false
            };

            await _repository.Create(newItem);

            dto.NoteId = newItem.NoteId;
            dto.CreatedDate = newItem.CreatedDate;
            dto.UpdatedDate = newItem.UpdatedDate;
            dto.IsDeleted = newItem.IsDeleted;

            _logger.LogInformation("Successfully created company note with ID: {NoteId}", newItem.NoteId);

            return dto;
        }

        public async Task<bool> UpdateCompanyNoteAsync(int id, CompanyNoteDto dto)
        {
            _logger.LogInformation("Attempting to update company note with ID: {NoteId}", id);

            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsDeleted == true)
            {
                _logger.LogWarning("Update failed. Company Note with ID: {NoteId} not found or is inactive.", id);
                return false;
            }

            itemToUpdate.CompanyId = dto.CompanyId;
            itemToUpdate.UserId = dto.UserId;
            itemToUpdate.Notes = dto.Notes;
            itemToUpdate.UpdatedDate = System.DateTime.Now;

            await _repository.Update(itemToUpdate);

            _logger.LogInformation("Successfully updated company note with ID: {NoteId}", id);

            return true;
        }

        public async Task<bool> DeleteCompanyNoteAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate company note with ID: {NoteId}", id);

            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning("Deactivation failed. Company Note with ID: {NoteId} not found.", id);
                return false;
            }

            itemToDelete.IsDeleted = true;
            itemToDelete.UpdatedDate = System.DateTime.Now;

            await _repository.Update(itemToDelete);

            _logger.LogInformation("Successfully deactivated company note with ID: {NoteId}", id);

            return true;
        }
    }
}