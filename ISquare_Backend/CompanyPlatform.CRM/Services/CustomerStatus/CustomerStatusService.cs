using CompanyPlatform.CRM.DTO.CustomerStatus;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Repository;
using Microsoft.Extensions.Logging;

using CustomerStatusModel =
    CompanyPlatform.Core.Models.CRM.Company.CustomerStatus;
using CompanyPlatform.CRM.Services.CustomerStatus;

    public class CustomerStatusService : ICustomerStatusService
    {
        private readonly IRepositories<CustomerStatus> _repository;
        private readonly ILogger<CustomerStatusService> _logger;

        public CustomerStatusService(
            IRepositories<CustomerStatus> repository,
            ILogger<CustomerStatusService> logger)
        {
            _repository = repository;
            _logger = logger;
        }


        // ==========================================
        // GENERATE NEXT STATUS CODE
        // ==========================================
        private async Task<string> GenerateNextStatusCodeAsync()
        {
            var statuses = await _repository.GetAll();

            int maxNumber = 0;

            foreach (var status in statuses)
            {
                if (string.IsNullOrWhiteSpace(status.StatusCode))
                    continue;

                var code = status.StatusCode.Trim();

                if (code.StartsWith(
                    "STATUS_",
                    StringComparison.OrdinalIgnoreCase))
                {
                    var numberPart =
                        code.Substring("STATUS_".Length);

                    if (int.TryParse(
                        numberPart,
                        out int number))
                    {
                        if (number > maxNumber)
                        {
                            maxNumber = number;
                        }
                    }
                }
            }

            int nextNumber = maxNumber + 1;

            return $"STATUS_{nextNumber:D3}";
        }


        // ==========================================
        // GET ALL
        // ==========================================
        public async Task<IEnumerable<CustomerStatusDto>>
            GetAllCustomerStatusesAsync()
        {
            _logger.LogInformation(
                "Fetching all active customer statuses.");

            var statuses =
                await _repository.GetAll();

            return statuses
                .Where(x =>
                    !x.IsDeleted &&
                    x.IsActive)
                .Select(x => new CustomerStatusDto
                {
                    CustomerStatusId =
                        x.CustomerStatusId,

                    StatusName =
                        x.StatusName,

                    Description =
                        x.Description,

                    StatusCode =
                        x.StatusCode,

                    IsActive =
                        x.IsActive,

                    IsDeleted =
                        x.IsDeleted
                })
                .ToList();
        }


        // ==========================================
        // GET BY ID
        // ==========================================
        public async Task<CustomerStatusDto>
            GetCustomerStatusByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Customer Status with ID: {CustomerStatusId}",
                id);

            var status =
                await _repository.GetByIdAsync(id);

            if (status == null ||
                status.IsDeleted)
            {
                _logger.LogWarning(
                    "Customer Status with ID {CustomerStatusId} not found.",
                    id);

                return null;
            }

            return new CustomerStatusDto
            {
                CustomerStatusId =
                    status.CustomerStatusId,

                StatusName =
                    status.StatusName,

                Description =
                    status.Description,

                StatusCode =
                    status.StatusCode,

                IsActive =
                    status.IsActive,

                IsDeleted =
                    status.IsDeleted
            };
        }


        // ==========================================
        // CREATE
        // ==========================================
        public async Task<CustomerStatusDto>
            CreateCustomerStatusAsync(
                CustomerStatusDto dto)
        {
            _logger.LogInformation(
                "Creating Customer Status: {StatusName}",
                dto.StatusName);

            string generatedCode =
                await GenerateNextStatusCodeAsync();

            var status = new CustomerStatus
            {
                StatusName =
                    dto.StatusName,

                Description =
                    dto.Description,

                StatusCode =
                    generatedCode,

                IsActive = true,

                IsDeleted = false
            };

            await _repository.Create(status);

            dto.CustomerStatusId =
                status.CustomerStatusId;

            dto.StatusCode =
                status.StatusCode;

            dto.IsActive =
                status.IsActive;

            dto.IsDeleted =
                status.IsDeleted;

            return dto;
        }


        // ==========================================
        // UPDATE
        // ==========================================
        public async Task<bool>
            UpdateCustomerStatusAsync(
                int id,
                CustomerStatusDto dto)
        {
            _logger.LogInformation(
                "Updating Customer Status with ID: {CustomerStatusId}",
                id);

            var status =
                await _repository.GetByIdAsync(id);

            if (status == null ||
                status.IsDeleted)
            {
                return false;
            }

            status.StatusName =
                dto.StatusName;

            status.Description =
                dto.Description;

            // Allow Active / Inactive
            status.IsActive =
                dto.IsActive;

            // Do NOT change StatusCode
            await _repository.Update(status);

            return true;
        }


        // ==========================================
        // DELETE
        // ==========================================
        public async Task<bool>
            DeleteCustomerStatusAsync(int id)
        {
            _logger.LogInformation(
                "Deleting Customer Status with ID: {CustomerStatusId}",
                id);

            var status =
                await _repository.GetByIdAsync(id);

            if (status == null ||
                status.IsDeleted)
            {
                return false;
            }

            // Soft Delete
            status.IsDeleted = true;

            await _repository.Update(status);

            return true;
        }
    }
