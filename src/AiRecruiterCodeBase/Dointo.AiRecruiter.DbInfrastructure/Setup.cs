using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.DbInfrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

namespace Dointo.AiRecruiter.DbInfrastructure;

public static class Setup
{
	public static void AddDbInfrastructure(this IServiceCollection services, string connectionStringName, string aiRecruiterDbName)
	{
		services.AddScoped(sp =>
		{
			var configuration = sp.GetRequiredService<IConfiguration>( );
			var mongoClient = new MongoClient(configuration[connectionStringName]!);
			var options = new DbContextOptionsBuilder<AiRecruiterDbContext>( )
				.UseMongoDB(configuration[connectionStringName]!, configuration[aiRecruiterDbName]!)
				.Options;

			return new AiRecruiterDbContext(options, mongoClient.GetDatabase(configuration[aiRecruiterDbName]));
		});

		// ✅ Register repositories
		services.AddScoped<IReadOnlyRepository, ReadOnlyRepository>( );
		services.AddScoped<IWriteOnlyRepository, WriteOnlyRepository>( ); // ✅ Add this
		services.AddScoped<IJobPostRepository, JobPostRepository>( );
	}
}
