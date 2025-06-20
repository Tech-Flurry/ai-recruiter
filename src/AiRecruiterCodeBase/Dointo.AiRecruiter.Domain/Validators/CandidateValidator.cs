using Dointo.AiRecruiter.Domain.Entities;
using FluentValidation;

namespace Dointo.AiRecruiter.Domain.Validators;

public class CandidateValidator : AbstractValidator<Candidate>
{
	public CandidateValidator( )
	{
		RuleFor(c => c.Name).NotNull( ).WithMessage("Name is required.");
		RuleFor(c => c.Email)
			.NotEmpty( ).WithMessage("Email is required.")
			.EmailAddress( ).WithMessage("Invalid email format.");

		RuleFor(c => c.Phone)
			.NotEmpty( ).WithMessage("Phone number is required.")
			.MinimumLength(7).WithMessage("Phone number is too short.");

		RuleFor(c => c.JobTitle)
			.NotEmpty( ).WithMessage("Job title is required.");

		RuleFor(c => c.Location)
			.NotEmpty( ).WithMessage("Location is required.");
	}
}
