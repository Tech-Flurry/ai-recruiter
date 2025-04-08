using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// DTOs/CloseJobPostRequest.cs
namespace Dointo.AiRecruiter.Dtos;

public class CloseJobListRequest
{
	public List<string> JobIds { get; set; } = [ ];
	public string Reason { get; set; } = null!;
}
