using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;
using Humanizer;
using System.Linq;

namespace Dointo.AiRecruiter.Application.Resolvers;

public class CandidateJobViewDtoResolver : ResolverBase<Job, CandidateJobViewDto>
{
	protected override IDointoMapper Mapper
	{
		get
		{
			var configuration = new MapperConfiguration(cfg =>
			{
				cfg.CreateMap<Job, CandidateJobViewDto>( )
					.ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
					.ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
						.ForMember(dest => dest.Posted, op => op.Ignore( ))
							.ForMember(dest => dest.Status, op => op.MapFrom(src => src.Status.Humanize( )));
			});

			return new AutoMapperProvider(configuration.CreateMapper( ));
		}
	}
}
