using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.DTO.Customer;
using CompanyPlatform.CRM.DTO.Company;
using CompanyPlatform.CRM.Services.Company;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Models.CRM;

using CompanyModel = CompanyPlatform.Core.Models.CRM.Company.Company;
using CompanyAddressModel = CompanyPlatform.Core.Models.CRM.Company.CompanyAddress;
using EmployeeModel = CompanyPlatform.Core.Models.CRM.Company.Employee;
using BDEUserModel = CompanyPlatform.Core.Models.CRM.BDEUser;
using IndustryModel = CompanyPlatform.Core.Models.CRM.Company.Industry;
using CustomerStatusModel = CompanyPlatform.Core.Models.CRM.Company.CustomerStatus;
using CustomerSourceModel = CompanyPlatform.Core.Models.CRM.CustomerSource.CustomerSource;
using CustomerAreaModel = CompanyPlatform.Core.Models.CRM.CustomerArea.CustomerArea;
using PaymentTermModel = CompanyPlatform.Core.Models.CRM.PaymentTerm.PaymentTerm;
using StateModel = CompanyPlatform.Core.Models.CRM.Company.State;
using CountryModel = CompanyPlatform.Core.Models.CRM.Company.Country;
using CityModel = CompanyPlatform.Core.Models.CRM.Company.City;

namespace CompanyPlatform.CRM.Services.Customer
{
#pragma warning disable CS0618 // Type or member is obsolete
    public class CustomerService : ICustomerService, ICompanyService
#pragma warning restore CS0618
    {
        private readonly IRepositories<CompanyModel> _repository;
        private readonly IRepositories<CompanyAddressModel> _addressRepository;
        private readonly IRepositories<EmployeeModel> _employeeRepository;
        private readonly IRepositories<BDEUserModel> _bdeUserRepository;
        private readonly IRepositories<StateModel> _stateRepository;
        private readonly IRepositories<CountryModel> _countryRepository;
        private readonly IRepositories<CityModel> _cityRepository;
        private readonly IRepositories<IndustryModel> _industryRepository;
        private readonly IRepositories<CustomerStatusModel> _statusRepository;
        private readonly IRepositories<CustomerSourceModel> _sourceRepository;
        private readonly IRepositories<CustomerAreaModel> _areaRepository;
        private readonly IRepositories<PaymentTermModel> _paymentTermRepository;
        private readonly ILogger<CustomerService> _logger;
        private static readonly SemaphoreSlim _codeLock = new SemaphoreSlim(1, 1);

        public CustomerService(
            IRepositories<CompanyModel> repository,
            IRepositories<CompanyAddressModel> addressRepository,
            IRepositories<EmployeeModel> employeeRepository,
            IRepositories<BDEUserModel> bdeUserRepository,
            IRepositories<StateModel> stateRepository,
            IRepositories<CountryModel> countryRepository,
            IRepositories<CityModel> cityRepository,
            IRepositories<IndustryModel> industryRepository,
            IRepositories<CustomerStatusModel> statusRepository,
            IRepositories<CustomerSourceModel> sourceRepository,
            IRepositories<CustomerAreaModel> areaRepository,
            IRepositories<PaymentTermModel> paymentTermRepository,
            ILogger<CustomerService> logger)
        {
            _repository = repository;
            _addressRepository = addressRepository;
            _employeeRepository = employeeRepository;
            _bdeUserRepository = bdeUserRepository;
            _stateRepository = stateRepository;
            _countryRepository = countryRepository;
            _cityRepository = cityRepository;
            _industryRepository = industryRepository;
            _statusRepository = statusRepository;
            _sourceRepository = sourceRepository;
            _areaRepository = areaRepository;
            _paymentTermRepository = paymentTermRepository;
            _logger = logger;
        }

        public async Task<string> GetNextCustomerCodeAsync()
        {
            await _codeLock.WaitAsync();
            try
            {
                return await GenerateNextCustomerCodeInternalAsync();
            }
            finally
            {
                _codeLock.Release();
            }
        }

        private async Task<string> GenerateNextCustomerCodeInternalAsync()
        {
            var companies = (await _repository.GetAll()).ToList();
            int maxNumber = 0;
            var existingCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var c in companies)
            {
                if (string.IsNullOrWhiteSpace(c.CompanyCode))
                    continue;

                var code = c.CompanyCode.Trim();
                existingCodes.Add(code);

                // Match patterns like CUST001, CUST-001, CMP#001, etc.
                var match = System.Text.RegularExpressions.Regex.Match(
                    code,
                    @"^(?:CUST-?|CMP#?)(\d+)$",
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase
                );

                if (match.Success && int.TryParse(match.Groups[1].Value, out int numVal))
                {
                    if (numVal > maxNumber)
                    {
                        maxNumber = numVal;
                    }
                }
                else
                {
                    // Fallback: check if the string contains any digits
                    var digitsMatch = System.Text.RegularExpressions.Regex.Match(code, @"\d+");
                    if (digitsMatch.Success && int.TryParse(digitsMatch.Value, out int fallbackNum))
                    {
                        if (fallbackNum > maxNumber)
                        {
                            maxNumber = fallbackNum;
                        }
                    }
                }
            }

            int nextNumber = maxNumber + 1;
            string candidateCode = $"CUST{nextNumber:D3}";

            // Ensure candidate code does not collide with any existing code
            while (existingCodes.Contains(candidateCode))
            {
                nextNumber++;
                candidateCode = $"CUST{nextNumber:D3}";
            }

            return candidateCode;
        }

