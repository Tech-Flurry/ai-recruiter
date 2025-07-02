using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dointo.AiRecruiter.DbInfrastructure.Repositories;
internal class UsersRepository(AiRecruiterDbContext dbContext) : RepositoryBase<User>(dbContext), IUsersRepository
{
	public async Task<User> EditAsync(User user)
	{
		if (await _entitySet.AnyAsync(e =>
			!string.IsNullOrEmpty(user.Id) &&
			e.Id == user.Id))
		{
			var updated = Update(user, "system");
			return updated.Entity;
		}
		else
		{
			var added = Add(user, "system");
			return added.Entity;
		}
	}
	public Task<User?> GetByIdAsync(string id) => _entitySet
		.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
	public Task<User?> GetByUsernameAsync(string username) => _entitySet
		.FirstOrDefaultAsync(x => x.Username == username);
	public Task<bool> UsernameExistsAsync(string username) => _entitySet
		.AnyAsync(x => x.Username == username);
}
