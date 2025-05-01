using Dointo.AiRecruiter.Domain.Entities;
using FluentValidation;

namespace Dointo.AiRecruiter.Domain.Validators;
public class JobPostValidator : AbstractValidator<Job>
{
	public JobPostValidator( )
	{
		RuleFor(x => x.Title).MinimumLength(5).MaximumLength(50).NotEmpty( );
		RuleFor(x => x.Experience).InclusiveBetween(0, 30);
		RuleFor(x => x.JobDescription).MinimumLength(50).MaximumLength(500).NotEmpty( );
		RuleFor(x => x.RequiredSkills).NotEmpty( ).Must(x => x.Count > 0).WithMessage("Required Skills must contain at least one skill.");
		RuleFor(x => x.Budget).Must(x => x == null || x.Amount > 0).WithMessage("Budget must be greater than 0.");
	}
}
