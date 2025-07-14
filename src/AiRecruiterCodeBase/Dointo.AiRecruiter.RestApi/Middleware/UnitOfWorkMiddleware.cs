using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.DbInfrastructure.Database;

namespace Dointo.AiRecruiter.RestApi.Middleware;

public class UnitOfWorkMiddleware(RequestDelegate next, ILogger<UnitOfWorkMiddleware> logger)
{
	private readonly RequestDelegate _next = next;
	private readonly ILogger<UnitOfWorkMiddleware> _logger = logger;

	public async Task InvokeAsync(HttpContext context, AiRecruiterDbContext dbContext)
	{
		try
		{
			await _next(context);
			if (dbContext.ChangeTracker.HasChanges( ))
			{
				if (context.User.Identity?.IsAuthenticated == true)
					await dbContext.SaveChangesAsync(context.User);
				else
					await dbContext.SaveChangesAsync( );
			}
		}
		catch (Exception ex)
		{
			if (!context.Response.HasStarted)
			{
				context.Response.StatusCode = StatusCodes.Status500InternalServerError;
				context.Response.ContentType = "application/json";
				var error = new ErrorState("An error occurred while processing your request.");
				await context.Response.WriteAsJsonAsync(error);
			}
			else
			{
				_logger.LogWarning("The response has already started, the error handler will not be executed.");
			}
			_logger.LogError(ex, "Transaction failed. Rolling back.");
		}
	}
}
