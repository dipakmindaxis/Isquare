using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CompanyProfile;
using CompanyPlatform.Core.Repository;
using CompanyProfileModel =
    CompanyPlatform.Core.Models.CRM.Company.CompanyProfile;

namespace CompanyPlatform.CRM.Services.CompanyProfile
{
    public class CompanyProfileService : ICompanyProfileService
    {
        private readonly IRepositories<CompanyProfileModel> _repository;
        private readonly ILogger<CompanyProfileService> _logger;

        public CompanyProfileService(
            IRepositories<CompanyProfileModel> repository,
            ILogger<CompanyProfileService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        // ENTITY TO DTO
        private static CompanyProfileDto MapToDto(
            CompanyProfileModel item)
        {
            return new CompanyProfileDto
            {
                CompanyProfileId = item.CompanyProfileId,
                CompanyName = item.CompanyName,
                LegalName = item.LegalName,
                GSTIN = item.GSTIN,
                PAN = item.PAN,
                Address = item.Address,
                City = item.City,
                State = item.State,
                PINCode = item.PINCode,
                Country = item.Country,
                Email = item.Email,
                Phone = item.Phone,
                Website = item.Website,
                LogoPath = item.LogoPath,
                BankName = item.BankName,
                AccountHolderName = item.AccountHolderName,
                AccountNumber = item.AccountNumber,
                IFSCCode = item.IFSCCode,
                BranchName = item.BranchName,
                AccountType = item.AccountType,
                IsDefault = item.IsDefault,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        // GET ALL
        public async Task<IEnumerable<CompanyProfileDto>> GetAllAsync()
        {
            _logger.LogInformation("Fetching company profiles.");

            var profiles = await _repository.GetAll();

            return profiles
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.IsDefault)
                .ThenBy(x => x.CompanyName)
                .Select(MapToDto)
                .ToList();
        }

        // GET BY ID
        public async Task<CompanyProfileDto?> GetByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching company profile with ID: {Id}", id);

            var profile = await _repository.GetByIdAsync(id);

            if (profile == null || profile.IsDeleted)
                return null;

            return MapToDto(profile);
        }

        // CREATE
        public async Task<CompanyProfileDto> CreateAsync(
            CompanyProfileDto dto)
        {
            _logger.LogInformation(
                "Creating company profile: {CompanyName}",
                dto.CompanyName);

            Validate(dto);

            var profiles = await _repository.GetAll();

            if (dto.IsDefault &&
                profiles.Any(x => !x.IsDeleted && x.IsDefault))
            {
                throw new InvalidOperationException(
                    "A default company profile already exists. " +
                    "Update the existing profile or change its default status.");
            }

            var profile = new CompanyProfileModel
            {
                CompanyName = dto.CompanyName.Trim(),
                LegalName = dto.LegalName,
                GSTIN = dto.GSTIN,
                PAN = dto.PAN,
                Address = dto.Address,
                City = dto.City,
                State = dto.State,
                PINCode = dto.PINCode,
                Country = dto.Country,
                Email = dto.Email,
                Phone = dto.Phone,
                Website = dto.Website,
                LogoPath = dto.LogoPath,
                BankName = dto.BankName,
                AccountHolderName = dto.AccountHolderName,
                AccountNumber = dto.AccountNumber,
                IFSCCode = dto.IFSCCode,
                BranchName = dto.BranchName,
                AccountType = dto.AccountType,
                IsDefault = dto.IsDefault,
                IsActive = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.Create(profile);

            return MapToDto(profile);
        }

        // UPDATE
        public async Task<bool> UpdateAsync(
            int id, CompanyProfileDto dto)
        {
            _logger.LogInformation(
                "Updating company profile with ID: {Id}", id);

            var profile = await _repository.GetByIdAsync(id);

            if (profile == null || profile.IsDeleted)
                return false;

            Validate(dto);

            var profiles = await _repository.GetAll();

            if (dto.IsDefault &&
                profiles.Any(x =>
                    x.CompanyProfileId != id &&
                    !x.IsDeleted &&
                    x.IsDefault))
            {
                throw new InvalidOperationException(
                    "Another default company profile already exists.");
            }

            profile.CompanyName = dto.CompanyName.Trim();
            profile.LegalName = dto.LegalName;
            profile.GSTIN = dto.GSTIN;
            profile.PAN = dto.PAN;
            profile.Address = dto.Address;
            profile.City = dto.City;
            profile.State = dto.State;
            profile.PINCode = dto.PINCode;
            profile.Country = dto.Country;
            profile.Email = dto.Email;
            profile.Phone = dto.Phone;
            profile.Website = dto.Website;
            profile.LogoPath = dto.LogoPath;
            profile.BankName = dto.BankName;
            profile.AccountHolderName = dto.AccountHolderName;
            profile.AccountNumber = dto.AccountNumber;
            profile.IFSCCode = dto.IFSCCode;
            profile.BranchName = dto.BranchName;
            profile.AccountType = dto.AccountType;
            profile.IsDefault = dto.IsDefault;
            profile.IsActive = dto.IsActive;
            profile.UpdatedAt = DateTime.UtcNow;

            await _repository.Update(profile);

            return true;
        }

        // DELETE - SOFT DELETE
        public async Task<bool> DeleteAsync(int id)
        {
            _logger.LogInformation(
                "Deleting company profile with ID: {Id}", id);

            var profile = await _repository.GetByIdAsync(id);

            if (profile == null || profile.IsDeleted)
                return false;

            if (profile.IsDefault)
            {
                throw new InvalidOperationException(
                    "The default company profile cannot be deleted. " +
                    "Set another profile as default first.");
            }

            profile.IsDeleted = true;
            profile.IsActive = false;
            profile.UpdatedAt = DateTime.UtcNow;

            await _repository.Update(profile);

            return true;
        }

        // VALIDATION
        private static void Validate(CompanyProfileDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyName))
            {
                throw new ArgumentException(
                    "Company name is required.");
            }

            if (!string.IsNullOrWhiteSpace(dto.Email) &&
                !new System.ComponentModel.DataAnnotations
                    .EmailAddressAttribute().IsValid(dto.Email))
            {
                throw new ArgumentException(
                    "Please provide a valid email address.");
            }
        }
    }
}