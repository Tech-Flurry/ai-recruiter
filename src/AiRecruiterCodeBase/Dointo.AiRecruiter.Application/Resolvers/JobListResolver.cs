using AutoMapper;
using Dointo.AiRecruiter.Application.Services;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dointo.AiRecruiter.Application.Resolvers;

internal class JobListDtoResolver : ResolverBase<JobListEntity, JobPostDto>
{
	protected override IDointoMapper Mapper
	{
		get
		{
			var configuration = new MapperConfiguration(cfg =>
			{
				cfg.CreateMap<JobListEntity, JobPostDto>( ).ForMember(x => x.IsEditable, op => op.MapFrom(p => p.HasInterviews));
			});
			return new AutoMapperProvider(configuration.CreateMapper( ));
		}
	}
}
