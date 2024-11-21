using Dointo.AiRecruiter.Application;
using Dointo.AiRecruiter.DbInfrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers( );
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi( );
builder.Services.AddApplication( );
builder.Services.AddDbInfrastructure("MongoDb:ConnectionString", "MongoDb:DatabaseName");

var app = builder.Build( );

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment( ))
{
	app.UseDeveloperExceptionPage( );
	app.MapOpenApi( );
	app.UseSwaggerUI(op => op.SwaggerEndpoint("/openapi/v1.json", "Version 1"));
}

app.UseHttpsRedirection( );

app.UseAuthorization( );

app.MapControllers( );

await app.RunAsync( );
