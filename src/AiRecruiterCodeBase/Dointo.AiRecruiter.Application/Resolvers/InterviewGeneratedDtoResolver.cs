using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Resolvers;
internal class InterviewGeneratedDtoResolver : ResolverBase<Interview, InterviewGeneratedDto>
{
	protected override IDointoMapper Mapper
	{
		get
		{
			var configuration = new MapperConfiguration(cfg =>
			{
				cfg.CreateMap<Interview, InterviewGeneratedDto>( )
					.ForMember(dest => dest.InterviewId, opt => opt.MapFrom(src => src.Id))
					.ForMember(dest => dest.InterviewStarter, opt => opt.Ignore( ));
			});
			return new AutoMapperProvider(configuration.CreateMapper( ));
		}
	}

}
