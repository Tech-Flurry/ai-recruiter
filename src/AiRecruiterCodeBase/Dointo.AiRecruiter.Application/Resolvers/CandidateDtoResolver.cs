using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Resolvers;

internal class CandidateListDtoResolver : ResolverBase<Interview, CandidateListDto>
{
	private readonly IDointoMapper _mapper;

	public CandidateListDtoResolver( )
	{
		var config = new MapperConfiguration(cfg =>
		{
			cfg.CreateMap<Interview, CandidateListDto>( )
	       .ForMember(dest => dest.CandidateId, opt => opt.MapFrom(src => src.Interviewee.CandidateId)) // ✅ Map real ID
	       .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Interviewee.Name))
	       .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Interviewee.Email))
	       .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Interviewee.Phone))
	       .ForMember(dest => dest.Score, opt => opt.MapFrom(src => (int)Math.Round(src.AiScore)))
	       .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Interviewee.Status))
	       .ForMember(dest => dest.LastInterviewed, opt => opt.MapFrom(src => src.StartTime));

		});

		_mapper = new AutoMapperProvider(config.CreateMapper( ));
	}

	protected override IDointoMapper Mapper => _mapper;
}
