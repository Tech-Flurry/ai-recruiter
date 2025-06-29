using Dointo.AiRecruiter.InterviewClient.Services;
using Microsoft.AspNetCore.Components;

namespace Dointo.AiRecruiter.InterviewClient;

public partial class MainPage : ContentPage
{
	public MainPage( )
	{
		InitializeComponent( );
		DeepLinkingService.OnJobInterviewRequested += OnJobInterviewRequested;
	}

	[Inject]
	private DeepLinkingService DeepLinkingService { get; set; } = default!;

	[Inject]
	private NavigationManager NavigationManager { get; set; } = default!;

	private void OnJobInterviewRequested(string jobId)
	{
		// Navigate to the appropriate page with the jobId
		NavigationManager.NavigateTo($"/interview/{jobId}");
	}

	public void Dispose( )
	{
		DeepLinkingService.OnJobInterviewRequested -= OnJobInterviewRequested;
	}
}
