using Dointo.AiRecruiter.Core.States;
using FluentValidation.Results;

namespace Dointo.AiRecruiter.Core.Extensions;
public static class StateExtensions
{
	public static ValidationErrorState ToValidationErrorState(this ValidationResult validationResult, string entityName)
	{
		return new ValidationErrorState($"{entityName} is not valid")
		{
			Errors = validationResult.Errors.Select(e => new ValidationErrorState.ValidationFailure(e.PropertyName, e.ErrorMessage)).ToList( )
		};
	}
}
