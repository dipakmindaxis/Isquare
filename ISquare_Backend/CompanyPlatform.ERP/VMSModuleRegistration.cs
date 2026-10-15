using Microsoft.Extensions.DependencyInjection;

namespace CompanyPlatform.VMS
{
    public static class VMSModule
    {
        public static IServiceCollection AddVMSModule(
            this IServiceCollection services)
        {
            // VMS services will be added here later
            return services;
        }
    }
}