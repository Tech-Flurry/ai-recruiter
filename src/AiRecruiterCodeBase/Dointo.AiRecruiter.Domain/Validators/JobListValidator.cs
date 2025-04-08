using Dointo.AiRecruiter.Core.CustomValidators;
using Dointo.AiRecruiter.Domain.Entities;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dointo.AiRecruiter.Domain.Validators;

public class JobListValidator : AbstractValidator<JobListEntity>
{
	public JobListValidator( )
	{
		RuleFor(x => x.Title)
			.NotEmpty( )
			.MaximumLength(100)
			.MustStartWithAlphabet( );

		RuleFor(x => x.Status)
			.NotEmpty( )
			.Must(s => s == "open" || s == "closed")
			.WithMessage("Status must be either 'open' or 'closed'.");

		RuleFor(x => x.HasInterviews)
			.NotNull( );
	}
}
