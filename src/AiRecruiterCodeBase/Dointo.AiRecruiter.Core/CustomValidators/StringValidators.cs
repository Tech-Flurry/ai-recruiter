using FluentValidation;

namespace Dointo.AiRecruiter.Core.CustomValidators;
public static class StringValidators
{
	public static IRuleBuilderOptions<T, string> MustStartWithAlphabet<T>(this IRuleBuilder<T, string> ruleBuilder) => ruleBuilder.Must(x => char.IsLetter(x.FirstOrDefault( ))).WithMessage("Must start with an alphabet");

}
