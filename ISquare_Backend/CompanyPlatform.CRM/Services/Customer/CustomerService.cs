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

            var entity = new CompanyModel
            {
                CompanyCode = code,
                CompanyName = !string.IsNullOrWhiteSpace(dto.CompanyName) ? dto.CompanyName : dto.CustomerName,
                CustomerName = dto.CustomerName,
                CustomerShortName = dto.CustomerShortName,
                CompanyGroup = dto.CompanyGroup,
                PlantCode = dto.PlantCode,

                IndustryId = dto.IndustryId > 0 ? dto.IndustryId : null,
                CompanyStatusId = dto.CustomerStatusId > 0 ? dto.CustomerStatusId : null,
                CustomerSourceId = dto.CustomerSourceId > 0 ? dto.CustomerSourceId : null,
                CustomerAreaId = dto.CustomerAreaId > 0 ? dto.CustomerAreaId : null,
                PaymentTermsId = (dto.PaymentTermsId ?? dto.PaymentTermId) > 0 ? (dto.PaymentTermsId ?? dto.PaymentTermId) : null,

                PAN = dto.PAN,
                TAN = dto.TAN,
                GSTIN = dto.GSTIN,
                CIN = dto.CIN,
                MSMENumber = dto.MSMENumber,

                DirectorId = dto.DirectorId > 0 ? dto.DirectorId : null,
                BDEUserId = dto.BDEUserId > 0 ? dto.BDEUserId : null,
                SalesCoordinatorId = dto.SalesCoordinatorId > 0 ? dto.SalesCoordinatorId : null,
                SalesCoordinatorName = dto.SalesCoordinatorName,
                CustomerOwnerId = dto.CustomerOwnerId > 0 ? dto.CustomerOwnerId : null,

                RegistrationDate = dto.RegistrationDate,
                VisitedDate = dto.VisitedDate,
                Remarks = dto.Remarks,
                IsActive = dto.IsActive,
                IsDeleted = false,
                CreatedDate = DateTime.UtcNow
            };

            if (dto.Addresses != null && dto.Addresses.Any())
            {
                var pri = dto.Addresses.FirstOrDefault(a => a.IsPrimary) ?? dto.Addresses.First();
                entity.Address = pri.Address;
                entity.CountryId = pri.CountryId > 0 ? pri.CountryId : null;
                entity.StateId = pri.StateId > 0 ? pri.StateId : null;
                entity.CityId = pri.CityId > 0 ? pri.CityId : null;
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
                foreach (var addr in dto.Addresses)
                {
                    var addressEntity = new CompanyAddressModel
                    {
                        CompanyId = entity.CompanyId,
                        AddressType = string.IsNullOrWhiteSpace(addr.AddressType) ? "Registered" : addr.AddressType,
                        Address = addr.Address ?? string.Empty,
                        CountryId = addr.CountryId > 0 ? addr.CountryId : 1,
                        StateId = addr.StateId > 0 ? addr.StateId : 1,
                        CityId = addr.CityId > 0 ? addr.CityId : 1,
                        Pincode = string.IsNullOrWhiteSpace(addr.Pincode) ? "000000" : addr.Pincode.Trim(),
                        IsPrimary = addr.IsPrimary,
                        IsActive = true,
                        IsDeleted = false,
                        CreatedBy = addr.CreatedBy > 0 ? addr.CreatedBy : 1,
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

            entity.CustomerName = dto.CustomerName;
            entity.CompanyName = !string.IsNullOrWhiteSpace(dto.CompanyName) ? dto.CompanyName : dto.CustomerName;
            entity.CustomerShortName = dto.CustomerShortName;
            entity.CompanyGroup = dto.CompanyGroup;
            entity.PlantCode = dto.PlantCode;

            entity.IndustryId = dto.IndustryId > 0 ? dto.IndustryId : null;
            entity.CompanyStatusId = dto.CustomerStatusId > 0 ? dto.CustomerStatusId : null;
            entity.CustomerSourceId = dto.CustomerSourceId > 0 ? dto.CustomerSourceId : null;
            entity.CustomerAreaId = dto.CustomerAreaId > 0 ? dto.CustomerAreaId : null;
            entity.PaymentTermsId = (dto.PaymentTermsId ?? dto.PaymentTermId) > 0 ? (dto.PaymentTermsId ?? dto.PaymentTermId) : null;

            entity.PAN = dto.PAN;
            entity.TAN = dto.TAN;
            entity.GSTIN = dto.GSTIN;
            entity.CIN = dto.CIN;
            entity.MSMENumber = dto.MSMENumber;

            entity.DirectorId = dto.DirectorId > 0 ? dto.DirectorId : null;
            entity.BDEUserId = dto.BDEUserId > 0 ? dto.BDEUserId : null;
            entity.SalesCoordinatorId = dto.SalesCoordinatorId > 0 ? dto.SalesCoordinatorId : null;
            entity.SalesCoordinatorName = dto.SalesCoordinatorName;
            entity.CustomerOwnerId = dto.CustomerOwnerId > 0 ? dto.CustomerOwnerId : null;

            if (dto.Addresses != null && dto.Addresses.Any())
            {
                var pri = dto.Addresses.FirstOrDefault(a => a.IsPrimary) ?? dto.Addresses.First();
                entity.Address = pri.Address;
                entity.CountryId = pri.CountryId > 0 ? pri.CountryId : null;
                entity.StateId = pri.StateId > 0 ? pri.StateId : null;
                entity.CityId = pri.CityId > 0 ? pri.CityId : null;
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
                foreach (var addr in dto.Addresses)
                {
                    if (addr.AddressId > 0)
                    {
                        var existingAddr = await _addressRepository.GetByIdAsync(addr.AddressId);
                        if (existingAddr != null && existingAddr.CompanyId == id)
                        {
                            existingAddr.AddressType = addr.AddressType;
                            existingAddr.Address = addr.Address;
                            existingAddr.CountryId = addr.CountryId;
                            existingAddr.StateId = addr.StateId;
                            existingAddr.CityId = addr.CityId;
                            existingAddr.Pincode = addr.Pincode;
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
                            CountryId = addr.CountryId > 0 ? addr.CountryId : 1,
                            StateId = addr.StateId > 0 ? addr.StateId : 1,
                            CityId = addr.CityId > 0 ? addr.CityId : 1,
                            Pincode = addr.Pincode ?? string.Empty,
                            IsPrimary = addr.IsPrimary,
                            IsActive = true,
                            IsDeleted = false,
                            CreatedBy = addr.CreatedBy > 0 ? addr.CreatedBy : 1,
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
            var bde = c.BDEUserId.HasValue ? bdeUsers.FirstOrDefault(b => b.ID == c.BDEUserId.Value) : null;
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
                IndustryName = industry?.IndustryName,

                CustomerStatusId = c.CompanyStatusId,
                CustomerStatusName = status?.StatusName,

                CustomerSourceId = c.CustomerSourceId,
                CustomerSourceName = source?.SourceName,

                CustomerAreaId = c.CustomerAreaId,
                CustomerAreaName = area?.AreaName,

                PaymentTermsId = c.PaymentTermsId,
                PaymentTermId = c.PaymentTermsId,
                PaymentTermName = paymentTerm?.PaymentTermName,

                PAN = c.PAN,
                TAN = c.TAN,
                GSTIN = c.GSTIN,
                CIN = c.CIN,
                MSMENumber = c.MSMENumber,

                DirectorId = c.DirectorId,
                DirectorName = director != null ? $"{director.FirstName} {director.LastName}".Trim() : null,

                BDEUserId = c.BDEUserId,
                BDEUserName = bde?.Value,

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
                IndustryName = c.IndustryName,
                CustomerStatusId = c.CustomerStatusId,
                CustomerStatusName = c.CustomerStatusName,
                CustomerSourceId = c.CustomerSourceId,
                CustomerSourceName = c.CustomerSourceName,
                CustomerAreaId = c.CustomerAreaId,
                CustomerAreaName = c.CustomerAreaName,
                PaymentTermsId = c.PaymentTermsId,
                PaymentTermId = c.PaymentTermId,
                PaymentTermName = c.PaymentTermName,
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
                IndustryName = customer.IndustryName,
                CustomerStatusId = customer.CustomerStatusId,
                CustomerStatusName = customer.CustomerStatusName,
                CustomerSourceId = customer.CustomerSourceId,
                CustomerSourceName = customer.CustomerSourceName,
                CustomerAreaId = customer.CustomerAreaId,
                CustomerAreaName = customer.CustomerAreaName,
                PaymentTermsId = customer.PaymentTermsId,
                PaymentTermId = customer.PaymentTermId,
                PaymentTermName = customer.PaymentTermName,
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
