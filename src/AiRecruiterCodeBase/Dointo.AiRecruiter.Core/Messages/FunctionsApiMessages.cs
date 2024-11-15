namespace Dointo.AiRecruiter.Core.Messages;


public record FunctionApiRequestMessage<T>(T Dto, string Username);

public record FunctionApiRequestMessageWithOwner<T>(T Dto, string Username, string OwnerId, string OwnerFirstName, string OwnerLastName, string Email);

public record FunctionApiResponseMessage(string Json, string StateType);
