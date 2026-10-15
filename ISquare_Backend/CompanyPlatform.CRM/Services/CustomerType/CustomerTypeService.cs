using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CustomerType;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Repository;

namespace CompanyPlatform.CRM.Services.CustomerType
{
    public class CustomerTypeService : ICustomerTypeService
    {
        private readonly IRepositories<CustomerTypes> _repository;
        private readonly ILogger<CustomerTypeService> _logger;

        public CustomerTypeService(
            IRepositories<CustomerTypes> repository,
            ILogger<CustomerTypeService> logger)
        {
            _repository = repository;
            _logger = logger;
        }


        // ==========================================
        // GET ALL CUSTOMER TYPES
        // ==========================================
        public async Task<IEnumerable<CustomerTypeDto>>
            GetAllCustomerTypesAsync()
        {
            _logger.LogInformation(
                "Fetching all active Customer Types.");

            var items = await _repository.GetAll();

            return items
                .Where(x => x.IsActive)
                .Select(x => new CustomerTypeDto
                {
                    Id = x.Id,
                    CustomerTypeName = x.CustomerTypeName,
                    Description = x.Description,
                    IsActive = x.IsActive
                })
                .ToList();
        }


        // ==========================================
        // GET CUSTOMER TYPE BY ID
        // ==========================================
        public async Task<CustomerTypeDto>
            GetCustomerTypeByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Customer Type by ID: {CustomerTypeId}",
                id);

            var item =
                await _repository.GetByIdAsync(id);

            if (item == null || !item.IsActive)
            {
                _logger.LogWarning(
                    "Customer Type with ID {CustomerTypeId} not found or inactive.",
                    id);

                return null;
            }

            return new CustomerTypeDto
            {
                Id = item.Id,
                CustomerTypeName = item.CustomerTypeName,
                Description = item.Description,
                IsActive = item.IsActive
            };
        }


        // ==========================================
        // CREATE CUSTOMER TYPE
        // ==========================================
        public async Task<CustomerTypeDto>
            CreateCustomerTypeAsync(
                CustomerTypeDto dto)
        {
            _logger.LogInformation(
                "Creating Customer Type: {CustomerTypeName}",
                dto.CustomerTypeName);

            var entity = new CustomerTypes
            {
                CustomerTypeName =
                    dto.CustomerTypeName,

                Description =
                    dto.Description,

                IsActive = true
            };

            await _repository.Create(entity);

            dto.Id = entity.Id;
            dto.IsActive = entity.IsActive;

            _logger.LogInformation(
                "Customer Type created successfully with ID: {CustomerTypeId}",
                entity.Id);

            return dto;
        }


        // ==========================================
        // UPDATE CUSTOMER TYPE
        // ==========================================
        public async Task<bool>
            UpdateCustomerTypeAsync(
                int id,
                CustomerTypeDto dto)
        {
            _logger.LogInformation(
                "Updating Customer Type with ID: {CustomerTypeId}",
                id);

            var entity =
                await _repository.GetByIdAsync(id);

            if (entity == null || !entity.IsActive)
            {
                _logger.LogWarning(
                    "Customer Type with ID {CustomerTypeId} not found or inactive.",
                    id);

                return false;
            }

            entity.CustomerTypeName =
                dto.CustomerTypeName;

            entity.Description =
                dto.Description;

            entity.IsActive =
                dto.IsActive;

            await _repository.Update(entity);

            _logger.LogInformation(
                "Customer Type updated successfully with ID: {CustomerTypeId}",
                id);

            return true;
        }


        // ==========================================
        // DELETE CUSTOMER TYPE
        // ==========================================
        public async Task<bool>
            DeleteCustomerTypeAsync(int id)
        {
            _logger.LogInformation(
                "Attempting to deactivate Customer Type with ID: {CustomerTypeId}",
                id);

            var entity =
                await _repository.GetByIdAsync(id);

            if (entity == null)
            {
                _logger.LogWarning(
                    "Customer Type with ID {CustomerTypeId} not found.",
                    id);

                return false;
            }

            // Soft Delete
            entity.IsActive = false;

            await _repository.Update(entity);

            _logger.LogInformation(
                "Customer Type deactivated successfully with ID: {CustomerTypeId}",
                id);

            return true;
        }
    }
}