using Dointo.AiRecruiter.Domain.Entities;
using FluentValidation;

namespace Dointo.AiRecruiter.Domain.Validators;

public class CandidateValidator : AbstractValidator<Candidate>
{
	public CandidateValidator( )
	{
		RuleFor(x => x.Name).SetValidator(new NameValidator( ));
		RuleFor(x => x.Email).EmailAddress( ).WithMessage("Invalid email format.").NotEmpty( ).WithMessage("Email is required.");
		( RuleFor(x => x.Phone)
			.NotEmpty( ).WithMessage("Phone number is required.")
			.Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Invalid phone number format.") )
			.When(x => !string.IsNullOrEmpty(x.Phone));
		RuleFor(x => x.DateOfBirth).LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today.AddYears(-18))).WithMessage("Age should be at least 18 years.");
		RuleFor(x => x.JobTitle).NotEmpty( ).WithMessage("Job title is required");
		RuleFor(x => x.Location).NotEmpty( ).WithMessage("Location is required");
		RuleForEach(x => x.Experiences).ChildRules(exp =>
		{
			exp.RuleFor(e => e.JobTitle)
				.NotEmpty( ).WithMessage("Job title is required.")
				.MaximumLength(100);

			exp.RuleFor(e => e.Company)
				.NotEmpty( ).WithMessage("Company is required.")
				.MaximumLength(100);

			exp.RuleFor(e => e.Details)
				.NotEmpty( ).WithMessage("Details are required.")
				.MaximumLength(1000);

			exp.RuleFor(e => e.StartDate)
				.NotEmpty( ).WithMessage("Start date is required.")
				.LessThanOrEqualTo(DateTime.Today).WithMessage("Start date cannot be in the future.");

			exp.RuleFor(e => e.EndDate)
				.Must((e, endDate) => !endDate.HasValue || endDate.Value >= e.StartDate)
				.WithMessage("End date cannot be before start date.")
				.Must(endDate => !endDate.HasValue || endDate.Value <= DateTime.Today)
				.WithMessage("End date cannot be in the future.");
		});

		RuleFor(x => x.Experiences)
			.Must(exps =>
			{
				if (exps == null || exps.Count == 0)
					return true; // No experiences, skip

				var minStart = exps.Min(e => e.StartDate);
				var maxEnd = exps.Max(e => e.EndDate ?? DateTime.Today);
				var totalSpan = maxEnd.Year - minStart.Year;
				if (maxEnd < minStart) return false;
				// Adjust for months/days if needed
				if (maxEnd < minStart.AddYears(totalSpan)) totalSpan--;
				return totalSpan <= 60;
			})
			.WithMessage("Total experience span must not exceed 60 years.");

		RuleForEach(x => x.Skills).ChildRules(skill =>
		{
			skill.RuleFor(s => s.Skill)
				.NotEmpty( ).WithMessage("Skill name is required.");

			skill.RuleFor(s => s.Rating)
				.InclusiveBetween(1, 5).WithMessage("Skill rating must be between 1 and 5.");
		});

	}
}
