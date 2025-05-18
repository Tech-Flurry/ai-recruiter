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
			await dbContext.SaveChangesAsync( );
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Transaction failed. Rolling back.");
			context.Response.StatusCode = StatusCodes.Status500InternalServerError;
			await context.Response.WriteAsJsonAsync(new ErrorState("An error occurred while processing your request."));
		}
	}
}
