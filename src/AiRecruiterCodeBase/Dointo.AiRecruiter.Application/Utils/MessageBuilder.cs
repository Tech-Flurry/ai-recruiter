using Humanizer;

namespace Dointo.AiRecruiter.Application.Utils;
internal class MessageBuilder
{
	private string messageFormat = string.Empty;
	private readonly List<string> _strings = [ ];

	public MessageBuilder AddFormat(string format)
	{
		messageFormat = format;
		return this;
	}

	public MessageBuilder AddString(string str)
	{
		_strings.Add(str);
		return this;
	}

	public void Clear( )
	{
		messageFormat = string.Empty;
		_strings.Clear( );
	}

	public string Build( )
	{
		if (string.IsNullOrEmpty(messageFormat) || _strings.Count == 0)
			return messageFormat;
		return string.Format(messageFormat, _strings.ToArray( )).Humanize( ).Transform(To.SentenceCase);
	}
}
