//using CompanyPlatform.Core.Data;
//using CompanyPlatform.Core.Models.CRM.Notification;
//using Microsoft.AspNetCore.SignalR;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.Extensions.DependencyInjection;
//using Microsoft.Extensions.Hosting;
//using Microsoft.Extensions.Logging;

//namespace CompanyPlatform.CRM.Services.Notification
//{
//    public class UpcomingEventNotificationService : BackgroundService
//    {
//        private readonly ILogger<UpcomingEventNotificationService> _logger;
//        private readonly IServiceProvider _serviceProvider;

//        public UpcomingEventNotificationService(ILogger<UpcomingEventNotificationService> logger, IServiceProvider serviceProvider)
//        {
//            _logger = logger;
//            _serviceProvider = serviceProvider;
//        }

//        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
//        {
//            _logger.LogInformation("UpcomingEventNotificationService is starting.");

//            while (!stoppingToken.IsCancellationRequested)
//            {
//                try
//                {
//                    _logger.LogInformation("UpcomingEventNotificationService is running at: {time}", DateTimeOffset.Now);
//                    await CheckAndCreateNotificationsAsync(stoppingToken);
//                }
//                catch (Exception ex)
//                {
//                    _logger.LogError(ex, "An error occurred during UpcomingEventNotificationService execution.");
//                }

//                // Run every 1 hour
//                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
//            }
//        }

//        private async Task CheckAndCreateNotificationsAsync(CancellationToken stoppingToken)
//        {
//            using var scope = _serviceProvider.CreateScope();
//            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDBContext>();
//            var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<NotificationHub>>();

//            // Business rule: Target events scheduled for the next calendar day
//            var tomorrow = DateTime.Today.AddDays(1);

//            int meetingsCount = 0;
//            int callsCount = 0;
//            int tasksCount = 0;
//            int remindersCount = 0;

//            _logger.LogInformation($"Checking upcoming events for tomorrow: {tomorrow:yyyy-MM-dd}");

//            // 1. Meetings
//            var meetings = await dbContext.Set<Model.Meeting>()
//                .Where(m => !m.IsDeleted && m.IsActive && m.MeetingDate.Date == tomorrow)
//                .ToListAsync(stoppingToken);

//            foreach (var meeting in meetings)
//            {
//                var message = $"Meeting Tomorrow: {meeting.Agenda ?? "Scheduled Meeting"} at {meeting.MeetingTime:hh\\:mm\\ ss}";
//                bool created = await TryCreateNotificationAsync(dbContext, hubContext, meeting.UserId, "Meeting", meeting.MeetingId, message, null);
//                if (created) meetingsCount++;
//            }

//            // 2. Calls
//            var calls = await dbContext.Set<Model.Call>()
//                .Where(c => !c.IsDeleted && c.Status.ToLower() != "completed" && c.Status.ToLower() != "cancelled" && c.NextFollowUpDate.HasValue && c.NextFollowUpDate.Value.Date == tomorrow)
//                .ToListAsync(stoppingToken);

//            foreach (var call in calls)
//            {
//                var message = $"Call Follow-up Tomorrow: {call.Remarks ?? "Scheduled Call"}";
//                bool created = await TryCreateNotificationAsync(dbContext, hubContext, call.UserId, "Call", call.CallId, message, null);
//                if (created) callsCount++;
//            }

//            // 3. Tasks
//            var tasks = await dbContext.Set<Model.Tasks>()
//                .Include(t => t.TaskStatus)
//                .Where(t => !t.IsDeleted && t.TaskStatus.StatusName.ToLower() != "completed" && t.TaskStatus.StatusName.ToLower() != "cancelled" && t.DueDate.Date == tomorrow)
//                .ToListAsync(stoppingToken);

//            foreach (var task in tasks)
//            {
//                var message = $"Task Due Tomorrow: {task.TaskTitle}";
//                bool created = await TryCreateNotificationAsync(dbContext, hubContext, task.AssignedTo, "Task", task.TaskId, message, task.ReminderId);
//                if (created) tasksCount++;
//            }

//            // 4. Reminders
//            var reminders = await dbContext.Set<Reminder>()
//                .Where(r => !r.IsDeleted && r.IsActive && r.ReminderDate.Date == tomorrow)
//                .ToListAsync(stoppingToken);

