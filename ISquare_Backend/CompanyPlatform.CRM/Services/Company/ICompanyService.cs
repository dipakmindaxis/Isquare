using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.Company;

namespace CompanyPlatform.CRM.Services.Company
{
    [Obsolete("Use CompanyPlatform.CRM.Services.Customer.ICustomerService instead.")]
    public interface ICompanyService
    {
        Task<IEnumerable<CompanyDto>> GetAllCompaniesAsync();
        Task<CompanyDto> GetCompanyByIdAsync(int id);
        Task<CompanyDto> CreateCompanyAsync(CompanyDto companyDto);
        Task<bool> UpdateCompanyAsync(int id, CompanyDto companyDto);
        Task<bool> DeleteCompanyAsync(int id);
    }
}