using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.SalesCoordinator;
using CompanyPlatform.Core.Repository;
using SalesCoordinatorEntity =
    CompanyPlatform.Core.Models.CRM.SalesCoordinator.SalesCoordinator;

namespace CompanyPlatform.CRM.Services.SalesCoordinator
{
    public class SalesCoordinatorService : ISalesCoordinatorService
    {
        private readonly IRepositories<SalesCoordinatorEntity> _repository;
        private readonly ILogger<SalesCoordinatorService> _logger;

        private static readonly SemaphoreSlim _codeLock =
            new SemaphoreSlim(1, 1);

        public SalesCoordinatorService(
            IRepositories<SalesCoordinatorEntity> repository,
            ILogger<SalesCoordinatorService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        private async Task<string> GenerateNextSalesCoordinatorCodeAsync()
        {
            await _codeLock.WaitAsync();

            try
            {
                var coordinators = await _repository.GetAll();
                const string prefix = "SC_";

                int maxNumber = 0;

                foreach (var coordinator in coordinators)
                {
                    if (string.IsNullOrWhiteSpace(
                        coordinator.SalesCoordinatorCode))
                    {
                        continue;
                    }

                    string code = coordinator.SalesCoordinatorCode.Trim();

                    if (code.StartsWith(
                        prefix,
                        StringComparison.OrdinalIgnoreCase))
                    {
                        string numberPart = code.Substring(prefix.Length);

                        if (int.TryParse(numberPart, out int number))
                        {
                            if (number > maxNumber)
                            {
                                maxNumber = number;
                            }
                        }
                    }
                }

                return $"{prefix}{maxNumber + 1:D3}";
            }
            finally
            {
                _codeLock.Release();
            }
        }

        public async Task<IEnumerable<SalesCoordinatorDto>>
            GetAllSalesCoordinatorsAsync()
        {
            _logger.LogInformation(
                "Fetching all Sales Coordinator records.");

            var coordinators = await _repository.GetAll();

            return coordinators
                .Where(x => !x.IsDeleted)
                .Select(x => new SalesCoordinatorDto
                {
                    SalesCoordinatorId = x.SalesCoordinatorId,
                    SalesCoordinatorName = x.SalesCoordinatorName,
                    SalesCoordinatorCode = x.SalesCoordinatorCode,
                    BDEUserId = x.BDEUserId,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                })
                .ToList();
        }

        public async Task<IEnumerable<SalesCoordinatorDto>>
            GetActiveSalesCoordinatorsAsync()
        {
            _logger.LogInformation(
                "Fetching active Sales Coordinator records.");

            var coordinators = await _repository.GetAll();

            return coordinators
                .Where(x => !x.IsDeleted && x.IsActive)
                .Select(x => new SalesCoordinatorDto
                {
                    SalesCoordinatorId = x.SalesCoordinatorId,
                    SalesCoordinatorName = x.SalesCoordinatorName,
                    SalesCoordinatorCode = x.SalesCoordinatorCode,
                    BDEUserId = x.BDEUserId,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                })
                .ToList();
        }

        public async Task<SalesCoordinatorDto?>
            GetSalesCoordinatorByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Sales Coordinator with ID: {Id}", id);

            var coordinator = await _repository.GetByIdAsync(id);

            if (coordinator == null || coordinator.IsDeleted)
            {
                _logger.LogWarning(
                    "Sales Coordinator with ID {Id} not found.", id);

                return null;
            }

            return new SalesCoordinatorDto
            {
                SalesCoordinatorId = coordinator.SalesCoordinatorId,
                SalesCoordinatorName = coordinator.SalesCoordinatorName,
                SalesCoordinatorCode = coordinator.SalesCoordinatorCode,
                BDEUserId = coordinator.BDEUserId,
                IsActive = coordinator.IsActive,
                IsDeleted = coordinator.IsDeleted
            };
        }

        public async Task<SalesCoordinatorDto>
            CreateSalesCoordinatorAsync(SalesCoordinatorDto dto)
        {
            _logger.LogInformation(
                "Creating Sales Coordinator: {Name}",
                dto.SalesCoordinatorName);

            string generatedCode =
                await GenerateNextSalesCoordinatorCodeAsync();

            var coordinator = new SalesCoordinatorEntity
            {
                SalesCoordinatorName = dto.SalesCoordinatorName.Trim(),
                SalesCoordinatorCode = generatedCode,
                BDEUserId = dto.BDEUserId,
                IsActive = dto.IsActive,
                IsDeleted = false,
                CreatedDate = DateTime.UtcNow
            };

            await _repository.Create(coordinator);

            return new SalesCoordinatorDto
            {
                SalesCoordinatorId = coordinator.SalesCoordinatorId,
                SalesCoordinatorName = coordinator.SalesCoordinatorName,
                SalesCoordinatorCode = coordinator.SalesCoordinatorCode,
                BDEUserId = coordinator.BDEUserId,
                IsActive = coordinator.IsActive,
                IsDeleted = coordinator.IsDeleted
            };
        }

        public async Task<bool> UpdateSalesCoordinatorAsync(
            int id,
            SalesCoordinatorDto dto)
        {
            _logger.LogInformation(
                "Updating Sales Coordinator with ID: {Id}", id);

            var coordinator = await _repository.GetByIdAsync(id);

            if (coordinator == null || coordinator.IsDeleted)
            {
                return false;
            }

            coordinator.SalesCoordinatorName =
                dto.SalesCoordinatorName.Trim();

            coordinator.BDEUserId = dto.BDEUserId;
            coordinator.IsActive = dto.IsActive;
            coordinator.UpdatedDate = DateTime.UtcNow;

            // Keep the generated coordinator code unchanged.
            await _repository.Update(coordinator);

            return true;
        }

        public async Task<IEnumerable<SalesCoordinatorDto>>
            GetSalesCoordinatorsByBDEUserIdAsync(int bdeUserId)
        {
            _logger.LogInformation(
                "Fetching Sales Coordinators for BDE User ID: {BDEUserId}",
                bdeUserId);

            var coordinators = await _repository.GetAll();

            return coordinators
                .Where(x =>
                    x.BDEUserId == bdeUserId &&
                    x.IsActive &&
                    !x.IsDeleted)
                .Select(x => new SalesCoordinatorDto
                {
                    SalesCoordinatorId = x.SalesCoordinatorId,
                    SalesCoordinatorName = x.SalesCoordinatorName,
                    SalesCoordinatorCode = x.SalesCoordinatorCode,
                    BDEUserId = x.BDEUserId,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                })
                .ToList();
        }

        public async Task<bool> DeleteSalesCoordinatorAsync(int id)
        {
            _logger.LogInformation(
                "Deleting Sales Coordinator with ID: {Id}", id);

            var coordinator = await _repository.GetByIdAsync(id);

            if (coordinator == null || coordinator.IsDeleted)
            {
                return false;
            }

            coordinator.IsDeleted = true;
            coordinator.UpdatedDate = DateTime.UtcNow;

            await _repository.Update(coordinator);

            return true;
        }
    }
}