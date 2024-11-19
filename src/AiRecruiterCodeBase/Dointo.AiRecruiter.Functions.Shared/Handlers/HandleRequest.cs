using Dointo.AiRecruiter.Core.States;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Diagnostics.CodeAnalysis;

namespace Dointo.AiRecruiter.Functions.Shared.Handlers;
public static class HandleRequest
{
	public static async Task<IActionResult> Handle([NotNull] Func<Task<IProcessingState>> actionAsync, string functionName, ILogger logger)
	{
		try
		{
			logger.LogInformation("Function Name: {FunctionName}, State: Entry", functionName);
			var resultState = await actionAsync( );
			logger.LogInformation("Function Name: {FunctionName}, State: Processed, Message: {Message}", functionName, resultState.Message);
			if (resultState.Success)
				return new OkObjectResult(resultState);
			logger.LogWarning("Function Name: {FunctionName}, State: Error, Message: {Message}", functionName, resultState.Message);
			return resultState switch
			{
				ErrorState errorState => new BadRequestObjectResult(errorState),
				ValidationErrorState validationErrorState => new BadRequestObjectResult(validationErrorState),
				_ => throw new InvalidOperationException("Not a valid state provided")
			};
		}
		catch (Exception ex)
		{
			logger.LogCritical(ex, "Function Name: {FunctionName}, State: Exception", functionName);
			return new BadRequestObjectResult(new ExceptionState($"An error occurred while running {functionName}", ex.Message));
		}
	}
}
