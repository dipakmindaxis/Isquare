using CompanyPlatform.Core.DTO.Companies;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Repository;

using CompaniesEntity = CompanyPlatform.Core.Models.CRM.Company.Companiess;

namespace CompanyPlatform.Core.Services.Companies
{
    public class CompaniessService : ICompaniessService
    {
        private readonly IRepositories<CompaniesEntity> _companiesRepository;

        public CompaniessService(
            IRepositories<CompaniesEntity> companiesRepository)
        {
            _companiesRepository = companiesRepository;
        }

        // GET: All Companies
        public async Task<IEnumerable<CompaniessDto>> GetAllCompaniesAsync()
        {
            var companies = await _companiesRepository.GetAll();

            return companies
                .Where(c => !c.IsDeleted)
                .Select(c => new CompaniessDto
                {
                    CompanyId = c.CompanyId,
                    CompanyName = c.CompanyName,
                    Status = c.Status,
                    CreatedBy = c.CreatedBy,
                    CreatedDate = c.CreatedDate,
                    UpdatedBy = c.UpdatedBy,
                    UpdatedDate = c.UpdatedDate,
                    IsActive = c.IsActive,
                    IsDeleted = c.IsDeleted
                });
        }

        // GET: Company By ID
        public async Task<CompaniessDto?> GetCompanyByIdAsync(int id)
        {
            var company = await _companiesRepository.GetById(id);

            if (company == null || company.IsDeleted)
                return null;

            return new CompaniessDto
            {
                CompanyId = company.CompanyId,
                CompanyName = company.CompanyName,
                Status = company.Status,
                CreatedBy = company.CreatedBy,
                CreatedDate = company.CreatedDate,
                UpdatedBy = company.UpdatedBy,
                UpdatedDate = company.UpdatedDate,
                IsActive = company.IsActive,
                IsDeleted = company.IsDeleted
            };
        }

        // POST: Create Company
        public async Task<CompaniessDto> CreateCompanyAsync(CompaniessDto dto)
        {
            var company = new CompaniesEntity
            {
                CompanyName = dto.CompanyName,
                Status = dto.Status,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsActive = true,
                IsDeleted = false
            };

            await _companiesRepository.Create(company);

            dto.CompanyId = company.CompanyId;
            dto.CreatedDate = company.CreatedDate;
            dto.IsActive = company.IsActive;
            dto.IsDeleted = company.IsDeleted;

            return dto;
        }

        // PUT: Update Company
        public async Task<bool> UpdateCompanyAsync(int id, CompaniessDto dto)
        {
            var company = await _companiesRepository.GetById(id);

            if (company == null || company.IsDeleted)
                return false;

            company.CompanyName = dto.CompanyName;
            company.Status = dto.Status;
            company.UpdatedBy = dto.UpdatedBy;
            company.UpdatedDate = DateTime.Now;
            company.IsActive = dto.IsActive;

            await _companiesRepository.Update(company);

            return true;
        }

        // DELETE: Soft Delete Company
        public async Task<bool> DeleteCompanyAsync(int id)
        {
            var company = await _companiesRepository.GetById(id);

            if (company == null || company.IsDeleted)
                return false;

            company.IsDeleted = true;
            company.IsActive = false;
            company.UpdatedDate = DateTime.Now;

            await _companiesRepository.Update(company);

            return true;
        }
    }
}