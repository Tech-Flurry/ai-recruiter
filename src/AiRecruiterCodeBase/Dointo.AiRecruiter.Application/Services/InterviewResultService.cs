using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Application.Utils;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Services;

public interface IInterviewResultService
{
	Task<IProcessingState> GetInterviewResultAsync(string interviewId);
}

public class InterviewResultService : IInterviewResultService
{
	private readonly IInterviewRepository _interviewRepository;
	private readonly MessageBuilder _messageBuilder = new( );

	public InterviewResultService(IInterviewRepository interviewRepository)
	{
		_interviewRepository = interviewRepository;
	}

	public async Task<IProcessingState> GetInterviewResultAsync(string interviewId)
	{
		_messageBuilder.Clear( );

		try
		{
			var result = await _interviewRepository.GetInterviewResultByInterviewIdAsync(interviewId);


			return new SuccessState<Interview>("", result);

			//if (result is BusinessErrorState or ExceptionState)
			//{
			//	return result;
			//}

			//// SuccessState will already contain InterviewResultDto if repo returns it directly.
			//return result;
		}
		catch (Exception ex)
		{
			Console.WriteLine("❌ EXCEPTION in GetInterviewResultAsync:");
			Console.WriteLine($"Message: {ex.Message}");
			Console.WriteLine($"StackTrace: {ex.StackTrace}");
			Console.WriteLine($"InnerException: {ex.InnerException?.Message}");

			return new ExceptionState("Unexpected error occurred in InterviewResultService.", ex.Message);
		}
	}
}