//            foreach (var reminder in reminders)
//            {
//                var message = $"Reminder Tomorrow: {reminder.Title} at {reminder.ReminderTime:hh\\:mm\\ ss}";
//                bool created = await TryCreateNotificationAsync(dbContext, hubContext, reminder.AssignedTo, "Reminder", reminder.ReminderId, message, reminder.ReminderId);
//                if (created) remindersCount++;
//            }

//            _logger.LogInformation($"Notification processing complete. Meetings: {meetingsCount}, Calls: {callsCount}, Tasks: {tasksCount}, Reminders: {remindersCount}");
//        }

//        private async Task<bool> TryCreateNotificationAsync(
//            ApplicationDBContext dbContext,
//            IHubContext<NotificationHub> hubContext,
//            int employeeId,
//            string entityType,
//            int entityId,
//            string message,
//            int? reminderId)
//        {
//            try
//            {
//                // Idempotency / Duplicate Check
//                // We check if a notification for this entity already exists in the last 24 hours.
//                var timeLimit = DateTime.UtcNow.AddHours(-24);
//                bool exists = await dbContext.Tbl_Notifications.AnyAsync(n =>
//                    n.EntityType == entityType &&
//                    n.EntityId == entityId &&
//                    n.CreatedAt >= timeLimit &&
//                    n.Message.Contains("Tomorrow"));

//                if (exists) return false;

//                // Create user-facing notification
//                var notification = new Notifications
//                {
//                    EmployeeId = employeeId,
//                    Message = message,
//                    EntityType = entityType,
//                    EntityId = entityId,
//                    CreatedAt = DateTime.UtcNow,
//                    IsRead = false
//                };

//                await dbContext.Tbl_Notifications.AddAsync(notification);

//                // Create audit record in NotificationLogs
//                var log = new Model.NotificationLogs
//                {
//                    UserId = employeeId,
//                    NotificationType = entityType,
//                    NotificationMessage = message,
//                    NotificationDate = DateTime.Now,
//                    ReminderId = reminderId,
//                    Status = "Sent",
//                    CreatedBy = employeeId, // System generated but tied to assigned user
//                    CreatedDate = DateTime.Now,
//                    IsActive = true,
//                    IsDeleted = false
//                };

//                await dbContext.Set<Model.NotificationLogs>().AddAsync(log);

//                // Only create ReminderNotification if a REAL reminder exists
//                if (reminderId.HasValue)
//                {
//                    var remNotif = new Model.ReminderNotification
//                    {
//                        ReminderId = reminderId.Value,
//                        NotificationStatus = "Sent",
//                        NotificationType = "In-App",
//                        NotificationDate = DateTime.Now,
//                        SentBy = employeeId,
//                        IsActive = true
//                    };
//                    await dbContext.Set<Model.ReminderNotification>().AddAsync(remNotif);
//                }

//                await dbContext.SaveChangesAsync();

//                // Attempt SignalR push
//                try
//                {
//                    await hubContext.Clients.User(employeeId.ToString()).SendAsync("ReceiveNotification", notification);
//                }
//                catch (Exception sigEx)
//                {
//                    _logger.LogWarning(sigEx, $"SignalR delivery failed for user {employeeId}, but DB notification was saved.");
//                }

//                return true;
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, $"Error creating notification for {entityType} ID {entityId} to User {employeeId}");
//                return false;
//            }
//        }
//    }
//}




//using CompanyPlatform.Core.Data;
////using CompanyPlatform.Core.Models.CRM.Notification;
//using CompanyPlatform.Core.Models.CRM.Notification;
//using NotificationLogsEntity =
//    CompanyPlatform.Core.Models.CRM.Notification.NotificationLogs;
//using Microsoft.AspNetCore.SignalR;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.Extensions.DependencyInjection;
//using Microsoft.Extensions.Hosting;
//using Microsoft.Extensions.Logging;

//namespace CompanyPlatform.CRM.Services.Notification
//{
//    public class UpcomingEventNotificationService : BackgroundService
//    {
//        private readonly ILogger<UpcomingEventNotificationService> _logger;
//        private readonly IServiceProvider _serviceProvider;

