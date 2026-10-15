using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace CompanyPlatform.CRM.Services.Notification
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly IUserConnectionService
            _userConnectionService;

        public NotificationHub(
            IUserConnectionService userConnectionService)
        {
            _userConnectionService =
                userConnectionService;
        }

        public override async Task OnConnectedAsync()
        {
            var employeeIdString =
                Context.User?
                    .FindFirstValue("EmployeeId");

            if (int.TryParse(
                    employeeIdString,
                    out var employeeId))
            {
                _userConnectionService
                    .AddUserConnection(
                        employeeId,
                        Context.ConnectionId);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(
            Exception? exception)
        {
            var employeeIdString =
                Context.User?
                    .FindFirstValue("EmployeeId");

            if (int.TryParse(
                    employeeIdString,
                    out var employeeId))
            {
                _userConnectionService
                    .RemoveUserConnection(employeeId);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}