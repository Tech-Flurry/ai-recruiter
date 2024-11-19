namespace Dointo.AiRecruiter.Application.Exceptions;
public class RecordNotFoundException<T> : Exception
{
	public RecordNotFoundException( ) : base($"Record of type {typeof(T).Name} not found.")
	{
	}

	public RecordNotFoundException(string criteria) : base($"Record of type {typeof(T).Name} not found with criteria: {criteria}")
	{

	}
}
