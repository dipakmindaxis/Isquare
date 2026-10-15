using System;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Company;
using CompanyPlatform.CRM.DTO.Customer;
using CompanyPlatform.CRM.Services.Customer;
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

namespace CompanyPlatform.CRM.Services.Company
{
    [Obsolete("Use CompanyPlatform.CRM.Services.Customer.CustomerService instead.")]
    public class CompanyService : CustomerService, ICompanyService
    {
        public CompanyService(
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
            : base(repository, addressRepository, employeeRepository, bdeUserRepository, stateRepository, countryRepository, cityRepository, industryRepository, statusRepository, sourceRepository, areaRepository, paymentTermRepository, logger)
        {
        }
    }
}