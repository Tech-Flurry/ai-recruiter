using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Resolvers;
internal class CandidateInterviewResultDtoResolver : ResolverBase<Interview, CandidateInterviewResultDto>
{
	protected override IDointoMapper Mapper
	{
		get
		{
			var config = new MapperConfiguration(cfg =>
			{
				cfg.CreateMap<Interview, CandidateInterviewResultDto>( )
				.ForMember(dest => dest.InterviewScore, opt => opt.MapFrom(x => x.AiScore))
				.ForMember(dest => dest.IsPassed, opt => opt.Ignore( ))
				.ForMember(dest => dest.InterviewLength, opt => opt.Ignore( ));
				cfg.CreateMap<ScoredQuestion, ScoredQuestionDto>( )
				.ForMember(dest => dest.Score, opt => opt.MapFrom(src => src.ScoreObtained))
				.ForMember(dest => dest.Total, opt => opt.MapFrom(src => src.TotalScore))
				.ForMember(dest => dest.Question, opt => opt.MapFrom(src => src.Question.Text))
				.ForMember(dest => dest.Answer, opt => opt.MapFrom(src => src.Question.Answer));
			});
			return new AutoMapperProvider(config.CreateMapper( ));
		}
	}
}
