using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Data;
using EmployeeEntity = CompanyPlatform.Core.Models.CRM.Company.Employee;
using CompanyPlatform.CRM.DTO.Employee;

namespace CompanyPlatform.CRM.Services.Employee
{
    public class CRMEmployeeService : ICRMEmployeeService
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<CRMEmployeeService> _logger;
        private static readonly SemaphoreSlim _codeLock = new SemaphoreSlim(1, 1);

        public CRMEmployeeService(
            ApplicationDBContext context,
            ILogger<CRMEmployeeService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<string> GetNextEmployeeCodeAsync()
        {
            await _codeLock.WaitAsync();
            try
            {
                var codes = await _context.Tbl_Employee
                    .Select(e => e.EmployeeCode)
                    .ToListAsync();

                int maxNumber = 0;
                foreach (var code in codes)
                {
                    if (string.IsNullOrWhiteSpace(code))
                        continue;

                    var trimmed = code.Trim();
                    var match = Regex.Match(trimmed, @"^(?:EMP-?|E-?)(\d+)$", RegexOptions.IgnoreCase);
                    if (match.Success && int.TryParse(match.Groups[1].Value, out int num))
                    {
                        if (num > maxNumber) maxNumber = num;
                    }
                    else
                    {
                        var digitMatch = Regex.Match(trimmed, @"\d+");
                        if (digitMatch.Success && int.TryParse(digitMatch.Value, out int fallbackNum))
                        {
                            if (fallbackNum > maxNumber) maxNumber = fallbackNum;
                        }
                    }
                }

                return $"EMP{(maxNumber + 1):D3}";
            }
            finally
            {
                _codeLock.Release();
            }
        }

        public async Task<IEnumerable<EmployeeDto>> GetAllAsync(int? designationId = null, string? role = null)
        {
            _logger.LogInformation("Fetching all non-deleted employees.");

            var query = _context.Tbl_Employee
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .Include(e => e.WorkLocation)
                .Include(e => e.ReportingToManager)
                .Include(e => e.Level)
                .Where(e => !e.IsDeleted);

            if (designationId.HasValue && designationId.Value > 0)
            {
                query = query.Where(e => e.DesignationID == designationId.Value);
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                query = query.Where(e => e.Designation != null && e.Designation.DesignationName.Contains(role));
            }

            var employees = await query.OrderBy(e => e.ID).ToListAsync();

            return employees.Select(MapToDto);
        }

        public async Task<IEnumerable<EmployeeDto>> GetActiveAsync(int? designationId = null, string? role = null)
        {
            _logger.LogInformation("Fetching all active non-deleted employees.");

            var query = _context.Tbl_Employee
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .Include(e => e.WorkLocation)
                .Include(e => e.ReportingToManager)
                .Include(e => e.Level)
                .Where(e => !e.IsDeleted && e.IsActive);

            if (designationId.HasValue && designationId.Value > 0)
            {
                query = query.Where(e => e.DesignationID == designationId.Value);
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                query = query.Where(e => e.Designation != null && e.Designation.DesignationName.Contains(role));
            }

            var employees = await query
                .OrderBy(e => e.FirstName)
                .ThenBy(e => e.LastName)
                .ToListAsync();

            return employees.Select(MapToDto);
        }

        public async Task<IEnumerable<EmployeeDto>> GetByDesignationIdAsync(int designationId)
        {
            _logger.LogInformation("Fetching active employees by DesignationID: {DesignationId}", designationId);
            return await GetActiveAsync(designationId);
        }

        public async Task<EmployeeDto?> GetByIdAsync(int id)
        {
            _logger.LogInformation("Fetching employee by ID: {Id}", id);

            var employee = await _context.Tbl_Employee
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .Include(e => e.WorkLocation)
                .Include(e => e.ReportingToManager)
                .Include(e => e.Level)
                .FirstOrDefaultAsync(e => e.ID == id && !e.IsDeleted);

            return employee == null ? null : MapToDto(employee);
        }

        public async Task<EmployeeDto?> GetByCodeAsync(string employeeCode)
        {
            _logger.LogInformation("Fetching employee by Code: {Code}", employeeCode);

            if (string.IsNullOrWhiteSpace(employeeCode))
                return null;

            var employee = await _context.Tbl_Employee
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .Include(e => e.WorkLocation)
                .Include(e => e.ReportingToManager)
                .Include(e => e.Level)
                .FirstOrDefaultAsync(e => e.EmployeeCode.ToLower() == employeeCode.Trim().ToLower() && !e.IsDeleted);

            return employee == null ? null : MapToDto(employee);
        }

        public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto)
        {
            _logger.LogInformation("Creating new employee with email: {Email}", dto.EmailAddress);

            // Check email uniqueness
            var emailExists = await _context.Tbl_Employee
                .AnyAsync(e => e.EmailAddress.ToLower() == dto.EmailAddress.Trim().ToLower() && !e.IsDeleted);

            if (emailExists)
            {
                throw new InvalidOperationException($"An employee with email '{dto.EmailAddress}' already exists.");
            }

            // Assign or validate employee code
            string code = string.IsNullOrWhiteSpace(dto.EmployeeCode)
                ? await GetNextEmployeeCodeAsync()
                : dto.EmployeeCode.Trim();

            var codeExists = await _context.Tbl_Employee
                .AnyAsync(e => e.EmployeeCode.ToLower() == code.ToLower() && !e.IsDeleted);

            if (codeExists)
            {
                throw new InvalidOperationException($"An employee with code '{code}' already exists.");
            }

            // Sanitize foreign keys to null if 0 or invalid/not found
            int? deptId = (dto.DepartmentID.HasValue && dto.DepartmentID.Value > 0) ? dto.DepartmentID.Value : null;
            if (deptId.HasValue && !await _context.Departments.AnyAsync(d => d.ID == deptId.Value))
            {
                deptId = null;
            }

            int? desigId = (dto.DesignationID.HasValue && dto.DesignationID.Value > 0) ? dto.DesignationID.Value : null;
            if (desigId.HasValue && !await _context.Designations.AnyAsync(d => d.ID == desigId.Value))
            {
                desigId = null;
            }

            int? locId = (dto.WorkLocationID.HasValue && dto.WorkLocationID.Value > 0) ? dto.WorkLocationID.Value : null;
            if (locId.HasValue && !await _context.WorkLocations.AnyAsync(l => l.ID == locId.Value))
            {
                locId = null;
            }

            int? repId = (dto.ReportingTo.HasValue && dto.ReportingTo.Value > 0) ? dto.ReportingTo.Value : null;
            if (repId.HasValue && !await _context.Tbl_Employee.AnyAsync(e => e.ID == repId.Value))
            {
                repId = null;
            }

            DateTime? dob = (dto.DateOfBirth.HasValue && dto.DateOfBirth.Value.Year >= 1900) ? dto.DateOfBirth.Value : null;
            DateTime? doj = (dto.DateOfJoining.HasValue && dto.DateOfJoining.Value.Year >= 1900) ? dto.DateOfJoining.Value : DateTime.UtcNow;

            var entity = new EmployeeEntity
            {
                EmployeeCode = code,
                FirstName = dto.FirstName.Trim(),
                MiddleName = dto.MiddleName?.Trim(),
                LastName = dto.LastName.Trim(),
                DateOfBirth = dob,
                Gender = dto.Gender,
                MobileNumber = string.IsNullOrWhiteSpace(dto.MobileNumber) ? "0000000000" : dto.MobileNumber.Trim(),
                EmailAddress = dto.EmailAddress.Trim(),
                PresentAddress = dto.PresentAddress?.Trim(),
                DateOfJoining = doj,
                WorkLocationID = locId,
                DepartmentID = deptId,
                DesignationID = desigId,
                ReportingTo = repId,
                LevelID = (dto.LevelID.HasValue && dto.LevelID.Value > 0) ? dto.LevelID.Value : null,
                PhotoPath = dto.PhotoPath,
                GoogleCalendarId = dto.GoogleCalendarId,
                UserId = dto.UserId,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            await _context.Tbl_Employee.AddAsync(entity);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(entity.ID) ?? MapToDto(entity);
        }

        public async Task<bool> UpdateAsync(int id, UpdateEmployeeDto dto)
        {
            _logger.LogInformation("Updating employee with ID: {Id}", id);

            var entity = await _context.Tbl_Employee
                .FirstOrDefaultAsync(e => e.ID == id && !e.IsDeleted);

            if (entity == null)
                return false;

            // Check email uniqueness if email has changed
            if (!string.Equals(entity.EmailAddress, dto.EmailAddress.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                var emailExists = await _context.Tbl_Employee
                    .AnyAsync(e => e.ID != id && e.EmailAddress.ToLower() == dto.EmailAddress.Trim().ToLower() && !e.IsDeleted);

                if (emailExists)
                {
                    throw new InvalidOperationException($"An employee with email '{dto.EmailAddress}' already exists.");
                }
            }

            // Check employee code uniqueness if code changed
            if (!string.IsNullOrWhiteSpace(dto.EmployeeCode) &&
                !string.Equals(entity.EmployeeCode, dto.EmployeeCode.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                var codeExists = await _context.Tbl_Employee
                    .AnyAsync(e => e.ID != id && e.EmployeeCode.ToLower() == dto.EmployeeCode.Trim().ToLower() && !e.IsDeleted);

                if (codeExists)
                {
                    throw new InvalidOperationException($"An employee with code '{dto.EmployeeCode}' already exists.");
                }

                entity.EmployeeCode = dto.EmployeeCode.Trim();
            }

            // Sanitize foreign keys
            int? deptId = (dto.DepartmentID.HasValue && dto.DepartmentID.Value > 0) ? dto.DepartmentID.Value : null;
            if (deptId.HasValue && !await _context.Departments.AnyAsync(d => d.ID == deptId.Value))
            {
                deptId = null;
            }

            int? desigId = (dto.DesignationID.HasValue && dto.DesignationID.Value > 0) ? dto.DesignationID.Value : null;
            if (desigId.HasValue && !await _context.Designations.AnyAsync(d => d.ID == desigId.Value))
            {
                desigId = null;
            }

            int? locId = (dto.WorkLocationID.HasValue && dto.WorkLocationID.Value > 0) ? dto.WorkLocationID.Value : null;
            if (locId.HasValue && !await _context.WorkLocations.AnyAsync(l => l.ID == locId.Value))
            {
                locId = null;
            }

            int? repId = (dto.ReportingTo.HasValue && dto.ReportingTo.Value > 0) ? dto.ReportingTo.Value : null;
            if (repId.HasValue && !await _context.Tbl_Employee.AnyAsync(e => e.ID == repId.Value))
            {
                repId = null;
            }

            DateTime? dob = (dto.DateOfBirth.HasValue && dto.DateOfBirth.Value.Year >= 1900) ? dto.DateOfBirth.Value : null;
            DateTime? doj = (dto.DateOfJoining.HasValue && dto.DateOfJoining.Value.Year >= 1900) ? dto.DateOfJoining.Value : entity.DateOfJoining;

            entity.FirstName = dto.FirstName.Trim();
            entity.MiddleName = dto.MiddleName?.Trim();
            entity.LastName = dto.LastName.Trim();
            entity.DateOfBirth = dob;
            entity.Gender = dto.Gender;
            entity.MobileNumber = string.IsNullOrWhiteSpace(dto.MobileNumber) ? entity.MobileNumber : dto.MobileNumber.Trim();
            entity.EmailAddress = dto.EmailAddress.Trim();
            entity.PresentAddress = dto.PresentAddress?.Trim();
            entity.DateOfJoining = doj;
            entity.WorkLocationID = locId;
            entity.DepartmentID = deptId;
            entity.DesignationID = desigId;
            entity.ReportingTo = repId;
            if (dto.LevelID.HasValue)
            {
                entity.LevelID = dto.LevelID.Value > 0 ? dto.LevelID.Value : null;
            }
            if (dto.PhotoPath != null)
            {
                entity.PhotoPath = dto.PhotoPath;
            }
            if (dto.GoogleCalendarId != null)
            {
                entity.GoogleCalendarId = dto.GoogleCalendarId;
            }
            entity.UserId = dto.UserId;
            entity.DateOfLeaving = dto.DateOfLeaving;
            entity.IsActive = dto.IsActive;

            _context.Tbl_Employee.Update(entity);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            _logger.LogInformation("Soft-deleting employee with ID: {Id}", id);

            var entity = await _context.Tbl_Employee
                .FirstOrDefaultAsync(e => e.ID == id && !e.IsDeleted);

            if (entity == null)
                return false;

            entity.IsDeleted = true;
            entity.IsActive = false;

            _context.Tbl_Employee.Update(entity);
            await _context.SaveChangesAsync();

            return true;
        }

        private static EmployeeDto MapToDto(EmployeeEntity e)
        {
            return new EmployeeDto
            {
                ID = e.ID,
                EmployeeCode = e.EmployeeCode,
                FirstName = e.FirstName,
                MiddleName = e.MiddleName,
                LastName = e.LastName,
                DateOfBirth = e.DateOfBirth,
                Gender = e.Gender,
                MobileNumber = e.MobileNumber,
                EmailAddress = e.EmailAddress,
                PresentAddress = e.PresentAddress,
                DateOfJoining = e.DateOfJoining,
                WorkLocationID = e.WorkLocationID,
                WorkLocationName = e.WorkLocation?.LocationName,
                DepartmentID = e.DepartmentID,
                DepartmentName = e.Department?.DepartmentName,
                DesignationID = e.DesignationID,
                DesignationName = e.Designation?.DesignationName,
                ReportingTo = e.ReportingTo,
                ReportingToName = e.ReportingToManager != null
                    ? $"{e.ReportingToManager.FirstName} {e.ReportingToManager.LastName}".Trim()
                    : null,
                LevelID = e.LevelID,
                LevelName = e.Level?.LevelName,
                PhotoPath = e.PhotoPath,
                GoogleCalendarId = e.GoogleCalendarId,
                UserId = e.UserId,
                DateOfLeaving = e.DateOfLeaving,
                IsActive = e.IsActive,
                IsDeleted = e.IsDeleted
            };
        }
    }
}
