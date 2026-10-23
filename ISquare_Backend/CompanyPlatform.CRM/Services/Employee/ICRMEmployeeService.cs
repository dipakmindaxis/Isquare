using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.Employee;

namespace CompanyPlatform.CRM.Services.Employee
{
    public interface ICRMEmployeeService
    {
        Task<IEnumerable<EmployeeDto>> GetAllAsync();
        Task<IEnumerable<EmployeeDto>> GetActiveAsync();
        Task<EmployeeDto?> GetByIdAsync(int id);
        Task<EmployeeDto?> GetByCodeAsync(string employeeCode);
        Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto);
        Task<bool> UpdateAsync(int id, UpdateEmployeeDto dto);
        Task<bool> DeleteAsync(int id);
        Task<string> GetNextEmployeeCodeAsync();
    }
}
