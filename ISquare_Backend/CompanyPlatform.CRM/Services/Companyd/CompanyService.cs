//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Threading;
//using System.Threading.Tasks;
//using Microsoft.Extensions.Logging;
//using CompanyPlatform.CRM.DTO.Company;
//using CompanyPlatform.Core.Repository;
//namespace CompanyPlatform.CRM.Services.Company
//{
//    public class CompanyService : ICompanyService
//    {
//        private readonly IRepositories<Model.Company> _repository;
//        private readonly IRepositories<Model.State> _stateRepository;
//        private readonly IRepositories<Model.CompanyAddress> _addressRepository;
//        private readonly ILogger<CompanyService> _logger;
//        private static readonly SemaphoreSlim _codeLock = new SemaphoreSlim(1, 1);

//        public CompanyService(IRepositories<Model.Company> repository,
//                              IRepositories<Model.State> stateRepository,
//                              IRepositories<Model.CompanyAddress> addressRepository,
//                              ILogger<CompanyService> logger)
//        {
//            _repository = repository;
//            _stateRepository = stateRepository;
//            _addressRepository = addressRepository;
//            _logger = logger;
//        }

//        private async Task<string> GenerateNextCompanyCodeAsync()
//        {
//            await _codeLock.WaitAsync();
//            try
//            {
//                var companies = await _repository.GetAll();
//                int maxNumber = 100;

//                foreach (var c in companies)
//                {
//                    if (string.IsNullOrWhiteSpace(c.CompanyCode))
//                        continue;

//                    var code = c.CompanyCode.Trim();
//                    if (code.StartsWith("CMP#", StringComparison.OrdinalIgnoreCase))
//                    {
//                        var numPart = code.Substring(4);
//                        if (int.TryParse(numPart, out int numVal))
//                        {
//                            if (numVal > maxNumber)
//                            {
//                                maxNumber = numVal;
//                            }
//                        }
//                    }
//                }

//                int nextNumber = maxNumber + 1;
//                return $"CMP#{nextNumber}";
//            }
//            finally
//            {
//                _codeLock.Release();
//            }
//        }

//        public async Task<IEnumerable<CompanyDto>> GetAllCompaniesAsync()
//        {
//            _logger.LogInformation("Fetching all active companies.");

//            var items = await _repository.GetAll();
//            var states = await _stateRepository.GetAll();
//            var allAddresses = await _addressRepository.GetAll();

//            return items
//                .Where(c => c.IsDeleted == false)
//                .Select(c =>
//                {
//                    var primaryAddr = allAddresses.FirstOrDefault(a => a.CompanyId == c.CompanyId && a.IsPrimary)
//                                      ?? allAddresses.FirstOrDefault(a => a.CompanyId == c.CompanyId);

//                    return new CompanyDto
//                    {
//                        CompanyId = c.CompanyId,
//                        CompanyCode = c.CompanyCode,
//                        CompanyName = c.CompanyName,
//                        OwnerName = c.OwnerName,
//                        Email = c.Email,
//                        AlternateEmail = c.AlternateEmail,
//                        Mobile = c.Mobile,
//                        AlternateMobile = c.AlternateMobile,
//                        GSTNumber = c.GSTNumber,
//                        Website = c.Website,
//                        IndustryId = c.IndustryId,
//                        CompanyCategoryId = c.CompanyCategoryId,
//                        ClientTypeId = c.ClientTypeId,
//                        CompanyStatusId = c.CompanyStatusId,
//                        CompanyTypeId = c.CompanyTypeId,
//                        SalesManagerId = c.SalesManagerId,
//                        BDEUserId = c.BDEUserId,
//                        Address = primaryAddr?.Address ?? c.Address,
//                        CountryId = primaryAddr?.CountryId ?? c.CountryId,
//                        StateId = primaryAddr?.StateId ?? c.StateId,
//                        StateName = (primaryAddr?.StateId ?? c.StateId).HasValue ? states.FirstOrDefault(s => s.StateId == (primaryAddr?.StateId ?? c.StateId).Value)?.StateName : null,
//                        CityId = primaryAddr?.CityId ?? c.CityId,
//                        Pincode = primaryAddr?.Pincode ?? c.Pincode,
//                        RegistrationDate = c.RegistrationDate,
//                        VisitedDate = c.VisitedDate,
//                        Remarks = c.Remarks,
//                        IsActive = c.IsActive,
//                        IsDeleted = c.IsDeleted
//                    };
//                });
//        }

//        public async Task<CompanyDto> GetCompanyByIdAsync(int id)
//        {
//            _logger.LogInformation("Fetching Company by ID: {CompanyId}", id);

//            var item = await _repository.GetByIdAsync(id);

//            if (item == null || item.IsDeleted)
//            {
//                _logger.LogWarning("Company with ID {CompanyId} not found.", id);
//                return null;
//            }

//            var allAddresses = await _addressRepository.GetAll();
//            var primaryAddr = allAddresses.FirstOrDefault(a => a.CompanyId == item.CompanyId && a.IsPrimary)
//                              ?? allAddresses.FirstOrDefault(a => a.CompanyId == item.CompanyId);

