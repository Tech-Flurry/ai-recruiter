using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dointo.AiRecruiter.Domain.Entities;

public class JobListEntity : BaseEntity
{
	public string Title { get; set; } = null!;
	public string Status { get; set; } = "open"; // "open" or "closed"
	public bool HasInterviews { get; set; }
}
