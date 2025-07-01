using Dointo.AiRecruiter.InterviewClient.Services;

namespace Dointo.AiRecruiter.InterviewClient;

public partial class App : Application
{
	private readonly DeepLinkingService _deepLinkingService;

	public App(DeepLinkingService deepLinkingService)
	{
		InitializeComponent( );
		_deepLinkingService = deepLinkingService;
	}

	protected override void OnAppLinkRequestReceived(Uri uri)
	{
		base.OnAppLinkRequestReceived(uri);
		_deepLinkingService.ProcessUri(uri.ToString( ));
	}

	protected override Window CreateWindow(IActivationState? activationState) => new(new MainPage( )) { Title = "Dointo Ai Recruiter" };
}
