using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.CompanyCategory;
using Microsoft.Extensions.Logging;

using CustomerCategoryModel =
    CompanyPlatform.Core.Models.CRM.Company.CustomerCategory;

namespace CompanyPlatform.CRM.Services.CustomerCategory
{
    public class CustomerCategoryService : ICustomerCategoryService
    {
        private readonly IRepositories<CustomerCategoryModel> _repository;
        private readonly ILogger<CustomerCategoryService> _logger;

        public CustomerCategoryService(IRepositories<CustomerCategoryModel> repository, ILogger<CustomerCategoryService> logger)
        {
            _repository = repository;
            _logger = logger;
        }
        private async Task<string> GenerateNextCategoryCodeAsync()
        {
            var categories = await _repository.GetAll();
            int maxNumber = 0;
            foreach (var category in categories)
            {
                if (string.IsNullOrWhiteSpace(category.CategoryCode))
                    continue;
                var code = category.CategoryCode.Trim();
                if (code.StartsWith("CATEGORY_", StringComparison.OrdinalIgnoreCase))
                {
                    var numberPart = code.Substring("CATEGORY_".Length);
                    if (int.TryParse(numberPart, out int number))
                    {
                        if (number > maxNumber)
                        {
                            maxNumber = number;
                        }
                    }
                }
            }

            int nextNumber = maxNumber + 1;
            return $"CATEGORY_{nextNumber:D3}";
        }


        public async Task<IEnumerable<CustomerCategoryDto>>
            GetAllCustomerCategoriesAsync()
        {
            _logger.LogInformation(
                "Fetching all active customer categories.");

            var categories = await _repository.GetAll();

            return categories
                .Where(x => !x.IsDeleted)
                .Select(x => new CustomerCategoryDto
                {
                    CustomerCategoryId = x.CustomerCategoryId,

                    CategoryName = x.CategoryName,

                    CategoryCode = x.CategoryCode,

                    IsActive = x.IsActive,

                    IsDeleted = x.IsDeleted
                })
                .ToList();
        }


        public async Task<CustomerCategoryDto?>
            GetCustomerCategoryByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Customer Category with ID: {Id}",
                id);

            var category =
                await _repository.GetByIdAsync(id);

            if (category == null || category.IsDeleted)
            {
                _logger.LogWarning(
                    "Customer Category with ID {Id} not found.",
                    id);

                return null;
            }

            return new CustomerCategoryDto
            {
                CustomerCategoryId =
                    category.CustomerCategoryId,

                CategoryName =
                    category.CategoryName,

                CategoryCode =
                    category.CategoryCode,

                IsActive =
                    category.IsActive,

                IsDeleted =
                    category.IsDeleted
            };
        }


        public async Task<CustomerCategoryDto>
            CreateCustomerCategoryAsync(
                CustomerCategoryDto dto)
        {
            _logger.LogInformation(
                "Creating Customer Category: {CategoryName}",
                dto.CategoryName);

            // Generate code automatically
            var generatedCode =
                await GenerateNextCategoryCodeAsync();

            var category =
                new CustomerCategoryModel
                {
                    CategoryName =
                        dto.CategoryName,

                    CategoryCode =
                        generatedCode,

                    IsActive = true,

                    IsDeleted = false
                };

            await _repository.Create(category);

            // Return generated values
            dto.CustomerCategoryId =
                category.CustomerCategoryId;

            dto.CategoryCode =
                category.CategoryCode;

            dto.IsActive =
                category.IsActive;

            dto.IsDeleted =
                category.IsDeleted;

            return dto;
        }


        public async Task<bool>
            UpdateCustomerCategoryAsync(
                int id,
                CustomerCategoryDto dto)
        {
            _logger.LogInformation(
                "Updating Customer Category with ID: {Id}",
                id);

            var category =
                await _repository.GetByIdAsync(id);

            if (category == null || category.IsDeleted)
            {
                return false;
            }

            // Update name
            category.CategoryName =
                dto.CategoryName;

            // Update Active / Inactive status
            category.IsActive =
                dto.IsActive;

            // CategoryCode is intentionally NOT changed
            await _repository.Update(category);

            return true;
        }


        public async Task<bool>
            DeleteCustomerCategoryAsync(int id)
        {
            _logger.LogInformation(
                "Deleting Customer Category with ID: {Id}",
                id);

            var category =
                await _repository.GetByIdAsync(id);

            if (category == null || category.IsDeleted)
            {
                return false;
            }

            // Soft Delete
            category.IsDeleted = true;

            await _repository.Update(category);

            return true;
        }
    }
}