        private async Task<(int countryId, int stateId, int cityId)> EnsureDefaultLocationMastersAsync(
            List<CountryModel> validCountries,
            List<StateModel> validStates,
            List<CityModel> validCities)
        {
            if (!validCountries.Any())
            {
                var defaultCountry = new CountryModel
                {
                    CountryName = "India",
                    CountryCode = "IN",
                    ISOCode = "IND",
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow
                };
                await _countryRepository.Create(defaultCountry);
                validCountries.Add(defaultCountry);
            }

            int countryId = validCountries.First().CountryId;

            if (!validStates.Any(s => s.CountryId == countryId))
            {
                var defaultState = new StateModel
                {
                    CountryId = countryId,
                    StateName = "Maharashtra",
                    StateCode = "MH",
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow
                };
                await _stateRepository.Create(defaultState);
                validStates.Add(defaultState);
            }

            int stateId = validStates.First(s => s.CountryId == countryId).StateId;

            if (!validCities.Any(c => c.StateId == stateId))
            {
                var defaultCity = new CityModel
                {
                    StateId = stateId,
                    CityName = "Mumbai",
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow
                };
                await _cityRepository.Create(defaultCity);
                validCities.Add(defaultCity);
            }

            int cityId = validCities.First(c => c.StateId == stateId).CityId;

            return (countryId, stateId, cityId);
        }

        public async Task<IEnumerable<CustomerDto>> GetAllCustomersAsync()
        {
            _logger.LogInformation("Fetching all active customers.");

            var items = (await _repository.GetAll()).Where(c => !c.IsDeleted).ToList();
            var states = (await _stateRepository.GetAll()).ToList();
            var countries = (await _countryRepository.GetAll()).ToList();
            var cities = (await _cityRepository.GetAll()).ToList();
            var industries = (await _industryRepository.GetAll()).ToList();
            var statuses = (await _statusRepository.GetAll()).ToList();
            var sources = (await _sourceRepository.GetAll()).ToList();
            var areas = (await _areaRepository.GetAll()).ToList();
            var paymentTerms = (await _paymentTermRepository.GetAll()).ToList();
            var employees = (await _employeeRepository.GetAll()).ToList();
            var bdeUsers = (await _bdeUserRepository.GetAll()).ToList();
            var addresses = (await _addressRepository.GetAll()).Where(a => !a.IsDeleted).ToList();

            return items.Select(c => MapToCustomerDto(c, states, countries, cities, industries, statuses, sources, areas, paymentTerms, employees, bdeUsers, addresses));
        }

        public async Task<CustomerDto?> GetCustomerByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Customer with ID: {CustomerId}", id);

