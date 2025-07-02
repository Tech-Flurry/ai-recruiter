using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Resolvers;
internal class LoginCredentialsDtoResolver : ResolverBase<User, LoginCredentialsDto>
{
	protected override IDointoMapper Mapper
	{
		get
		{
			var mapper = new MapperConfiguration(cfg =>
			{
				cfg.CreateMap<User, LoginCredentialsDto>( );
			});
			return new AutoMapperProvider(mapper.CreateMapper( ));
		}
	}
}
