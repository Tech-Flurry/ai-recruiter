using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.ValueObjects;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Resolvers;
internal class CreateCandidateDtoResolver : ResolverBase<Candidate, CreateCandidateDto>
{
	protected override IDointoMapper Mapper
	{
		get
		{
			var configuration = new MapperConfiguration(cfg =>
			{
				cfg.CreateMap<Candidate, CreateCandidateDto>( )
				   .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.Name.FirstName))
				   .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.Name.LastName))
				   .ReverseMap( )
				   .ForMember(dest => dest.Name, opt => opt.MapFrom(src => new Name
				   {
					   FirstName = src.FirstName,
					   LastName = src.LastName
				   }))
				   .ForMember(dest => dest.Summary, opt => opt.Ignore( ));
				cfg.CreateMap<Credential, CredentialDto>( )
				.ReverseMap( );
				cfg.CreateMap<Experience, ExperienceDto>( ).ReverseMap( );
				cfg.CreateMap<SkillRating, SkillRatingDto>( ).ReverseMap( );
			});
			return new AutoMapperProvider(configuration.CreateMapper( ));
		}
	}
}
