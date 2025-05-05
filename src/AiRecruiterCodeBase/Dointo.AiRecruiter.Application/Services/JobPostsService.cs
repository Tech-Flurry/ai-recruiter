using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.Validators;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Services;

public interface IJobPostsService
{
	Task<IProcessingState> DeleteAsync(string id);
	Task<IProcessingState> GetByIdAsync(string id);
	Task<IProcessingState> SaveAsync(EditJobDto jobPostDto, string username);
	Task<IProcessingState> GetAllAsync( );

	// ✅ NEW: Basic skill extraction method
	Task<List<string>> ExtractSkillsFromDescriptionAsync(string jobDescription);
}

internal class JobPostsService(
	IJobPostRepository repository,
	IResolver<Job, EditJobDto> resolver
) : IJobPostsService
{
	private readonly IJobPostRepository _repository = repository;
	private readonly IResolver<Job, EditJobDto> _resolver = resolver;

	public async Task<IProcessingState> SaveAsync(EditJobDto jobPostDto, string username)
	{
		var jobPost = _resolver.Resolve(jobPostDto) ?? new Job( );
		var validationResult = new JobPostValidator( ).Validate(jobPost);
		if (!validationResult.IsValid)
			return validationResult.ToValidationErrorState(nameof(Job));

		try
		{
			var savedEntity = await _repository.SaveAsync(jobPost, username);
			return new SuccessState<Job>("Job post has been saved", savedEntity);
		}
		catch (Exception ex)
		{
			return new ExceptionState("An error occurred while saving the job post", ex.Message);
		}
	}

	public async Task<IProcessingState> GetByIdAsync(string id)
	{
		var validateResult = ValidateJobPostId(id);
		if (validateResult is not null)
			return validateResult;

		var jobPost = await _repository.GetByIdAsync(id);
		if (jobPost is null)
			return new BusinessErrorState("Job post not found");

		var jobPostDto = _resolver.Resolve(jobPost);
		return new SuccessState<EditJobDto>("Job post retrieved successfully", jobPostDto);
	}

	public async Task<IProcessingState> DeleteAsync(string id)
	{
		var validateResult = ValidateJobPostId(id);
		if (validateResult is not null)
			return validateResult;

		var jobPost = await _repository.GetByIdAsync(id);
		if (jobPost is null)
			return new BusinessErrorState("Job post not found");

		jobPost.IsDeleted = true;
		await _repository.SaveAsync(jobPost, string.Empty);
		return new SuccessState("Job post deleted successfully");
	}

	public async Task<IProcessingState> GetAllAsync( )
	{
		try
		{
			var jobPosts = await _repository.GetAllAsync( );
			var jobPostDtos = jobPosts.Select(post => _resolver.Resolve(post)).ToList( );
			return new SuccessState<List<EditJobDto>>("All job posts retrieved successfully", jobPostDtos);
		}
		catch (Exception ex)
		{
			return new ExceptionState("An error occurred while fetching job posts", ex.Message);
		}
	}

	// ✅ NEW: Basic keyword matching logic for skill extraction
	public async Task<List<string>> ExtractSkillsFromDescriptionAsync(string jobDescription)
	{
		await Task.CompletedTask;

		var predefinedSkills = new List<string>
		{
			"C#", "JavaScript", "React", "Node.js", "Python", "SQL",
			".NET", "TypeScript", "HTML", "CSS", "MongoDB", "Azure",
			"Git", "REST API", "Agile", "Blazor"
		};

		var extracted = predefinedSkills
			.Where(skill => jobDescription.Contains(skill, StringComparison.OrdinalIgnoreCase))
			.ToList( );

		if (!extracted.Any( ))
			extracted.Add("General Software Development");

		return extracted;
	}

	private static ValidationErrorState? ValidateJobPostId(string id)
	{
		if (id.IsNullOrEmpty( ))
		{
			return new ValidationErrorState("Job post ID cannot be null or empty")
			{
				Errors = [new ValidationErrorState.ValidationFailure(nameof(id), "Job post ID cannot be null or empty")]
			};
		}
		return null;
	}
}