//        public UpcomingEventNotificationService(
//            ILogger<UpcomingEventNotificationService> logger,
//            IServiceProvider serviceProvider)
//        {
//            _logger = logger;
//            _serviceProvider = serviceProvider;
//        }

//        protected override async Task ExecuteAsync(
//            CancellationToken stoppingToken)
//        {
//            _logger.LogInformation(
//                "UpcomingEventNotificationService is starting.");

//            while (!stoppingToken.IsCancellationRequested)
//            {
//                try
//                {
//                    _logger.LogInformation(
//                        "UpcomingEventNotificationService is running at: {Time}",
//                        DateTimeOffset.Now);

//                    await CheckAndCreateNotificationsAsync(
//                        stoppingToken);
//                }
//                catch (OperationCanceledException)
//                    when (stoppingToken.IsCancellationRequested)
//                {
//                    break;
//                }
//                catch (Exception ex)
//                {
//                    _logger.LogError(
//                        ex,
//                        "An error occurred during UpcomingEventNotificationService execution.");
//                }

//                try
//                {
//                    await Task.Delay(
//                        TimeSpan.FromHours(1),
//                        stoppingToken);
//                }
//                catch (OperationCanceledException)
//                {
//                    break;
//                }
//            }

//            _logger.LogInformation(
//                "UpcomingEventNotificationService stopped.");
//        }

//        private async Task CheckAndCreateNotificationsAsync(
//            CancellationToken stoppingToken)
//        {
//            using var scope =
//                _serviceProvider.CreateScope();

//            var dbContext =
//                scope.ServiceProvider
//                    .GetRequiredService<ApplicationDBContext>();

//            var hubContext =
//                scope.ServiceProvider
//                    .GetRequiredService<IHubContext<NotificationHub>>();

//            var tomorrow =
//                DateTime.Today.AddDays(1);

//            int meetingsCount = 0;
//            int callsCount = 0;
//            int tasksCount = 0;
//            int remindersCount = 0;

//            _logger.LogInformation(
//                "Checking upcoming events for tomorrow: {Date}",
//                tomorrow.ToString("yyyy-MM-dd"));

//            // =====================================================
//            // 1. MEETINGS
//            // =====================================================

//            var meetings = await dbContext
//                .Set<Model.Meeting>()
//                .Where(m =>
//                    !m.IsDeleted &&
//                    m.IsActive &&
//                    m.MeetingDate.Date == tomorrow)
//                .ToListAsync(stoppingToken);

//            foreach (var meeting in meetings)
//            {
//                var message =
//                    $"Meeting Tomorrow: " +
//                    $"{meeting.Agenda ?? "Scheduled Meeting"} " +
//                    $"at {meeting.MeetingTime:hh\\:mm\\ ss}";

//                bool created =
//                    await TryCreateNotificationAsync(
//                        dbContext,
//                        hubContext,
//                        meeting.UserId,
//                        "Meeting",
//                        meeting.MeetingId,
//                        message);

//                if (created)
//                {
//                    meetingsCount++;
//                }
//            }

//            // =====================================================
//            // 2. CALLS
//            // =====================================================

//            var calls = await dbContext
//                .Set<Model.Call>()
//                .Where(c =>
//                    !c.IsDeleted &&
//                    c.Status.ToLower() != "completed" &&
//                    c.Status.ToLower() != "cancelled" &&
//                    c.NextFollowUpDate.HasValue &&
//                    c.NextFollowUpDate.Value.Date == tomorrow)
//                .ToListAsync(stoppingToken);

//            foreach (var call in calls)
//            {
//                var message =
//                    $"Call Follow-up Tomorrow: " +
//                    $"{call.Remarks ?? "Scheduled Call"}";

//                bool created =
//                    await TryCreateNotificationAsync(
//                        dbContext,
//                        hubContext,
//                        call.UserId,
//                        "Call",
//                        call.CallId,
//                        message);

//                if (created)
//                {
//                    callsCount++;
//                }
//            }

//            // =====================================================
//            // 3. TASKS
//            // =====================================================

//            var tasks = await dbContext
//                .Set<Model.Tasks>()
//                .Include(t => t.TaskStatus)
//                .Where(t =>
//                    !t.IsDeleted &&
//                    t.TaskStatus.StatusName.ToLower() != "completed" &&
//                    t.TaskStatus.StatusName.ToLower() != "cancelled" &&
//                    t.DueDate.Date == tomorrow)
//                .ToListAsync(stoppingToken);

