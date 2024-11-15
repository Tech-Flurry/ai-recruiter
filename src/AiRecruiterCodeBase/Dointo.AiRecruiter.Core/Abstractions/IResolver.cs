namespace Dointo.AiRecruiter.Core.Abstractions;

public interface IResolver<T1, T2>
{
	T2 Resolve(T1 source);
	T1 Resolve(T2 source);
}
