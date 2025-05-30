namespace Dointo.AiRecruiter.RestApi;

public class WeatherForecast
{
	public DateOnly Date { get; set; }

	public int TemperatureC { get; set; }

	public int TemperatureF => 32 + (int)( TemperatureC / 0.5556 );

	public string? Summary { get; set; }
}
public class Jobs
{
    public int JobId { get; set; }

    public string? Title { get; set; }

}
