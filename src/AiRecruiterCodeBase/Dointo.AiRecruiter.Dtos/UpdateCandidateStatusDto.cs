using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dointo.AiRecruiter.Dtos;
public class UpdateCandidateStatusDto
{
	public string InterviewId { get; set; } = string.Empty;
	public string Status { get; set; } = null!;
}