            var item = await _repository.GetByIdAsync(id);
            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Customer with ID {CustomerId} not found or deleted.", id);
                return null;
            }

            var states = (await _stateRepository.GetAll()).ToList();
            var countries = (await _countryRepository.GetAll()).ToList();
            var cities = (await _cityRepository.GetAll()).ToList();
            var industries = (await _industryRepository.GetAll()).ToList();
            var statuses = (await _statusRepository.GetAll()).ToList();
            var sources = (await _sourceRepository.GetAll()).ToList();
            var areas = (await _areaRepository.GetAll()).ToList();
            var paymentTerms = (await _paymentTermRepository.GetAll()).ToList();
            var employees = (await _employeeRepository.GetAll()).ToList();
            var bdeUsers = (await _bdeUserRepository.GetAll()).ToList();
            var addresses = (await _addressRepository.FindByCondition(a => a.CompanyId == id && !a.IsDeleted)).ToList();

            return MapToCustomerDto(item, states, countries, cities, industries, statuses, sources, areas, paymentTerms, employees, bdeUsers, addresses);
        }

        public async Task<CustomerDto> CreateCustomerAsync(CustomerCreateDto dto)
        {
            _logger.LogInformation("Creating Customer: {CustomerName}", dto.CustomerName);

            await _codeLock.WaitAsync();
            try
            {
                var companies = (await _repository.GetAll()).ToList();
                var existingCodes = new HashSet<string>(
                    companies.Where(c => !string.IsNullOrWhiteSpace(c.CompanyCode))
                             .Select(c => c.CompanyCode.Trim()),
                    StringComparer.OrdinalIgnoreCase
                );

                string code;
                if (!string.IsNullOrWhiteSpace(dto.CustomerCode) && !existingCodes.Contains(dto.CustomerCode.Trim()))
                {
                    code = dto.CustomerCode.Trim();
                }
                else
                {
                    code = await GenerateNextCustomerCodeInternalAsync();
                }

                // Sanitize Foreign Keys against tbl_Employee and master tables to prevent FK constraint crashes
                var employees = (await _employeeRepository.GetAll()).ToList();
                var validEmployeeIds = new HashSet<int>(employees.Where(e => !e.IsDeleted).Select(e => e.ID));
                var allBdes = (await _bdeUserRepository.GetAll()).ToList();

                int? validDirectorId = null;
                if (dto.DirectorId.HasValue && dto.DirectorId.Value > 0)
                {
                    if (validEmployeeIds.Contains(dto.DirectorId.Value))
                    {
                        validDirectorId = dto.DirectorId.Value;
                    }
                    else if (!string.IsNullOrWhiteSpace(dto.DirectorName))
                    {
                        var matchedDir = employees.FirstOrDefault(e => !e.IsDeleted &&
                            (e.FirstName + " " + e.LastName).Trim().Equals(dto.DirectorName.Trim(), StringComparison.OrdinalIgnoreCase));
                        if (matchedDir != null) validDirectorId = matchedDir.ID;
                    }
                }

                int? validBdeUserId = null;
                if (dto.BDEUserId.HasValue && dto.BDEUserId.Value > 0)
                {
                    if (validEmployeeIds.Contains(dto.BDEUserId.Value))
                    {
                        validBdeUserId = dto.BDEUserId.Value;
                    }
                    else
                    {
                        var bdeUserRec = allBdes.FirstOrDefault(b => b.ID == dto.BDEUserId.Value);
                        string targetName = dto.BDEUserName ?? bdeUserRec?.Value ?? "";
                        if (!string.IsNullOrWhiteSpace(targetName))
                        {
                            var matchedEmp = employees.FirstOrDefault(e => !e.IsDeleted &&
                                ((e.FirstName + " " + e.LastName).Trim().Equals(targetName.Trim(), StringComparison.OrdinalIgnoreCase) ||
                                 (e.FirstName ?? "").Trim().Equals(targetName.Trim(), StringComparison.OrdinalIgnoreCase)));
                            if (matchedEmp != null) validBdeUserId = matchedEmp.ID;
                        }
                    }
                }

                int? validSalesCoordinatorId = null;
                if (dto.SalesCoordinatorId.HasValue && dto.SalesCoordinatorId.Value > 0)
                {
                    if (validEmployeeIds.Contains(dto.SalesCoordinatorId.Value))
                    {
                        validSalesCoordinatorId = dto.SalesCoordinatorId.Value;
                    }
                    else if (!string.IsNullOrWhiteSpace(dto.SalesCoordinatorName))
                    {
                        var matchedSc = employees.FirstOrDefault(e => !e.IsDeleted &&
                            ((e.FirstName + " " + e.LastName).Trim().Equals(dto.SalesCoordinatorName.Trim(), StringComparison.OrdinalIgnoreCase) ||
                             (e.FirstName ?? "").Trim().Equals(dto.SalesCoordinatorName.Trim(), StringComparison.OrdinalIgnoreCase)));
                        if (matchedSc != null) validSalesCoordinatorId = matchedSc.ID;
                    }
                }

                int? validCustomerOwnerId = null;
                if (dto.CustomerOwnerId.HasValue && dto.CustomerOwnerId.Value > 0 && validEmployeeIds.Contains(dto.CustomerOwnerId.Value))
                {
                    validCustomerOwnerId = dto.CustomerOwnerId.Value;
                }

                var industries = (await _industryRepository.GetAll()).ToList();
                int? validIndustryId = (dto.IndustryId.HasValue && dto.IndustryId.Value > 0 && industries.Any(i => i.IndustryId == dto.IndustryId.Value)) ? dto.IndustryId.Value : null;

                var statuses = (await _statusRepository.GetAll()).ToList();
                int? validStatusId = (dto.CustomerStatusId.HasValue && dto.CustomerStatusId.Value > 0 && statuses.Any(s => s.CustomerStatusId == dto.CustomerStatusId.Value)) ? dto.CustomerStatusId.Value : null;

                var sources = (await _sourceRepository.GetAll()).ToList();
                int? validSourceId = (dto.CustomerSourceId.HasValue && dto.CustomerSourceId.Value > 0 && sources.Any(s => s.CustomerSourceId == dto.CustomerSourceId.Value)) ? dto.CustomerSourceId.Value : null;

                var areas = (await _areaRepository.GetAll()).ToList();
                int? validAreaId = (dto.CustomerAreaId.HasValue && dto.CustomerAreaId.Value > 0 && areas.Any(a => a.CustomerAreaId == dto.CustomerAreaId.Value)) ? dto.CustomerAreaId.Value : null;

                var paymentTerms = (await _paymentTermRepository.GetAll()).ToList();
                int? pTermId = dto.PaymentTermsId ?? dto.PaymentTermId;
                int? validPaymentTermsId = (pTermId.HasValue && pTermId.Value > 0 && paymentTerms.Any(p => p.PaymentTermId == pTermId.Value)) ? pTermId.Value : null;

            var entity = new CompanyModel
            {
                CompanyCode = code,
                CompanyName = !string.IsNullOrWhiteSpace(dto.CompanyName) ? dto.CompanyName : dto.CustomerName,
                CustomerName = dto.CustomerName,
                CustomerShortName = dto.CustomerShortName,
                CompanyGroup = dto.CompanyGroup,
                PlantCode = dto.PlantCode,

                IndustryId = validIndustryId,
                CompanyStatusId = validStatusId,
                CustomerSourceId = validSourceId,
                CustomerAreaId = validAreaId,
                PaymentTermsId = validPaymentTermsId,

                PAN = dto.PAN,
                TAN = dto.TAN,
                GSTIN = dto.GSTIN,
                CIN = dto.CIN,
                MSMENumber = dto.MSMENumber,

                DirectorId = validDirectorId,
                BDEUserId = validBdeUserId,
                SalesCoordinatorId = validSalesCoordinatorId,
                SalesCoordinatorName = dto.SalesCoordinatorName,
                CustomerOwnerId = validCustomerOwnerId,

                RegistrationDate = dto.RegistrationDate,
                VisitedDate = dto.VisitedDate,
                Remarks = dto.Remarks,
                IsActive = dto.IsActive,
                IsDeleted = false,
                CreatedDate = DateTime.UtcNow
            };

            var validCountries = (await _countryRepository.GetAll()).ToList();
            var validStates = (await _stateRepository.GetAll()).ToList();
            var validCities = (await _cityRepository.GetAll()).ToList();

            int defaultCreatedBy = validEmployeeIds.FirstOrDefault(id => id > 0);
            if (defaultCreatedBy <= 0) defaultCreatedBy = employees.FirstOrDefault()?.ID ?? 1;

            if (dto.Addresses != null && dto.Addresses.Any())
            {
                var (defaultCountryId, defaultStateId, defaultCityId) = await EnsureDefaultLocationMastersAsync(validCountries, validStates, validCities);

                var pri = dto.Addresses.FirstOrDefault(a => a.IsPrimary) ?? dto.Addresses.First();
                entity.Address = pri.Address;
                entity.CountryId = pri.CountryId > 0 && validCountries.Any(c => c.CountryId == pri.CountryId) ? pri.CountryId : defaultCountryId;
                entity.StateId = pri.StateId > 0 && validStates.Any(s => s.StateId == pri.StateId) ? pri.StateId : defaultStateId;
                entity.CityId = pri.CityId > 0 && validCities.Any(c => c.CityId == pri.CityId) ? pri.CityId : defaultCityId;
                entity.Pincode = string.IsNullOrWhiteSpace(pri.Pincode) ? "000000" : pri.Pincode.Trim();
            }

            await _repository.Create(entity);

            dto.CustomerId = entity.CompanyId;
            dto.CompanyId = entity.CompanyId;
            dto.CustomerCode = entity.CompanyCode;
            dto.SalesCoordinatorName = entity.SalesCoordinatorName;
            dto.IsActive = entity.IsActive;
            dto.IsDeleted = entity.IsDeleted;

            // Handle addresses if provided
            if (dto.Addresses != null && dto.Addresses.Any())
            {
                var (defaultCountryId, defaultStateId, defaultCityId) = await EnsureDefaultLocationMastersAsync(validCountries, validStates, validCities);

                foreach (var addr in dto.Addresses)
                {
                    int cId = addr.CountryId > 0 && validCountries.Any(c => c.CountryId == addr.CountryId) ? addr.CountryId : defaultCountryId;
                    int sId = addr.StateId > 0 && validStates.Any(s => s.StateId == addr.StateId) ? addr.StateId : defaultStateId;
                    int cityId = addr.CityId > 0 && validCities.Any(c => c.CityId == addr.CityId) ? addr.CityId : defaultCityId;
                    int createdBy = (addr.CreatedBy > 0 && validEmployeeIds.Contains(addr.CreatedBy)) ? addr.CreatedBy : defaultCreatedBy;

                    var addressEntity = new CompanyAddressModel
                    {
                        CompanyId = entity.CompanyId,
                        AddressType = string.IsNullOrWhiteSpace(addr.AddressType) ? "Registered" : addr.AddressType,
                        Address = addr.Address ?? string.Empty,
                        CountryId = cId,
                        StateId = sId,
                        CityId = cityId,
                        Pincode = string.IsNullOrWhiteSpace(addr.Pincode) ? "000000" : addr.Pincode.Trim(),
                        IsPrimary = addr.IsPrimary,
                        IsActive = true,
                        IsDeleted = false,
                        CreatedBy = createdBy,
                        CreatedDate = DateTime.UtcNow
                    };
                    await _addressRepository.Create(addressEntity);
                    addr.AddressId = addressEntity.AddressId;
                    addr.CompanyId = entity.CompanyId;
                }
            }

            return dto;
            }
            finally
            {
                _codeLock.Release();
            }
        }

        public async Task<bool> UpdateCustomerAsync(int id, CustomerUpdateDto dto)
        {
            _logger.LogInformation("Updating Customer with ID: {CustomerId}", id);

            var entity = await _repository.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted)
                return false;

            // Address ownership validation
            if (dto.Addresses != null && dto.Addresses.Any())
            {
                foreach (var addr in dto.Addresses)
                {
                    if (addr.AddressId > 0)
                    {
                        bool isOwner = await ValidateAddressOwnershipAsync(id, addr.AddressId);
                        if (!isOwner)
                        {
                            _logger.LogWarning("Address ownership validation failed. Address {AddressId} does not belong to Customer {CustomerId}", addr.AddressId, id);
                            throw new InvalidOperationException($"Address with ID {addr.AddressId} does not belong to Customer {id}.");
                        }
                    }
                }
            }
            // Ensure Customer Code remains unchanged when an existing customer is edited

            // Sanitize Foreign Keys against tbl_Employee and master tables
            var employees = (await _employeeRepository.GetAll()).ToList();
            var validEmployeeIds = new HashSet<int>(employees.Where(e => !e.IsDeleted).Select(e => e.ID));
            var allBdes = (await _bdeUserRepository.GetAll()).ToList();

            int? validDirectorId = null;
            if (dto.DirectorId.HasValue && dto.DirectorId.Value > 0)
            {
                if (validEmployeeIds.Contains(dto.DirectorId.Value))
                {
                    validDirectorId = dto.DirectorId.Value;
                }
                else if (!string.IsNullOrWhiteSpace(dto.DirectorName))
                {
                    var matchedDir = employees.FirstOrDefault(e => !e.IsDeleted &&
                        (e.FirstName + " " + e.LastName).Trim().Equals(dto.DirectorName.Trim(), StringComparison.OrdinalIgnoreCase));
                    if (matchedDir != null) validDirectorId = matchedDir.ID;
                }
            }

            int? validBdeUserId = null;
            if (dto.BDEUserId.HasValue && dto.BDEUserId.Value > 0)
            {
                if (validEmployeeIds.Contains(dto.BDEUserId.Value))
                {
                    validBdeUserId = dto.BDEUserId.Value;
                }
                else
                {
                    var bdeUserRec = allBdes.FirstOrDefault(b => b.ID == dto.BDEUserId.Value);
                    string targetName = dto.BDEUserName ?? bdeUserRec?.Value ?? "";
                    if (!string.IsNullOrWhiteSpace(targetName))
                    {
                        var matchedEmp = employees.FirstOrDefault(e => !e.IsDeleted &&
                            ((e.FirstName + " " + e.LastName).Trim().Equals(targetName.Trim(), StringComparison.OrdinalIgnoreCase) ||
                             (e.FirstName ?? "").Trim().Equals(targetName.Trim(), StringComparison.OrdinalIgnoreCase)));
                        if (matchedEmp != null) validBdeUserId = matchedEmp.ID;
                    }
                }
            }

            int? validSalesCoordinatorId = null;
            if (dto.SalesCoordinatorId.HasValue && dto.SalesCoordinatorId.Value > 0)
            {
                if (validEmployeeIds.Contains(dto.SalesCoordinatorId.Value))
                {
                    validSalesCoordinatorId = dto.SalesCoordinatorId.Value;
                }
                else if (!string.IsNullOrWhiteSpace(dto.SalesCoordinatorName))
                {
                    var matchedSc = employees.FirstOrDefault(e => !e.IsDeleted &&
                        ((e.FirstName + " " + e.LastName).Trim().Equals(dto.SalesCoordinatorName.Trim(), StringComparison.OrdinalIgnoreCase) ||
                         (e.FirstName ?? "").Trim().Equals(dto.SalesCoordinatorName.Trim(), StringComparison.OrdinalIgnoreCase)));
                    if (matchedSc != null) validSalesCoordinatorId = matchedSc.ID;
                }
            }

            int? validCustomerOwnerId = null;
            if (dto.CustomerOwnerId.HasValue && dto.CustomerOwnerId.Value > 0 && validEmployeeIds.Contains(dto.CustomerOwnerId.Value))
            {
                validCustomerOwnerId = dto.CustomerOwnerId.Value;
            }

            var industries = (await _industryRepository.GetAll()).ToList();
            int? validIndustryId = (dto.IndustryId.HasValue && dto.IndustryId.Value > 0 && industries.Any(i => i.IndustryId == dto.IndustryId.Value)) ? dto.IndustryId.Value : null;

            var statuses = (await _statusRepository.GetAll()).ToList();
            int? validStatusId = (dto.CustomerStatusId.HasValue && dto.CustomerStatusId.Value > 0 && statuses.Any(s => s.CustomerStatusId == dto.CustomerStatusId.Value)) ? dto.CustomerStatusId.Value : null;

            var sources = (await _sourceRepository.GetAll()).ToList();
            int? validSourceId = (dto.CustomerSourceId.HasValue && dto.CustomerSourceId.Value > 0 && sources.Any(s => s.CustomerSourceId == dto.CustomerSourceId.Value)) ? dto.CustomerSourceId.Value : null;

            var areas = (await _areaRepository.GetAll()).ToList();
            int? validAreaId = (dto.CustomerAreaId.HasValue && dto.CustomerAreaId.Value > 0 && areas.Any(a => a.CustomerAreaId == dto.CustomerAreaId.Value)) ? dto.CustomerAreaId.Value : null;

            var paymentTerms = (await _paymentTermRepository.GetAll()).ToList();
            int? pTermId = dto.PaymentTermsId ?? dto.PaymentTermId;
            int? validPaymentTermsId = (pTermId.HasValue && pTermId.Value > 0 && paymentTerms.Any(p => p.PaymentTermId == pTermId.Value)) ? pTermId.Value : null;

            entity.CustomerName = dto.CustomerName;
            entity.CompanyName = !string.IsNullOrWhiteSpace(dto.CompanyName) ? dto.CompanyName : dto.CustomerName;
            entity.CustomerShortName = dto.CustomerShortName;
            entity.CompanyGroup = dto.CompanyGroup;
            entity.PlantCode = dto.PlantCode;

            entity.IndustryId = validIndustryId;
            entity.CompanyStatusId = validStatusId;
            entity.CustomerSourceId = validSourceId;
            entity.CustomerAreaId = validAreaId;
            entity.PaymentTermsId = validPaymentTermsId;

            entity.PAN = dto.PAN;
            entity.TAN = dto.TAN;
            entity.GSTIN = dto.GSTIN;
            entity.CIN = dto.CIN;
            entity.MSMENumber = dto.MSMENumber;

            entity.DirectorId = validDirectorId;
            entity.BDEUserId = validBdeUserId;
            entity.SalesCoordinatorId = validSalesCoordinatorId;
            entity.SalesCoordinatorName = dto.SalesCoordinatorName;
            entity.CustomerOwnerId = validCustomerOwnerId;

            var validCountries = (await _countryRepository.GetAll()).ToList();
            var validStates = (await _stateRepository.GetAll()).ToList();
            var validCities = (await _cityRepository.GetAll()).ToList();

            int defaultCreatedBy = validEmployeeIds.FirstOrDefault(id => id > 0);
            if (defaultCreatedBy <= 0) defaultCreatedBy = employees.FirstOrDefault()?.ID ?? 1;

            if (dto.Addresses != null && dto.Addresses.Any())
            {
                var (defaultCountryId, defaultStateId, defaultCityId) = await EnsureDefaultLocationMastersAsync(validCountries, validStates, validCities);

                var pri = dto.Addresses.FirstOrDefault(a => a.IsPrimary) ?? dto.Addresses.First();
                entity.Address = pri.Address;
                entity.CountryId = pri.CountryId > 0 && validCountries.Any(c => c.CountryId == pri.CountryId) ? pri.CountryId : defaultCountryId;
                entity.StateId = pri.StateId > 0 && validStates.Any(s => s.StateId == pri.StateId) ? pri.StateId : defaultStateId;
                entity.CityId = pri.CityId > 0 && validCities.Any(c => c.CityId == pri.CityId) ? pri.CityId : defaultCityId;
                entity.Pincode = pri.Pincode;
            }

            entity.RegistrationDate = dto.RegistrationDate;
            entity.VisitedDate = dto.VisitedDate;
            entity.Remarks = dto.Remarks;
            entity.IsActive = dto.IsActive;
            entity.UpdatedDate = DateTime.UtcNow;

            await _repository.Update(entity);

            // Handle updated addresses if supplied
            if (dto.Addresses != null && dto.Addresses.Any())
            {
                var (defaultCountryId, defaultStateId, defaultCityId) = await EnsureDefaultLocationMastersAsync(validCountries, validStates, validCities);

                foreach (var addr in dto.Addresses)
                {
                    int cId = addr.CountryId > 0 && validCountries.Any(c => c.CountryId == addr.CountryId) ? addr.CountryId : defaultCountryId;
                    int sId = addr.StateId > 0 && validStates.Any(s => s.StateId == addr.StateId) ? addr.StateId : defaultStateId;
                    int cityId = addr.CityId > 0 && validCities.Any(c => c.CityId == addr.CityId) ? addr.CityId : defaultCityId;
                    int createdBy = (addr.CreatedBy > 0 && validEmployeeIds.Contains(addr.CreatedBy)) ? addr.CreatedBy : defaultCreatedBy;

                    if (addr.AddressId > 0)
                    {
                        var existingAddr = await _addressRepository.GetByIdAsync(addr.AddressId);
                        if (existingAddr != null && existingAddr.CompanyId == id)
                        {
                            existingAddr.AddressType = string.IsNullOrWhiteSpace(addr.AddressType) ? "Registered" : addr.AddressType;
                            existingAddr.Address = addr.Address ?? string.Empty;
                            existingAddr.CountryId = cId;
                            existingAddr.StateId = sId;
                            existingAddr.CityId = cityId;
                            existingAddr.Pincode = addr.Pincode ?? string.Empty;
                            existingAddr.IsPrimary = addr.IsPrimary;
                            existingAddr.IsActive = addr.IsActive;
                            await _addressRepository.Update(existingAddr);
                        }
                    }
                    else
                    {
                        var newAddr = new CompanyAddressModel
                        {
                            CompanyId = id,
                            AddressType = string.IsNullOrWhiteSpace(addr.AddressType) ? "Registered" : addr.AddressType,
                            Address = addr.Address ?? string.Empty,
                            CountryId = cId,
                            StateId = sId,
                            CityId = cityId,
                            Pincode = addr.Pincode ?? string.Empty,
                            IsPrimary = addr.IsPrimary,
                            IsActive = true,
                            IsDeleted = false,
                            CreatedBy = createdBy,
                            CreatedDate = DateTime.UtcNow
                        };
                        await _addressRepository.Create(newAddr);
                        addr.AddressId = newAddr.AddressId;
                        addr.CompanyId = id;
                    }
                }
            }

            return true;
        }

        public async Task<bool> DeleteCustomerAsync(int id)
        {
            _logger.LogInformation("Soft-deleting Customer with ID: {CustomerId}", id);

            var item = await _repository.GetByIdAsync(id);
            if (item == null)
                return false;

            item.IsDeleted = true;
            item.UpdatedDate = DateTime.UtcNow;
            await _repository.Update(item);

            // Also mark associated addresses as deleted
            var addresses = await _addressRepository.FindByCondition(a => a.CompanyId == id && !a.IsDeleted);
            foreach (var addr in addresses)
            {
                addr.IsDeleted = true;
                await _addressRepository.Update(addr);
            }

            return true;
        }

        public async Task<IEnumerable<CompanyAddressDto>> GetCustomerAddressesAsync(int customerId)
        {
            _logger.LogInformation("Fetching addresses for Customer ID: {CustomerId}", customerId);

            var addresses = await _addressRepository.FindByCondition(a => a.CompanyId == customerId && !a.IsDeleted);
            return addresses.Select(a => new CompanyAddressDto
            {
                AddressId = a.AddressId,
                CompanyId = a.CompanyId,
                AddressType = a.AddressType,
                Address = a.Address,
                CountryId = a.CountryId,
                StateId = a.StateId,
                CityId = a.CityId,
                Pincode = a.Pincode,
                IsPrimary = a.IsPrimary,
                IsActive = a.IsActive,
                CreatedBy = a.CreatedBy,
                CreatedDate = a.CreatedDate
            });
        }

        public async Task<bool> ValidateAddressOwnershipAsync(int customerId, int addressId)
        {
            var addr = await _addressRepository.GetByIdAsync(addressId);
            if (addr == null || addr.IsDeleted)
                return false;

            return addr.CompanyId == customerId;
        }

        private static CustomerDto MapToCustomerDto(
            CompanyModel c,
            List<StateModel> states,
            List<CountryModel> countries,
            List<CityModel> cities,
            List<IndustryModel> industries,
            List<CustomerStatusModel> statuses,
            List<CustomerSourceModel> sources,
            List<CustomerAreaModel> areas,
            List<PaymentTermModel> paymentTerms,
            List<EmployeeModel> employees,
            List<BDEUserModel> bdeUsers,
            List<CompanyAddressModel> addresses)
        {
            var state = c.StateId.HasValue ? states.FirstOrDefault(s => s.StateId == c.StateId.Value) : null;
            var country = c.CountryId.HasValue ? countries.FirstOrDefault(co => co.CountryId == c.CountryId.Value) : null;
            var city = c.CityId.HasValue ? cities.FirstOrDefault(ci => ci.CityId == c.CityId.Value) : null;
            var industry = c.IndustryId.HasValue ? industries.FirstOrDefault(i => i.IndustryId == c.IndustryId.Value) : null;
            var status = c.CompanyStatusId.HasValue ? statuses.FirstOrDefault(st => st.CustomerStatusId == c.CompanyStatusId.Value) : null;
            var source = c.CustomerSourceId.HasValue ? sources.FirstOrDefault(so => so.CustomerSourceId == c.CustomerSourceId.Value) : null;
            var area = c.CustomerAreaId.HasValue ? areas.FirstOrDefault(ar => ar.CustomerAreaId == c.CustomerAreaId.Value) : null;
            var paymentTerm = c.PaymentTermsId.HasValue ? paymentTerms.FirstOrDefault(pt => pt.PaymentTermId == c.PaymentTermsId.Value) : null;

            var director = c.DirectorId.HasValue ? employees.FirstOrDefault(e => e.ID == c.DirectorId.Value) : null;
            var bdeRec = c.BDEUserId.HasValue 
                ? (bdeUsers.FirstOrDefault(b => b.ID == c.BDEUserId.Value) ?? 
                   bdeUsers.FirstOrDefault(b => int.TryParse(b.Code, out int bCode) && bCode == c.BDEUserId.Value))
                : null;
            var bdeUser = (bdeRec == null && c.BDEUserId.HasValue) ? employees.FirstOrDefault(e => e.ID == c.BDEUserId.Value) : null;
            string? bdeUserName = bdeRec != null && !string.IsNullOrWhiteSpace(bdeRec.Value)
                ? bdeRec.Value
                : (bdeUser != null ? $"{bdeUser.FirstName} {bdeUser.LastName}".Trim() : null);
            var salesCoord = c.SalesCoordinatorId.HasValue ? employees.FirstOrDefault(e => e.ID == c.SalesCoordinatorId.Value) : null;
            var customerOwnerEmp = c.CustomerOwnerId.HasValue ? employees.FirstOrDefault(e => e.ID == c.CustomerOwnerId.Value) : null;
            var customerOwnerBde = (customerOwnerEmp == null && c.CustomerOwnerId.HasValue) ? bdeUsers.FirstOrDefault(b => b.ID == c.CustomerOwnerId.Value) : null;

            string? customerOwnerName = customerOwnerEmp != null 
                ? $"{customerOwnerEmp.FirstName} {customerOwnerEmp.LastName}".Trim()
                : customerOwnerBde?.Value ?? c.OwnerName;

            var custAddresses = addresses
                .Where(a => a.CompanyId == c.CompanyId)
                .Select(a => new CompanyAddressDto
                {
                    AddressId = a.AddressId,
                    CompanyId = a.CompanyId,
                    AddressType = a.AddressType,
                    Address = a.Address,
                    CountryId = a.CountryId,
                    StateId = a.StateId,
                    CityId = a.CityId,
                    Pincode = a.Pincode,
                    IsPrimary = a.IsPrimary,
                    IsActive = a.IsActive,
                    CreatedBy = a.CreatedBy,
                    CreatedDate = a.CreatedDate
                })
                .ToList();

            return new CustomerDto
            {
                CustomerId = c.CompanyId,
                CompanyId = c.CompanyId,
                CustomerCode = c.CompanyCode,
                CustomerName = !string.IsNullOrWhiteSpace(c.CustomerName) ? c.CustomerName : c.CompanyName,
                CustomerShortName = c.CustomerShortName,
                CompanyName = c.CompanyName,
                CompanyGroup = c.CompanyGroup,
                PlantCode = c.PlantCode,

                IndustryId = c.IndustryId,

                CustomerStatusId = c.CompanyStatusId,

                CustomerSourceId = c.CustomerSourceId,

                CustomerAreaId = c.CustomerAreaId,

                PaymentTermsId = c.PaymentTermsId,
                PaymentTermId = c.PaymentTermsId,

                PAN = c.PAN,
                TAN = c.TAN,
                GSTIN = c.GSTIN,
                CIN = c.CIN,
                MSMENumber = c.MSMENumber,

                DirectorId = c.DirectorId,
                DirectorName = director != null ? $"{director.FirstName} {director.LastName}".Trim() : null,

                BDEUserId = c.BDEUserId,
                BDEUserName = bdeUserName,

                SalesCoordinatorId = c.SalesCoordinatorId,
                SalesCoordinatorName = !string.IsNullOrWhiteSpace(c.SalesCoordinatorName) ? c.SalesCoordinatorName : (salesCoord != null ? $"{salesCoord.FirstName} {salesCoord.LastName}".Trim() : null),

                CustomerOwnerId = c.CustomerOwnerId,
                CustomerOwnerName = customerOwnerName,

                Addresses = custAddresses,

                RegistrationDate = c.RegistrationDate,
                VisitedDate = c.VisitedDate,
                Remarks = c.Remarks,
                IsActive = c.IsActive,
                IsDeleted = c.IsDeleted
            };
        }

