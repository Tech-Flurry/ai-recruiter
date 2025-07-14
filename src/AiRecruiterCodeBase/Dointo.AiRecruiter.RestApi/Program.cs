using Dointo.AiRecruiter.AiInfrastructure.Config;
using Dointo.AiRecruiter.Application;
using Dointo.AiRecruiter.Application.Services;
using Dointo.AiRecruiter.DbInfrastructure;
using Dointo.AiRecruiter.RestApi.Middleware;
using Dointo.AiRecruiter.RestApi.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
	options.AddDefaultPolicy(policy =>
	{
		var clientsUrls = builder.Configuration.GetSection("ClientUrls").Get<string[ ]>( ) ?? [ ];
		foreach (var url in clientsUrls)
			policy.WithOrigins(url);
		policy.AllowAnyMethod( )
			  .AllowAnyHeader( )
			  .AllowCredentials( );
	});
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options =>
	{
		var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!);
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuerSigningKey = true,
			IssuerSigningKey = new SymmetricSecurityKey(key),
			ValidateLifetime = true,
			ValidIssuer = builder.Configuration["Jwt:Issuer"],
			ValidateIssuer = true,
			ValidateAudience = false
		};
	});
builder.Services.AddSingleton<ITokenService, TokenService>( );
builder.Services.AddAuthorization( );
builder.Services.AddControllers( );
builder.Services.AddEndpointsApiExplorer( );
builder.Services.AddSwaggerGen(c =>
{
	c.SwaggerDoc("v1", new OpenApiInfo
	{
		Title = "AI Recruiter API",
		Version = "v1",
		Description = "Backend API for the AI-based recruitment system"
	});
	c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
	{
		Description = "Insert the JWT token as: Bearer {your token}",
		Name = "Authorization",
		In = ParameterLocation.Header,
		Type = SecuritySchemeType.Http,
		Scheme = "bearer",
		BearerFormat = "JWT"
	});
	c.AddSecurityRequirement(new OpenApiSecurityRequirement
	{
		{
			new OpenApiSecurityScheme
			{
				Reference = new OpenApiReference
				{
					Id = "Bearer",
					Type = ReferenceType.SecurityScheme,
				}
			},
			new List<string>()
		}
	});
});

// ✅ Register Mongo + App dependencies
builder.Services.AddDbInfrastructure("MongoDb:ConnectionString", "MongoDb:DatabaseName");
builder.Services.AddApplication( );
builder.Services.AddAiInfrastructure(builder.Configuration["AiDetectorBaseUrl"]!, "OpenAi");


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

app.UseMiddleware<UnitOfWorkMiddleware>( );
app.UseHttpsRedirection( );
app.UseRouting( );

app.UseCors( );
app.UseAuthentication( );
app.UseAuthorization( );
app.MapControllers( );

await app.RunAsync( );
