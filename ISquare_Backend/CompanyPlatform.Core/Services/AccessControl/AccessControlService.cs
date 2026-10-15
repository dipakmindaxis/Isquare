using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.AccessControl;

using AccessControlEntity =
 CompanyPlatform.Core.Models.CRM.Company.AccessControl;

namespace CompanyPlatform.Core.Services.AccessControl
{
    public class AccessControlService : IAccessControlService
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<AccessControlService> _logger;

        private static readonly Dictionary<string, List<string>> SystemForms =
            new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
            {
                ["RSM"] = new List<string>
                {
                    "Dashboard"
                },

                ["HRMS"] = new List<string>
                {
                    "Dashboard",
                    "Employee",
                    "AccessControl",
                    "BasicMasters"
                },

                ["VMS"] = new List<string>
                {
                    "Dashboard"
                }
            };

        public AccessControlService(
            ApplicationDBContext context,
            ILogger<AccessControlService> logger)
        {
            _context = context;
            _logger = logger;
        }


        // ---------------------------------------------------------
        // GET PERMISSIONS BY ROLE AND SYSTEM
        // ---------------------------------------------------------

        public async Task<List<AccessControlDto>>
            GetPermissionsByRoleAndSystemAsync(
                string roleId,
                string systemName)
        {
            _logger.LogInformation(
                "Fetching permissions for RoleId: {RoleId}, System: {SystemName}",
                roleId,
                systemName);


            var forms = SystemForms.ContainsKey(systemName)
                ? SystemForms[systemName]
                : new List<string>();


            var existingPermissions =
                await _context.Tbl_AccessControls
                    .Where(p =>
                        p.RoleId == roleId &&
                        p.SystemName.ToLower() == systemName.ToLower() &&
                        !p.IsDeleted)
                    .ToListAsync();


            var result = new List<AccessControlDto>();


            foreach (var formName in forms)
            {
                var permission = existingPermissions
                    .FirstOrDefault(p =>
                        p.FormName.ToLower() == formName.ToLower());


                result.Add(new AccessControlDto
                {
                    SystemName = systemName,
                    FormName = formName,

                    CanView = permission?.CanView ?? false,
                    CanAdd = permission?.CanAdd ?? false,
                    CanEdit = permission?.CanEdit ?? false,
                    CanDelete = permission?.CanDelete ?? false
                });
            }


            return result;
        }


        // ---------------------------------------------------------
        // GET ALL PERMISSIONS BY ROLE
        // ---------------------------------------------------------

        public async Task<List<AccessControlDto>>
            GetAllPermissionsByRoleAsync(string roleId)
        {
            _logger.LogInformation(
                "Fetching all permissions for RoleId: {RoleId}",
                roleId);


            return await _context.Tbl_AccessControls
                .Where(ac =>
                    ac.RoleId == roleId &&
                    !ac.IsDeleted)
                .Select(ac => new AccessControlDto
                {
                    SystemName = ac.SystemName,
                    FormName = ac.FormName,

                    CanView = ac.CanView,
                    CanAdd = ac.CanAdd,
                    CanEdit = ac.CanEdit,
                    CanDelete = ac.CanDelete
                })
                .ToListAsync();
        }


        // ---------------------------------------------------------
        // UPDATE PERMISSIONS
        // ---------------------------------------------------------

        public async Task UpdatePermissionsAsync(
            string roleId,
            string systemName,
            List<AccessControlDto> permissions)
        {
            _logger.LogInformation(
                "Updating permissions for RoleId: {RoleId}, System: {SystemName}",
                roleId,
                systemName);


            var existingPermissions =
                await _context.Tbl_AccessControls
                    .Where(ac =>
                        ac.RoleId == roleId &&
                        ac.SystemName == systemName)
                    .ToListAsync();


            foreach (var dto in permissions)
            {
                var existing = existingPermissions
                    .FirstOrDefault(p =>
                        p.FormName.ToLower() ==
                        dto.FormName.ToLower());


                if (existing != null)
                {
                    // Update existing permission
                    existing.CanView = dto.CanView;
                    existing.CanAdd = dto.CanAdd;
                    existing.CanEdit = dto.CanEdit;
                    existing.CanDelete = dto.CanDelete;

                    // Restore if previously deleted
                    existing.IsDeleted = false;
                }
                else
                {
                    // Create new permission
                    var newPermission = new AccessControlEntity
                    {
                        RoleId = roleId,
                        SystemName = systemName,
                        FormName = dto.FormName,

                        CanView = dto.CanView,
                        CanAdd = dto.CanAdd,
                        CanEdit = dto.CanEdit,
                        CanDelete = dto.CanDelete,

                        IsDeleted = false
                    };


                    await _context.Tbl_AccessControls
                        .AddAsync(newPermission);
                }
            }


            await _context.SaveChangesAsync();


            _logger.LogInformation(
                "Permissions updated successfully for RoleId: {RoleId}",
                roleId);
        }

        // ---------------------------------------------------------
        // DELETE PERMISSION
        // ---------------------------------------------------------

