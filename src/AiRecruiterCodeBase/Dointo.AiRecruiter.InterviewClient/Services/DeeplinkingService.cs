namespace Dointo.AiRecruiter.InterviewClient.Services;
public class DeepLinkingService
{
	public event Action<string>? OnJobInterviewRequested;

	public void ProcessUri(string uri)
	{
		if (string.IsNullOrEmpty(uri))
			return;

		// Parse the URI to extract the jobId
		if (Uri.TryCreate(uri, UriKind.Absolute, out var parsedUri))
		{
			var segments = parsedUri.Segments;

			// Look for jobs/conduct/{jobId} pattern
			if (segments.Length >= 3 &&
				segments[0].Trim('/') == "jobs" &&
				segments[1].Trim('/') == "conduct" &&
				segments.Length > 2)
			{
				string jobId = segments[2].Trim('/');

				// Remove any query parameters
				if (jobId.Contains('?'))
					jobId = jobId.Split('?')[0];

				OnJobInterviewRequested?.Invoke(jobId);
			}
		}
	}
}
