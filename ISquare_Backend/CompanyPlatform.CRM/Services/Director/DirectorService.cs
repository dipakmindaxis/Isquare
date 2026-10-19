using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Director;
using DirectorEntity = CompanyPlatform.Core.Models.CRM.Director.Director;

using CompanyPlatform.Core.Repository;

namespace CompanyPlatform.CRM.Services.Director
{
    public class DirectorService : IDirectorService
    {
        private readonly IRepositories<DirectorEntity> _repository;
        private readonly ILogger<DirectorService> _logger;

        private static readonly SemaphoreSlim _codeLock =
            new SemaphoreSlim(1, 1);

        public DirectorService(
            IRepositories<DirectorEntity> repository,
            ILogger<DirectorService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        private async Task<string> GenerateNextDirectorCodeAsync()
        {
            await _codeLock.WaitAsync();

            try
            {
                var directors = await _repository.GetAll();

                int maxNumber = 0;

                foreach (var director in directors)
                {
                    if (string.IsNullOrWhiteSpace(director.DirectorCode))
                        continue;

                    string code = director.DirectorCode.Trim();

                    if (code.StartsWith(
                        "DIRECTOR_",
                        StringComparison.OrdinalIgnoreCase))
                    {
                        string numberPart = code.Substring(9);

                        if (int.TryParse(numberPart, out int number))
                        {
                            if (number > maxNumber)
                                maxNumber = number;
                        }
                    }
                }

                return $"DIRECTOR_{maxNumber + 1:D3}";
            }
            finally
            {
                _codeLock.Release();
            }
        }

        public async Task<IEnumerable<DirectorDto>> GetAllDirectorsAsync()
        {
            _logger.LogInformation("Fetching all Director records.");

            var directors = await _repository.GetAll();

            return directors
                .Where(x => !x.IsDeleted)
                .Select(x => new DirectorDto
                {
                    DirectorId = x.DirectorId,
                    DirectorName = x.DirectorName,
                    DirectorCode = x.DirectorCode,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                })
                .ToList();
        }

        public async Task<DirectorDto?> GetDirectorByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Director with ID: {DirectorId}", id);

            var director = await _repository.GetByIdAsync(id);

            if (director == null || director.IsDeleted)
            {
                _logger.LogWarning(
                    "Director with ID {DirectorId} not found.", id);

                return null;
            }

            return new DirectorDto
            {
                DirectorId = director.DirectorId,
                DirectorName = director.DirectorName,
                DirectorCode = director.DirectorCode,
                IsActive = director.IsActive,
                IsDeleted = director.IsDeleted
            };
        }

        public async Task<DirectorDto> CreateDirectorAsync(DirectorDto dto)
        {
            _logger.LogInformation(
                "Creating Director: {DirectorName}", dto.DirectorName);

            string generatedCode = await GenerateNextDirectorCodeAsync();

            var director = new DirectorEntity
            {
                DirectorName = dto.DirectorName.Trim(),
                DirectorCode = generatedCode,
                IsActive = true,
                IsDeleted = false,
                CreatedDate = DateTime.UtcNow
            };

            await _repository.Create(director);

            return new DirectorDto
            {
                DirectorId = director.DirectorId,
                DirectorName = director.DirectorName,
                DirectorCode = director.DirectorCode,
                IsActive = director.IsActive,
                IsDeleted = director.IsDeleted
            };
        }

        public async Task<bool> UpdateDirectorAsync(
            int id,
            DirectorDto dto)
        {
            _logger.LogInformation(
                "Updating Director with ID: {DirectorId}", id);

            var director = await _repository.GetByIdAsync(id);

            if (director == null || director.IsDeleted)
                return false;

            director.DirectorName = dto.DirectorName.Trim();
            director.IsActive = dto.IsActive;
            director.UpdatedDate = DateTime.UtcNow;

            // DirectorCode is generated automatically and remains unchanged.

            await _repository.Update(director);

            return true;
        }

        public async Task<bool> DeleteDirectorAsync(int id)
        {
            _logger.LogInformation(
                "Deleting Director with ID: {DirectorId}", id);

            var director = await _repository.GetByIdAsync(id);

            if (director == null || director.IsDeleted)
                return false;

            director.IsDeleted = true;
            director.UpdatedDate = DateTime.UtcNow;

            await _repository.Update(director);

            return true;
        }
    }
}