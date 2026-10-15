//using System;
//using System.Collections.Concurrent;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.Services.Notification
//{
//    public class UserConnectionService : IUserConnectionService
//    {
//        private readonly ConcurrentDictionary<int, string> _userConnections = new ConcurrentDictionary<int, string>();

//        public void AddUserConnection(int employeeId, string connectionId)
//        {
//            _userConnections[employeeId] = connectionId;
//        }

//        public string GetUserConnection(int employeeId)
//        {
//            _userConnections.TryGetValue(employeeId, out var connectionId);
//            return connectionId;
//        }

//        public void RemoveUserConnection(int employeeId)
//        {
//            _userConnections.TryRemove(employeeId, out _);
//        }
//    }
//}


using System.Collections.Concurrent;

namespace CompanyPlatform.CRM.Services.Notification
{
    public class UserConnectionService : IUserConnectionService
    {
        private readonly ConcurrentDictionary<int, string>
            _userConnections = new();

        public void AddUserConnection(
            int employeeId,
            string connectionId)
        {
            _userConnections[employeeId] = connectionId;
        }

        public string? GetUserConnection(
            int employeeId)
        {
            _userConnections.TryGetValue(
                employeeId,
                out var connectionId);

            return connectionId;
        }

        public void RemoveUserConnection(
            int employeeId)
        {
            _userConnections.TryRemove(
                employeeId,
                out _);
        }
    }
}