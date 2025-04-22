using Dointo.AiRecruiter.Application;
using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.DbInfrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using MongoFramework;

var builder = WebApplication.CreateBuilder(args);

// ✅ CORS policy
const string corsPolicyName = "AllowAll";
builder.Services.AddCors(options =>
{
	options.AddPolicy(corsPolicyName, policy =>
	{
		policy.AllowAnyOrigin( )
			  .AllowAnyMethod( )
			  .AllowAnyHeader( );
	});
});

// ✅ Controllers
builder.Services.AddControllers( );

// ✅ Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer( );
builder.Services.AddSwaggerGen(c =>
{
	c.SwaggerDoc("v1", new OpenApiInfo
	{
		Title = "AI Recruiter API",
		Version = "v1",
		Description = "Backend API for the AI-based recruitment system"
	});
});

// ✅ MongoFramework DB Context Registration
string? mongoConnStr = builder.Configuration["MongoDb:ConnectionString"];
string? mongoDbName = builder.Configuration["MongoDb:DatabaseName"];

if (string.IsNullOrEmpty(mongoConnStr) || string.IsNullOrEmpty(mongoDbName))
	throw new InvalidOperationException("MongoDb connection details are missing in configuration.");

builder.Services.AddDbContext<AiRecruiterDbContext>(options =>
	options.UseMongoDB(mongoConnStr, mongoDbName));

// ✅ Repositories
builder.Services.AddScoped<IJobPostRepository, JobPostRepository>( );
builder.Services.AddScoped<IDummyRepository, DummyRepository>( );

// ✅ App Layer
builder.Services.AddApplication( );

var app = builder.Build( );

// ✅ Middleware
if (app.Environment.IsDevelopment( ))
{
	app.UseDeveloperExceptionPage( );

	app.UseSwagger( );
	app.UseSwaggerUI(c =>
	{
		c.SwaggerEndpoint("/swagger/v1/swagger.json", "AI Recruiter API v1");
		c.RoutePrefix = "swagger";
	});
}

app.UseHttpsRedirection( );
app.UseRouting( );
app.UseCors(corsPolicyName);
app.UseAuthorization( );
app.MapControllers( );

await app.RunAsync( );
