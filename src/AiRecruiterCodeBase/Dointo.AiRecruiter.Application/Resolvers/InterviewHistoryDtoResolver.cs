using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Resolvers;

internal class InterviewHistoryDtoResolver : ResolverBase<Interview, InterviewHistoryDto>
{
	protected override IDointoMapper Mapper
	{
		get
		{
			var configuration = new MapperConfiguration(cfg =>
			{
				cfg.CreateMap<Interview, InterviewHistoryDto>( )
					.ForMember(dest => dest.JobTitle, opt => opt.MapFrom(src => src.Job != null ? src.Job.JobTitle : "N/A"))
					.ForMember(dest => dest.Score, opt => opt.MapFrom(src => src.AiScore))
					.ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.AiScore >= 7.0 ? "Passed" : "Failed"))
					.ForMember(dest => dest.JobStatus, opt => opt.MapFrom(src => src.Interviewee.Status ?? "Open"))



					.ForMember(dest => dest.InterviewedAt, opt => opt.MapFrom(src => src.EndTime ?? src.StartTime));
			});

			return new AutoMapperProvider(configuration.CreateMapper( ));
		}
	}
}
