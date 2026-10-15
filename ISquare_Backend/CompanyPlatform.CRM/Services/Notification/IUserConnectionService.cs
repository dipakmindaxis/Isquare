//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.Services.Notification
//{
//    internal class IUserConnectionService
//    {
//        void AddUserConnection(int employeeId, string connectionId);
//        void RemoveUserConnection(int employeeId);
//        string GetUserConnection(int employeeId);

//    }
//}

namespace CompanyPlatform.CRM.Services.Notification
{
    public interface IUserConnectionService
    {
        void AddUserConnection(
            int employeeId,
            string connectionId);

        void RemoveUserConnection(
            int employeeId);

        string? GetUserConnection(
            int employeeId);
    }
}