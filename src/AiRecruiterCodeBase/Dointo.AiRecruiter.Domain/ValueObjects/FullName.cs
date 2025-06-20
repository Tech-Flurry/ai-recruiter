namespace Dointo.AiRecruiter.Domain.ValueObjects;

public class FullName
{
	public string First { get; private set; }
	public string Last { get; private set; }

	public FullName(string first, string last)
	{
		First = first;
		Last = last;
	}

	public override string ToString( ) => $"{First} {Last}";

	public override bool Equals(object? obj)
		=> obj is FullName other && First == other.First && Last == other.Last;

	public override int GetHashCode( ) => HashCode.Combine(First, Last);
}
