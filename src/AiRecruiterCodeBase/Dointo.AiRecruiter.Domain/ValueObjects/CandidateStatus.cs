using System;
using System.Collections.Generic;
using System.Linq;
public class CandidateStatus
{
	public string Status { get; }

	private CandidateStatus( ) { } // ✅ Needed for EF Core

	private CandidateStatus(string status)
	{
		Status = status;
	}

	public static CandidateStatus Screened => new("Screened");
	public static CandidateStatus Selected => new("Selected");
	public static CandidateStatus Rejected => new("Rejected");

	public static CandidateStatus FromString(string status)
	{
		return status switch
		{
			"Screened" => Screened,
			"Selected" => Selected,
			"Rejected" => Rejected,
			_ => throw new ArgumentException($"Invalid candidate status: {status}")
		};
	}

	public override string ToString( ) => Status;

	public override bool Equals(object? obj) =>
		obj is CandidateStatus other && Status == other.Status;

	public override int GetHashCode( ) => Status.GetHashCode( );

	public static bool operator ==(CandidateStatus a, CandidateStatus b) =>
		a?.Status == b?.Status;

	public static bool operator !=(CandidateStatus a, CandidateStatus b) =>
		!( a == b );
}
