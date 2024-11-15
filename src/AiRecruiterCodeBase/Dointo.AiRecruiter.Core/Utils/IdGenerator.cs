using MongoDB.Bson;

namespace Dointo.AiRecruiter.Core.Utils;
public static class IdGenerator
{
	public static ObjectId GenerateNewId( ) => ObjectId.GenerateNewId( );
	public static string GenerateNewStringId( ) => GenerateNewId( ).ToString( );

}
