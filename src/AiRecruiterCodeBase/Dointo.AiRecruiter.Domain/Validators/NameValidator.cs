using Dointo.AiRecruiter.Domain.ValueObjects;
using FluentValidation;

namespace Dointo.AiRecruiter.Domain.Validators;

public class NameValidator : AbstractValidator<Name>
{
	public NameValidator( )
	{
		RuleFor(x => x.FirstName)
			.NotEmpty( ).WithMessage("First name is required.")
			.Matches("^[A-Za-z ]+$").WithMessage("First name can only contain alphabetic characters and spaces.");

		RuleFor(x => x.LastName)
			.NotEmpty( ).WithMessage("Last name is required.")
			.Matches("^[A-Za-z ]+$").WithMessage("Last name can only contain alphabetic characters and spaces.");
	}
}
