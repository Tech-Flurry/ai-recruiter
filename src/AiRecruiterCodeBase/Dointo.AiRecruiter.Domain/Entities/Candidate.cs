﻿using Dointo.AiRecruiter.Domain.ValueObjects;

namespace Dointo.AiRecruiter.Domain.Entities;

public class Candidate : BaseEntity
{
	public Name Name { get; set; } = null!;
	public string Summary { get; set; } = null!;
	public DateOnly DateOfBirth { get; set; }
	public string Email { get; set; } = null!;
	public string Phone { get; set; } = null!;
	public string JobTitle { get; set; } = null!;
	public string Location { get; set; } = null!;
	public string? PerformanceSummary { get; set; }
	public List<Credential> EducationHistory { get; set; } = [ ];
	public List<Credential> Certifications { get; set; } = [ ];
	public List<Experience> Experiences { get; set; } = [ ];
	public List<SkillRating> Skills { get; set; } = [ ];
}