#pragma warning disable CS0618 // Type or member is obsolete
        // Backward compatibility implementations for ICompanyService
        async Task<IEnumerable<CompanyDto>> ICompanyService.GetAllCompaniesAsync()
        {
            var customers = await GetAllCustomersAsync();
            return customers.Select(c => new CompanyDto
            {
                CustomerId = c.CustomerId,
                CompanyId = c.CompanyId,
                CustomerCode = c.CustomerCode,
                CustomerName = c.CustomerName,
                CustomerShortName = c.CustomerShortName,
                CompanyName = c.CompanyName,
                CompanyGroup = c.CompanyGroup,
                PlantCode = c.PlantCode,
                IndustryId = c.IndustryId,
                CustomerStatusId = c.CustomerStatusId,
                CustomerSourceId = c.CustomerSourceId,
                CustomerAreaId = c.CustomerAreaId,
                PaymentTermsId = c.PaymentTermsId,
                PaymentTermId = c.PaymentTermId,
                PAN = c.PAN,
                TAN = c.TAN,
                GSTIN = c.GSTIN,
                CIN = c.CIN,
                MSMENumber = c.MSMENumber,
                DirectorId = c.DirectorId,
                DirectorName = c.DirectorName,
                BDEUserId = c.BDEUserId,
                BDEUserName = c.BDEUserName,
                SalesCoordinatorId = c.SalesCoordinatorId,
                SalesCoordinatorName = c.SalesCoordinatorName,
                CustomerOwnerId = c.CustomerOwnerId,
                CustomerOwnerName = c.CustomerOwnerName,
                Addresses = c.Addresses,
                RegistrationDate = c.RegistrationDate,
                VisitedDate = c.VisitedDate,
                Remarks = c.Remarks,
                IsActive = c.IsActive,
                IsDeleted = c.IsDeleted
            });
        }

        async Task<CompanyDto> ICompanyService.GetCompanyByIdAsync(int id)
        {
            var customer = await GetCustomerByIdAsync(id);
            if (customer == null) return null!;
            return new CompanyDto
            {
                CustomerId = customer.CustomerId,
                CompanyId = customer.CompanyId,
                CustomerCode = customer.CustomerCode,
                CustomerName = customer.CustomerName,
                CustomerShortName = customer.CustomerShortName,
                CompanyName = customer.CompanyName,
                CompanyGroup = customer.CompanyGroup,
                PlantCode = customer.PlantCode,
                IndustryId = customer.IndustryId,
                CustomerStatusId = customer.CustomerStatusId,
                CustomerSourceId = customer.CustomerSourceId,
                CustomerAreaId = customer.CustomerAreaId,
                PaymentTermsId = customer.PaymentTermsId,
                PaymentTermId = customer.PaymentTermId,
                PAN = customer.PAN,
                TAN = customer.TAN,
                GSTIN = customer.GSTIN,
                CIN = customer.CIN,
                MSMENumber = customer.MSMENumber,
                DirectorId = customer.DirectorId,
                DirectorName = customer.DirectorName,
                BDEUserId = customer.BDEUserId,
                BDEUserName = customer.BDEUserName,
                SalesCoordinatorId = customer.SalesCoordinatorId,
                SalesCoordinatorName = customer.SalesCoordinatorName,
                CustomerOwnerId = customer.CustomerOwnerId,
                CustomerOwnerName = customer.CustomerOwnerName,
                Addresses = customer.Addresses,
                RegistrationDate = customer.RegistrationDate,
                VisitedDate = customer.VisitedDate,
                Remarks = customer.Remarks,
                IsActive = customer.IsActive,
                IsDeleted = customer.IsDeleted
            };
        }

        async Task<CompanyDto> ICompanyService.CreateCompanyAsync(CompanyDto companyDto)
        {
            var createDto = new CustomerCreateDto
            {
                CustomerId = companyDto.CustomerId,
                CompanyId = companyDto.CompanyId,
                CustomerCode = companyDto.CustomerCode,
                CustomerName = companyDto.CustomerName,
                CustomerShortName = companyDto.CustomerShortName,
                CompanyName = companyDto.CompanyName,
                CompanyGroup = companyDto.CompanyGroup,
                PlantCode = companyDto.PlantCode,
                IndustryId = companyDto.IndustryId,
                CustomerStatusId = companyDto.CustomerStatusId,
                CustomerSourceId = companyDto.CustomerSourceId,
                CustomerAreaId = companyDto.CustomerAreaId,
                PaymentTermsId = companyDto.PaymentTermsId ?? companyDto.PaymentTermId,
                PAN = companyDto.PAN,
                TAN = companyDto.TAN,
                GSTIN = companyDto.GSTIN,
                CIN = companyDto.CIN,
                MSMENumber = companyDto.MSMENumber,
                DirectorId = companyDto.DirectorId,
                BDEUserId = companyDto.BDEUserId,
                SalesCoordinatorId = companyDto.SalesCoordinatorId,
                SalesCoordinatorName = companyDto.SalesCoordinatorName,
                CustomerOwnerId = companyDto.CustomerOwnerId,
                Addresses = companyDto.Addresses,
                RegistrationDate = companyDto.RegistrationDate,
                VisitedDate = companyDto.VisitedDate,
                Remarks = companyDto.Remarks,
                IsActive = companyDto.IsActive
            };
            var result = await CreateCustomerAsync(createDto);
            companyDto.CustomerId = result.CustomerId;
            companyDto.CompanyId = result.CompanyId;
            companyDto.CustomerCode = result.CustomerCode;
            companyDto.IsActive = result.IsActive;
            companyDto.IsDeleted = result.IsDeleted;
            return companyDto;
        }

        Task<bool> ICompanyService.UpdateCompanyAsync(int id, CompanyDto companyDto)
        {
            var updateDto = new CustomerUpdateDto
            {
                CustomerId = companyDto.CustomerId,
                CompanyId = companyDto.CompanyId,
                CustomerCode = companyDto.CustomerCode,
                CustomerName = companyDto.CustomerName,
                CustomerShortName = companyDto.CustomerShortName,
                CompanyName = companyDto.CompanyName,
                CompanyGroup = companyDto.CompanyGroup,
                PlantCode = companyDto.PlantCode,
                IndustryId = companyDto.IndustryId,
                CustomerStatusId = companyDto.CustomerStatusId,
                CustomerSourceId = companyDto.CustomerSourceId,
                CustomerAreaId = companyDto.CustomerAreaId,
                PaymentTermsId = companyDto.PaymentTermsId ?? companyDto.PaymentTermId,
                PAN = companyDto.PAN,
                TAN = companyDto.TAN,
                GSTIN = companyDto.GSTIN,
                CIN = companyDto.CIN,
                MSMENumber = companyDto.MSMENumber,
                DirectorId = companyDto.DirectorId,
                BDEUserId = companyDto.BDEUserId,
                SalesCoordinatorId = companyDto.SalesCoordinatorId,
                CustomerOwnerId = companyDto.CustomerOwnerId,
                Addresses = companyDto.Addresses,
                RegistrationDate = companyDto.RegistrationDate,
                VisitedDate = companyDto.VisitedDate,
                Remarks = companyDto.Remarks,
                IsActive = companyDto.IsActive
            };
            return UpdateCustomerAsync(id, updateDto);
        }

        Task<bool> ICompanyService.DeleteCompanyAsync(int id)
        {
            return DeleteCustomerAsync(id);
        }
#pragma warning restore CS0618
    }
}
