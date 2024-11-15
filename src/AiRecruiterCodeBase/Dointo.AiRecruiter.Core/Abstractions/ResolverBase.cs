namespace Dointo.AiRecruiter.Core.Abstractions;

public abstract class ResolverBase<T1, T2> : IResolver<T1, T2>
{
	protected abstract IDointoMapper Mapper { get; }
	public virtual T2 Resolve(T1 source) => Mapper.Map<T1, T2>(source);
	public virtual T1 Resolve(T2 source) => Mapper.Map<T2, T1>(source);
}