        public async Task DeletePermissionAsync(
            string roleId,
            string systemName,
            string formName)
        {
            _logger.LogInformation(
                "Deleting permission. RoleId: {RoleId}, System: {SystemName}, Form: {FormName}",
                roleId,
                systemName,
                formName);


            var permission =
                await _context.Tbl_AccessControls
                    .FirstOrDefaultAsync(p =>
                        p.RoleId == roleId &&
                        p.SystemName.ToLower() ==
                            systemName.ToLower() &&
                        p.FormName.ToLower() ==
                            formName.ToLower() &&
                        !p.IsDeleted);


            if (permission != null)
            {
                // Soft delete
                permission.IsDeleted = true;

                await _context.SaveChangesAsync();


                _logger.LogInformation(
                    "Permission deleted successfully.");
            }
        }
    }
}



//using Microsoft.EntityFrameworkCore;
//using Microsoft.Extensions.Logging;
//using CompanyPlatform.Core.Data;
//using CompanyPlatform.Core.DTO.AccessControl;

//namespace CompanyPlatform.Core.Services.AccessControl
//{
//    public class AccessControlService : IAccessControlService
//    {
//        private readonly ApplicationDBContext _context;

//        private static readonly Dictionary<string, List<string>> SystemForms =
//    new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
//    {
//        ["RSM"] = new List<string>
//    {
//        "Dashboard"
//    },

//        ["HRMS"] = new List<string>
//    {
//        "Dashboard","Employee",
//        "AccessControl","BasicMasters"

//    },

//        ["VMS"] = new List<string>
//    {
//        "Dashboard"
//    }
//    };



//        private readonly ILogger<AccessControlService> _logger;

//        public AccessControlService(ApplicationDBContext context, ILogger<AccessControlService> logger)
//        {
//            _context = context;
//            _logger = logger;
//        }



//        public async Task<List<AccessControlDto>> GetPermissionsByRoleAndSystemAsync(string roleId, string systemName)
//        {
//            var forms = SystemForms.ContainsKey(systemName)
//                ? SystemForms[systemName]
//                : new List<string>();

//            var existingPermissions = await _context.Tbl_AccessControls
//                .Where(p => p.RoleId == roleId &&
//                            p.SystemName.ToLower() == systemName.ToLower() &&
//                            p.IsDeleted == false)
//                .ToListAsync();

//            var result = new List<AccessControlDto>();

//            foreach (var formName in forms)
//            {
//                var permission = existingPermissions
//                    .FirstOrDefault(p => p.FormName.ToLower() == formName.ToLower());

//                result.Add(new AccessControlDto
//                {
//                    SystemName = systemName,
//                    FormName = formName,
//                    CanView = permission?.CanView ?? false,
//                    CanAdd = permission?.CanAdd ?? false,
//                    CanEdit = permission?.CanEdit ?? false,
//                    CanDelete = permission?.CanDelete ?? false
//                });
//            }

//            return result;
//        }


//        public async Task<List<AccessControlDto>> GetAllPermissionsByRoleAsync(string roleId)
//        {
//            _logger.LogInformation("Fetching all permissions for RoleId: {RoleId}", roleId);

//            return await _context.Tbl_AccessControls
//                .Where(ac => ac.RoleId == roleId)
//                .Select(ac => new AccessControlDto
//                {
//                    SystemName = ac.SystemName,
//                    FormName = ac.FormName,
//                    CanView = ac.CanView,
//                    CanAdd = ac.CanAdd,
//                    CanEdit = ac.CanEdit,
//                    CanDelete = ac.CanDelete
//                })
//                .ToListAsync();
//        }


//        public async Task UpdatePermissionsAsync(string roleId, string systemName, List<AccessControlDto> permissions)
//        {
//            var existingPermissions = await _context.Tbl_AccessControls
//                .Where(ac => ac.RoleId == roleId && ac.SystemName == systemName)
//                .ToListAsync();

//            foreach (var dto in permissions)
//            {
//                var existing = existingPermissions
//                    .FirstOrDefault(p => p.FormName.ToLower() == dto.FormName.ToLower());

//                if (existing != null)
//                {
//                    existing.CanView = dto.CanView;
//                    existing.CanAdd = dto.CanAdd;
//                    existing.CanEdit = dto.CanEdit;
//                    existing.CanDelete = dto.CanDelete;
//                    existing.IsDeleted = false; // 🔥 restore if previously deleted
//                }
//                else
//                {
//                    await _context.Tbl_AccessControls.AddAsync(new Models.AccessControl
//                    {
//                        RoleId = roleId,
//                        SystemName = systemName,
//                        FormName = dto.FormName,
//                        CanView = dto.CanView,
//                        CanAdd = dto.CanAdd,
//                        CanEdit = dto.CanEdit,
//                        CanDelete = dto.CanDelete,
//                        IsDeleted = false
//                    });
//                }
//            }

//            await _context.SaveChangesAsync();
//        }

//        public async Task DeletePermissionAsync(string roleId, string systemName, string formName)
//        {
//            var permission = await _context.Tbl_AccessControls
//                .FirstOrDefaultAsync(p =>
//                    p.RoleId == roleId &&
//                    p.SystemName.ToLower() == systemName.ToLower() &&
//                    p.FormName.ToLower() == formName.ToLower());

//            if (permission != null)
//            {
//                permission.IsDeleted = true;
//                await _context.SaveChangesAsync();
//            }
//        }


//    }
//}