//            foreach (var task in tasks)
//            {
//                var message =
//                    $"Task Due Tomorrow: {task.TaskTitle}";

//                bool created =
//                    await TryCreateNotificationAsync(
//                        dbContext,
//                        hubContext,
//                        task.AssignedTo,
//                        "Task",
//                        task.TaskId,
//                        message);

//                if (created)
//                {
//                    tasksCount++;
//                }
//            }

//            // =====================================================
//            // 4. REMINDERS
//            // =====================================================

//            var reminders = await dbContext
//                .Set<Reminder>()
//                .Where(r =>
//                    !r.IsDeleted &&
//                    r.IsActive &&
//                    r.ReminderDate.Date == tomorrow)
//                .ToListAsync(stoppingToken);

//            foreach (var reminder in reminders)
//            {
//                var message =
//                    $"Reminder Tomorrow: " +
//                    $"{reminder.Title} " +
//                    $"at {reminder.ReminderTime:hh\\:mm\\ ss}";

//                bool created =
//                    await TryCreateNotificationAsync(
//                        dbContext,
//                        hubContext,
//                        reminder.AssignedTo,
//                        "Reminder",
//                        reminder.ReminderId,
//                        message);

//                if (created)
//                {
//                    remindersCount++;
//                }
//            }

//            _logger.LogInformation(
//                "Notification processing complete. " +
//                "Meetings: {Meetings}, Calls: {Calls}, " +
//                "Tasks: {Tasks}, Reminders: {Reminders}",
//                meetingsCount,
//                callsCount,
//                tasksCount,
//                remindersCount);
//        }

//        private async Task<bool> TryCreateNotificationAsync(
//            ApplicationDBContext dbContext,
//            IHubContext<NotificationHub> hubContext,
//            int employeeId,
//            string entityType,
//            int entityId,
//            string message)
//        {
//            try
//            {
//                // =================================================
//                // CHECK DUPLICATE NOTIFICATION
//                // =================================================

//                var timeLimit =
//                    DateTime.UtcNow.AddHours(-24);

//                bool exists =
//                    await dbContext.Tbl_Notifications
//                        .AnyAsync(
//                            n =>
//                                n.EntityType == entityType &&
//                                n.EntityId == entityId &&
//                                n.CreatedAt >= timeLimit &&
//                                n.Message.Contains("Tomorrow"),
//                            CancellationToken.None);

//                if (exists)
//                {
//                    return false;
//                }

//                // =================================================
//                // CREATE NOTIFICATION
//                // =================================================

//                var notification =
//                    new Notifications
//                    {
//                        EmployeeId = employeeId,
//                        Message = message,
//                        EntityType = entityType,
//                        EntityId = entityId,
//                        CreatedAt = DateTime.UtcNow,
//                        IsRead = false
//                    };

//                await dbContext.Tbl_Notifications.AddAsync(
//                    notification);

//                // =================================================
//                // CREATE NOTIFICATION LOG
//                // =================================================

//                var log =
//                    new NotificationLogs
//                    {
//                        UserId = employeeId.ToString(),
//                        Action = entityType,
//                        Description = message,
//                        CreatedBy = employeeId,
//                        CreatedAt = DateTime.UtcNow
//                    };

//                await dbContext.NotificationLogs.AddAsync(log);

//                // =================================================
//                // SAVE
//                // =================================================

//                await dbContext.SaveChangesAsync();

//                // =================================================
//                // SIGNALR
//                // =================================================

//                try
//                {
//                    await hubContext.Clients
//                        .User(employeeId.ToString())
//                        .SendAsync(
//                            "ReceiveNotification",
//                            notification);
//                }
//                catch (Exception signalRException)
//                {
//                    _logger.LogWarning(
//                        signalRException,
//                        "SignalR delivery failed for employee {EmployeeId}. Database notification was saved.",
//                        employeeId);
//                }

//                return true;
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(
//                    ex,
//                    "Error creating notification for {EntityType} ID {EntityId} for employee {EmployeeId}.",
//                    entityType,
//                    entityId,
//                    employeeId);

//                return false;
//            }
//        }
//    }
//}

