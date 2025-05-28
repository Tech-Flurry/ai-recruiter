using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.ValueObjects;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Resolvers;
internal class EditJobDtoResolver : ResolverBase<Job, EditJobDto>
{
	private const char SEPARATOR = ';';

	protected override IDointoMapper Mapper
	{
		get
		{
			var configuration = new MapperConfiguration(cfg =>
			{
				cfg.CreateMap<Job, EditJobDto>( )
				   .ForMember(dest => dest.JobTitle, opt => opt.MapFrom(src => src.Title))
				   .ForMember(dest => dest.YearsOfExperience, opt => opt.MapFrom(src => src.Experience))
				   .ForMember(dest => dest.AdditionalQuestions, opt => opt.MapFrom(src => string.Join(SEPARATOR, ( src.AdditionalQuestions ?? Enumerable.Empty<Question>( ) ).Select(x => x.Text))))
				   .ForMember(dest => dest.BudgetAmount, opt => opt.MapFrom(src => src.Budget != null ? src.Budget.Amount : (double?)null))
				   .ForMember(dest => dest.BudgetCurrency, opt => opt.MapFrom(src => src.Budget != null ? src.Budget.CurrencySymbol : null))
				   .ReverseMap( )
				   .ForMember(dest => dest.AdditionalQuestions, opt => opt.MapFrom(src => !string.IsNullOrEmpty(src.AdditionalQuestions) ? src.AdditionalQuestions.Split(SEPARATOR, StringSplitOptions.RemoveEmptyEntries).Select(x => new Question { Text = x }).ToList( ) : new List<Question>( )))
				   .ForMember(dest => dest.Budget, opt => opt.MapFrom(src => src.BudgetAmount != null ? new Money
				   {
					   Amount = src.BudgetAmount.Value,
					   CurrencySymbol = src.BudgetCurrency ?? string.Empty
				   } : null));
			});
			return new AutoMapperProvider(configuration.CreateMapper( ));
		}
	}
}
