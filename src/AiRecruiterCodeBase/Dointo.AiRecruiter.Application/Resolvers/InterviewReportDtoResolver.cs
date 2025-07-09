using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Resolvers;

internal class InterviewReportDtoResolver : ResolverBase<Interview, InterviewReportDto>
{
	protected override IDointoMapper Mapper
	{
		get
		{
			var configuration = new MapperConfiguration(cfg =>
			{
				cfg.CreateMap<Interview, InterviewReportDto>( )
				
					.ForMember(dest => dest.JobTitle, opt => opt.MapFrom(src => src.Job != null ? src.Job.JobTitle : "N/A"))
					.ForMember(dest => dest.InterviewDate, opt => opt.MapFrom(src => src.StartTime.Date))
					.ForMember(dest => dest.TotalScore, opt => opt.MapFrom(src => src.AiScore))
			.ForMember(dest => dest.AiFeedback, opt => opt.MapFrom(src => src.Interviewee.JobFitAnalysis))
					.ForMember(dest => dest.QuestionScores, opt => opt.MapFrom(src => src.Questions))
					.ForMember(dest => dest.Status, opt => opt.Ignore( ))
					.ForMember(dest => dest.SkillRatings, opt => opt.MapFrom(src => src.ScoredSkills));

				cfg.CreateMap<ScoredQuestion, QuestionScoreDto>( )
					.ForMember(dest => dest.Text, opt => opt.MapFrom(src => src.Question.Text))
					.ForMember(dest => dest.ScoreObtained, opt => opt.MapFrom(src => src.ScoreObtained))
					.ForMember(dest => dest.TotalScore, opt => opt.MapFrom(src => src.TotalScore));

				cfg.CreateMap<SkillRating, SkillRatingDto>( )
					.ForMember(dest => dest.Skill, opt => opt.MapFrom(src => src.Skill))
					.ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Rating));
			});

			return new AutoMapperProvider(configuration.CreateMapper( ));
		}
	}
}
