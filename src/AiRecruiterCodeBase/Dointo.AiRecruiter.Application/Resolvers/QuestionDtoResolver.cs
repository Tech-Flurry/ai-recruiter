using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.ValueObjects;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Resolvers;
internal class QuestionDtoResolver : ResolverBase<Question, QuestionDto>
{
	protected override IDointoMapper Mapper
	{
		get
		{
			var configuration = new MapperConfiguration(cfg =>
			{
				cfg.CreateMap<Question, QuestionDto>( ).ForMember(dest => dest.Answer, opt => opt.MapFrom(src => src.Answer ?? string.Empty)).ReverseMap( );
			});
			return new AutoMapperProvider(configuration.CreateMapper( ));
		}
	}
}
