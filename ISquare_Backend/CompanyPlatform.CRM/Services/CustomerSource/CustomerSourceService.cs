using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CustomerSource;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Models.CRM.CustomerSource;

namespace CompanyPlatform.CRM.Services.CustomerSource
{
    public class CustomerSourceService : ICustomerSourceService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.CustomerSource.CustomerSource> _repository;
        private readonly ILogger<CustomerSourceService> _logger;

        private static readonly SemaphoreSlim _codeLock = new SemaphoreSlim(1, 1);
         

        public CustomerSourceService(IRepositories<CompanyPlatform.Core.Models.CRM.CustomerSource.CustomerSource> repository,ILogger<CustomerSourceService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        private async Task<string> GenerateNextCustomerSourceCodeAsync()
        {
            await _codeLock.WaitAsync();

            try
            {
                var customerSources = await _repository.GetAll();

                int maxNumber = 0;

                foreach (var source in customerSources)
                {
                    if (string.IsNullOrWhiteSpace(source.SourceCode))
                        continue;

                    var code = source.SourceCode.Trim();

                    if (code.StartsWith("SOURCE_", StringComparison.OrdinalIgnoreCase))
                    {
                        var numPart = code.Substring(7);

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

                return $"SOURCE_{nextNumber:D3}";
            }
            finally
            {
                _codeLock.Release();
            }
        }

        public async Task<IEnumerable<CustomerSourceDto>> GetAllCustomerSourcesAsync()
        {
            _logger.LogInformation("Fetching all active Customer Source records.");

            var items = await _repository.GetAll();

            return items.Where(x => x.IsDeleted == false).Select(x => new CustomerSourceDto
                {
                    CustomerSourceId = x.CustomerSourceId,
                    SourceName = x.SourceName,
                    SourceCode = x.SourceCode,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<CustomerSourceDto> GetCustomerSourceByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Customer Source by ID: {CustomerSourceId}",id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Customer Source with ID {CustomerSourceId} not found.",id);

                return null;
            }

            return new CustomerSourceDto
            {
                CustomerSourceId = item.CustomerSourceId,
                SourceName = item.SourceName,
                SourceCode = item.SourceCode,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<CustomerSourceDto> CreateCustomerSourceAsync(
            CustomerSourceDto dto)
        {
            _logger.LogInformation("Creating Customer Source: {SourceName}",dto.SourceName);

            string generatedCode =await GenerateNextCustomerSourceCodeAsync();

            var customerSource =new CompanyPlatform.Core.Models.CRM.CustomerSource.CustomerSource
                {
                    SourceName = dto.SourceName,
                    SourceCode = generatedCode,
                    IsActive = true,
                    IsDeleted = false
                };

            await _repository.Create(customerSource);

            dto.CustomerSourceId = customerSource.CustomerSourceId;
            dto.SourceCode = customerSource.SourceCode;
            dto.IsActive = customerSource.IsActive;
            dto.IsDeleted = customerSource.IsDeleted;

            return dto;
        }

        public async Task<bool> UpdateCustomerSourceAsync(int id,CustomerSourceDto dto)
        {
            _logger.LogInformation("Updating Customer Source with ID: {CustomerSourceId}",id);

            var customerSource =await _repository.GetByIdAsync(id);

            if (customerSource == null || customerSource.IsDeleted)return false;

            customerSource.SourceName = dto.SourceName;

            if (!string.IsNullOrWhiteSpace(dto.SourceCode))
            {
                customerSource.SourceCode = dto.SourceCode;
            }

            customerSource.IsActive = dto.IsActive;

            await _repository.Update(customerSource);

            return true;
        }

        public async Task<bool> DeleteCustomerSourceAsync(int id)
        {
            _logger.LogInformation("Deleting Customer Source with ID: {CustomerSourceId}",id);

            var customerSource =await _repository.GetByIdAsync(id);

            if (customerSource == null)
                return false;

            customerSource.IsDeleted = true;

            await _repository.Update(customerSource);

            return true;
        }
    }
}