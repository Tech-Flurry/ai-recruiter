using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dointo.AiRecruiter.Dtos;
public class DashboardMetricsDto
{
	public int ActiveJobPosts { get; set; }
	public int TotalCandidatesScreened { get; set; }
	public double PassRate { get; set; }
}
