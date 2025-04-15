using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// DTOs/CloseJobPostRequest.cs
namespace Dointo.AiRecruiter.Dtos;

public class JobPostDto
{
	public string Id { get; set; } = null!;
	public string URL { get; set; } = null!;
	public string IsEditable { get; set; } = null!;
	public string Status { get; set; } = null!;
}
