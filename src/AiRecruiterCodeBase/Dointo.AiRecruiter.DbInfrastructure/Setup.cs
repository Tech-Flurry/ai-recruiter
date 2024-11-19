using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.DbInfrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Dointo.AiRecruiter.DbInfrastructure;
public static class Setup
{
	public static void AddDbInfrastructure(this IServiceCollection services, string connectionStringName, string aiRecruiterDbName)
	{
		services.AddScoped(sp =>
		{
			var configuration = sp.GetRequiredService<IConfiguration>( );
			var options = new DbContextOptionsBuilder<AiRecruiterDbContext>( ).UseMongoDB(configuration[connectionStringName]!, configuration[aiRecruiterDbName]!).Options;
			return new AiRecruiterDbContext(options);
		});

		// Registering the repositories
		services.AddScoped<IReadOnlyRepository, ReadOnlyRepository>( );
		services.AddScoped<IDummyRepository, DummyRepository>( );
	}
}
