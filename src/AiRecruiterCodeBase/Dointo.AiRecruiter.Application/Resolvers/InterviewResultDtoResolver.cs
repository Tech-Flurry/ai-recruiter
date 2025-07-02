using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Resolvers;

internal class InterviewResultDtoResolver : ResolverBase<Interview, InterviewResultDto>
{
	protected override IDointoMapper Mapper
	{
		get
		{
			var config = new MapperConfiguration(static cfg =>
			{
				_ = cfg.CreateMap<Interview, InterviewResultDto>( )
					.ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.Interviewee.Name))
					.ForMember(dest => dest.Feedback, opt => opt.MapFrom(src => src.Interviewee.JobFitAnalysis))
					.ForMember(dest => dest.CandidateId, opt => opt.MapFrom(src => src.Interviewee.CandidateId))
					.ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Interviewee.Email))
					.ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Interviewee.Phone))
					.ForMember(dest => dest.JobTitle, opt => opt.MapFrom(src => src.Job.JobTitle))
					.ForMember(dest => dest.Location, opt => opt.MapFrom(src => src.Interviewee.Location))
					.ForMember(dest => dest.TotalScore, opt => opt.MapFrom(src => src.Questions.Sum(x => x.TotalScore)))
					.ForMember(dest => dest.SkillWiseScore, opt => opt.MapFrom(src => src.ScoredSkills.ToDictionary(s => s.Skill, s => s.Rating)));
				cfg.CreateMap<Credential, CredentialDto>( );
				cfg.CreateMap<Experience, ExperienceDto>( );
				cfg.CreateMap<SkillRating, SkillRatingDto>( );
				cfg.CreateMap<ScoredQuestion, InterviewQuestionDto>( )
				.ForMember(dest => dest.Question, opt => opt.MapFrom(src => src.Question.Text))
				.ForMember(dest => dest.Answer, opt => opt.MapFrom(src => src.Question.Answer));
			});

			return new AutoMapperProvider(config.CreateMapper( ));
		}
	}
}
