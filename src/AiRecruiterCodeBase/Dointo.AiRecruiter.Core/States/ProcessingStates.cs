namespace Dointo.AiRecruiter.Core.States;
public interface IProcessingState
{
	bool Success { get; }
	string Message { get; }
}

public abstract record AbstractProcessingState(bool Success, string Message) : IProcessingState;

public record ValidationErrorState(string Message) : AbstractProcessingState(false, Message)
{
	public List<ValidationFailure> Errors { get; set; } = [ ];
	public record ValidationFailure(string PropertyName, string ErrorMessage);
}

public record SuccessState(string Message) : AbstractProcessingState(true, Message);

public record SuccessState<T>(string Message, T Data) : AbstractProcessingState(true, Message);

public record ErrorState(string Message) : AbstractProcessingState(false, Message);

public record UnauthorizedState(string? Message) : ErrorState(Message ?? "Unauthorized");

public record BusinessErrorState(string Message) : ErrorState(Message);

public record ExceptionState(string Message, string? ExceptionMessage) : ErrorState(Message);

public record InProgressState : IProcessingState
{
	public bool Success => false;
	public string Message => "In-Progress";
}
