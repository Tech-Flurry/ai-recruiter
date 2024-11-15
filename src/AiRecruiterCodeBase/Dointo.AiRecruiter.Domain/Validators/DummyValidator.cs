using Dointo.AiRecruiter.Core.CustomValidators;
using Dointo.AiRecruiter.Domain.Entities;
using FluentValidation;

namespace Dointo.AiRecruiter.Domain.Validators;
public class DummyValidator : AbstractValidator<DummyEntity>
{
	public DummyValidator( )
	{
		RuleFor(x => x.Name).NotEmpty( ).MaximumLength(50).MustStartWithAlphabet( );
		RuleFor(x => x.Age).InclusiveBetween(1, 50);
	}
}