//            return new CompanyDto
//            {
//                CompanyId = item.CompanyId,
//                CompanyCode = item.CompanyCode,
//                CompanyName = item.CompanyName,
//                OwnerName = item.OwnerName,
//                Email = item.Email,
//                AlternateEmail = item.AlternateEmail,
//                Mobile = item.Mobile,
//                AlternateMobile = item.AlternateMobile,
//                GSTNumber = item.GSTNumber,
//                Website = item.Website,
//                IndustryId = item.IndustryId,
//                CompanyCategoryId = item.CompanyCategoryId,
//                ClientTypeId = item.ClientTypeId,
//                CompanyStatusId = item.CompanyStatusId,
//                CompanyTypeId = item.CompanyTypeId,
//                SalesManagerId = item.SalesManagerId,
//                BDEUserId = item.BDEUserId,
//                Address = primaryAddr?.Address ?? item.Address,
//                CountryId = primaryAddr?.CountryId ?? item.CountryId,
//                StateId = primaryAddr?.StateId ?? item.StateId,
//                CityId = primaryAddr?.CityId ?? item.CityId,
//                Pincode = primaryAddr?.Pincode ?? item.Pincode,
//                RegistrationDate = item.RegistrationDate,
//                VisitedDate = item.VisitedDate,
//                Remarks = item.Remarks,
//                IsActive = item.IsActive,
//                IsDeleted = item.IsDeleted
//            };
//        }

//        public async Task<CompanyDto> CreateCompanyAsync(CompanyDto dto)
//        {
//            _logger.LogInformation("Creating Company: {CompanyName}", dto.CompanyName);

//            string generatedCode = await GenerateNextCompanyCodeAsync();

//            var company = new Model.Company
//            {
//                CompanyCode = generatedCode,
//                CompanyName = dto.CompanyName,
//                OwnerName = dto.OwnerName,
//                Email = dto.Email,
//                AlternateEmail = dto.AlternateEmail,
//                Mobile = dto.Mobile,
//                AlternateMobile = dto.AlternateMobile,
//                GSTNumber = dto.GSTNumber,
//                Website = dto.Website,
//                IndustryId = dto.IndustryId,
//                CompanyCategoryId = dto.CompanyCategoryId,
//                ClientTypeId = dto.ClientTypeId,
//                CompanyStatusId = dto.CompanyStatusId,
//                CompanyTypeId = dto.CompanyTypeId,
//                SalesManagerId = dto.SalesManagerId,
//                BDEUserId = dto.BDEUserId,
//                Address = dto.Address,
//                CountryId = dto.CountryId,
//                StateId = dto.StateId,
//                CityId = dto.CityId,
//                Pincode = dto.Pincode,
//                RegistrationDate = dto.RegistrationDate,
//                VisitedDate = dto.VisitedDate,
//                Remarks = dto.Remarks,
//                IsActive = true,
//                IsDeleted = false
//            };

//            await _repository.Create(company);

//            dto.CompanyId = company.CompanyId;
//            dto.CompanyCode = company.CompanyCode;
//            dto.IsDeleted = company.IsDeleted;
//            dto.IsActive = company.IsActive;

//            return dto;
//        }

//        public async Task<bool> UpdateCompanyAsync(int id, CompanyDto dto)
//        {
//            _logger.LogInformation("Updating Company with ID: {CompanyId}", id);

//            var company = await _repository.GetByIdAsync(id);

//            if (company == null || company.IsDeleted)
//                return false;

//            if (string.IsNullOrWhiteSpace(company.CompanyCode) && !string.IsNullOrWhiteSpace(dto.CompanyCode))
//            {
//                company.CompanyCode = dto.CompanyCode;
//            }

//            company.CompanyName = dto.CompanyName;
//            company.OwnerName = dto.OwnerName;
//            company.Email = dto.Email;
//            company.AlternateEmail = dto.AlternateEmail;
//            company.Mobile = dto.Mobile;
//            company.AlternateMobile = dto.AlternateMobile;
//            company.GSTNumber = dto.GSTNumber;
//            company.Website = dto.Website;
//            company.IndustryId = dto.IndustryId;
//            company.CompanyCategoryId = dto.CompanyCategoryId;
//            company.ClientTypeId = dto.ClientTypeId;
//            company.CompanyStatusId = dto.CompanyStatusId;
//            company.CompanyTypeId = dto.CompanyTypeId;
//            company.SalesManagerId = dto.SalesManagerId;
//            company.BDEUserId = dto.BDEUserId;
//            company.Address = dto.Address;
//            company.CountryId = dto.CountryId;
//            company.StateId = dto.StateId;
//            company.CityId = dto.CityId;
//            company.Pincode = dto.Pincode;
//            company.RegistrationDate = dto.RegistrationDate;
//            company.VisitedDate = dto.VisitedDate;
//            company.Remarks = dto.Remarks;

//            await _repository.Update(company);

//            return true;
//        }

//        public async Task<bool> DeleteCompanyAsync(int id)
//        {
//            _logger.LogInformation("Deleting Company with ID: {CompanyId}", id);

//            var company = await _repository.GetByIdAsync(id);

//            if (company == null)
//                return false;

//            company.IsDeleted = true;

//            await _repository.Update(company);

//            return true;
//        }
//    }
//}