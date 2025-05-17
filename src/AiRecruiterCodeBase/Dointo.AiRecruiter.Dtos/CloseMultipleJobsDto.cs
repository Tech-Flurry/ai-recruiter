namespace Dointo.AiRecruiter.Dtos;

public class CloseMultipleJobsDto
{
    public List<string> JobIds { get; set; } = new();

    public string Reason { get; set; } = string.Empty;
}
