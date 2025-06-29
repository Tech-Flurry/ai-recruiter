using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Resolvers;

internal class InterviewToDtoResolver : ResolverBase<Interview, InterviewResultDto>
{
	protected override IDointoMapper Mapper
	{
		get
		{
			var config = new MapperConfiguration(static cfg =>
			{
				_ = cfg.CreateMap<Interview, InterviewResultDto>( )
					.ForMember(dest => dest.JobId, opt => opt.MapFrom(src => src.Job != null ? src.Job.JobId : null))
					.ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Interviewee != null ? src.Interviewee.Email : null))
					.ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Interviewee != null ? src.Interviewee.Phone : null))
					.ForMember(dest => dest.JobTitle, opt => opt.MapFrom(src => src.Job != null ? src.Job.JobTitle : null))
					.ForMember(dest => dest.Location, opt => opt.MapFrom(src => src.Job != null ? src.Job.Location : null))
					.ForMember(dest => dest.TotalScore, opt => opt.MapFrom(src => src.ScoredSkills != null ? src.ScoredSkills.Sum(s => s.Rating) : 0))
					.ForMember(dest => dest.SkillWiseScore, opt => opt.MapFrom(src => src.ScoredSkills != null ? src.ScoredSkills.ToDictionary(s => s.Skill, s => s.Rating) : new Dictionary<string, int>( )))
					.ForMember(dest => dest.Violations, opt => opt.MapFrom(src => src.Violations ?? new( )))
					.ForMember(dest => dest.AiScore, opt => opt.MapFrom(src => src.AiScore))
					.ForMember(dest => dest.Questions, opt => opt.MapFrom(src => src.Questions != null ?
						src.Questions.Select(q => new InterviewQuestionDto
						{
							Question = q.Question != null ? q.Question.Text : null,
							Answer = q.Question != null ? q.Question.Answer : null,
							ScoreObtained = (int?)q.ScoreObtained,
							TotalScore = (int?)q.TotalScore
						}).ToList( ) : new List<InterviewQuestionDto>( )));
				cfg.CreateMap<Credential, CredentialDto>( ).ReverseMap( );
				cfg.CreateMap<Experience, ExperienceDto>( ).ReverseMap( );
				cfg.CreateMap<SkillRating, SkillRatingDto>( ).ReverseMap( );
			});

			return new AutoMapperProvider(config.CreateMapper( ));
		}
	}
}
