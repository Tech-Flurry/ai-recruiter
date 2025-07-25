﻿using Dointo.AiRecruiter.Application.Exceptions;
using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Dointo.AiRecruiter.DbInfrastructure.Repositories;

internal class InterviewsRepository(AiRecruiterDbContext dbContext)
	: RepositoryBase<Interview>(dbContext), IInterviewsRepository
{
	public async Task<Interview> AddQuestionAsync(Question question, string interviewId, double score, double outOf)
	{
		var interview = await _entitySet.FirstOrDefaultAsync(x => x.Id == interviewId)
			?? throw new RecordNotFoundException<Interview>(interviewId);

		interview.Questions.Add(new ScoredQuestion
		{
			Question = question,
			ScoreObtained = score,
			TotalScore = outOf
		});

		return interview;
	}

	public async Task<Interview> CreateInterviewAsync(Job job, Candidate candidate)
	{
		var interview = new Interview
		{
			Interviewee = new Interviewee
			{
				CandidateId = candidate.Id,
				Name = candidate.Name.FullName,
				Email = candidate.Email,
				Phone = candidate.Phone,
				Location = candidate.Location,
				JobFitAnalysis = string.Empty,
				Experience = GetTotalExperience(candidate)
			},
			Job = new InterviewJob
			{
				JobId = job.Id,
				JobTitle = job.Title,
				RequiredSkills = job.RequiredSkills,
				JobDescription = job.JobDescription,
				RequiredExperience = job.Experience
			},
			StartTime = DateTime.UtcNow
		};

		var entry = await _entitySet.AddAsync(interview);
		return entry.Entity;

		static int GetTotalExperience(Candidate candidate)
		{
			try
			{
				return (int)Math.Round(
										( candidate.Experiences.Select(x => x.EndDate ?? DateTime.UtcNow).Max( ) -
										candidate.Experiences.Min(x => x.StartDate) ).TotalDays / 365);
			}
			catch (Exception)
			{
				return 0;
			}
		}
	}

	public async Task<Interview?> GetInterviewResultByInterviewIdAsync(string interviewId)
	{
		return await _entitySet
			.Include(i => i.Interviewee)
			.Include(i => i.Job)
			.Include(i => i.Questions)
			.Include(i => i.ScoredSkills)
			.FirstOrDefaultAsync(i => i.Id == interviewId);
	}

	public async Task<List<Interview>> GetByOwnerAsync(string ownerId)
	{
		if (string.IsNullOrWhiteSpace(ownerId))
			return [ ];

		return await QueryableEntity
			.Where(i => i.CreatedBy == ownerId)
			.OrderByDescending(i => i.EndTime)
			.ToListAsync( );
	}
}
