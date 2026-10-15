using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CustomerArea;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Models.CRM.CustomerArea;

namespace CompanyPlatform.CRM.Services.CustomerArea
{
    public class CustomerAreaService : ICustomerAreaService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.CustomerArea.CustomerArea> _repository;
        private readonly ILogger<CustomerAreaService> _logger;

        private static readonly SemaphoreSlim _codeLock = new SemaphoreSlim(1, 1);

        public CustomerAreaService(
            IRepositories<CompanyPlatform.Core.Models.CRM.CustomerArea.CustomerArea> repository,
            ILogger<CustomerAreaService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        private async Task<string> GenerateNextCustomerAreaCodeAsync()
        {
            await _codeLock.WaitAsync();

            try
            {
                var customerAreas = await _repository.GetAll();

                int maxNumber = 0;

                foreach (var area in customerAreas)
                {
                    if (string.IsNullOrWhiteSpace(area.AreaCode))
                        continue;

                    var code = area.AreaCode.Trim();

                    if (code.StartsWith("AREA_", StringComparison.OrdinalIgnoreCase))
                    {
                        var numPart = code.Substring(5);

                        if (int.TryParse(numPart, out int numVal))
                        {
                            if (numVal > maxNumber)
                            {
                                maxNumber = numVal;
                            }
                        }
                    }
                }

                int nextNumber = maxNumber + 1;

                return $"AREA_{nextNumber:D3}";
            }
            finally
            {
                _codeLock.Release();
            }
        }

        public async Task<IEnumerable<CustomerAreaDto>> GetAllCustomerAreasAsync()
        {
            _logger.LogInformation("Fetching all active Customer Area records.");

            var items = await _repository.GetAll();

            return items
                .Where(x => x.IsDeleted == false)
                .Select(x => new CustomerAreaDto
                {
                    CustomerAreaId = x.CustomerAreaId,
                    AreaName = x.AreaName,
                    AreaCode = x.AreaCode,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<CustomerAreaDto> GetCustomerAreaByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Customer Area by ID: {CustomerAreaId}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning(
                    "Customer Area with ID {CustomerAreaId} not found.",
                    id);

                return null;
            }

            return new CustomerAreaDto
            {
                CustomerAreaId = item.CustomerAreaId,
                AreaName = item.AreaName,
                AreaCode = item.AreaCode,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<CustomerAreaDto> CreateCustomerAreaAsync(
            CustomerAreaDto dto)
        {
            _logger.LogInformation(
                "Creating Customer Area: {AreaName}",
                dto.AreaName);

            string generatedCode =
                await GenerateNextCustomerAreaCodeAsync();

            var customerArea =
                new CompanyPlatform.Core.Models.CRM.CustomerArea.CustomerArea
                {
                    AreaName = dto.AreaName,
                    AreaCode = generatedCode,
                    IsActive = true,
                    IsDeleted = false
                };

            await _repository.Create(customerArea);

            dto.CustomerAreaId = customerArea.CustomerAreaId;
            dto.AreaCode = customerArea.AreaCode;
            dto.IsActive = customerArea.IsActive;
            dto.IsDeleted = customerArea.IsDeleted;

            return dto;
        }

        public async Task<bool> UpdateCustomerAreaAsync(
            int id,
            CustomerAreaDto dto)
        {
            _logger.LogInformation(
                "Updating Customer Area with ID: {CustomerAreaId}",
                id);

            var customerArea =await _repository.GetByIdAsync(id);

            if (customerArea == null || customerArea.IsDeleted)return false;

            customerArea.AreaName = dto.AreaName;

            if (!string.IsNullOrWhiteSpace(dto.AreaCode))
            {
                customerArea.AreaCode = dto.AreaCode;
            }

            customerArea.IsActive = dto.IsActive;

            await _repository.Update(customerArea);

            return true;
        }

        public async Task<bool> DeleteCustomerAreaAsync(int id)
        {
            _logger.LogInformation("Deleting Customer Area with ID: {CustomerAreaId}",id);

            var customerArea =await _repository.GetByIdAsync(id);

            if (customerArea == null)
                return false;

            customerArea.IsDeleted = true;

            await _repository.Update(customerArea);

            return true;
        }
    }
}