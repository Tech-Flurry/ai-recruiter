using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;
using Humanizer;

namespace Dointo.AiRecruiter.Application.Resolvers;

internal class JobListDtoResolver : ResolverBase<Job, JobListDto>
{
	protected override IDointoMapper Mapper
	{
		get
		{
			var configuration = new MapperConfiguration(cfg =>
			{
				cfg.CreateMap<Job, JobListDto>( )
					.ForMember(dest => dest.Status, op => op.MapFrom(src => src.Status.Humanize( )))
					.ForMember(dest => dest.NumberOfInterviews, op => op.Ignore( ))
					.ForMember(dest => dest.IsEditable, op => op.Ignore( ))
					.ForMember(dest => dest.URL, op => op.Ignore( ));
			});
			return new AutoMapperProvider(configuration.CreateMapper( ));
		}
	}
}
