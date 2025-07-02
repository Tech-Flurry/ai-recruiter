using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.Application.Repositories;
public interface IUsersRepository
{
	Task<User?> GetByIdAsync(string id);
	Task<User?> GetByUsernameAsync(string username);
	Task<User> EditAsync(User user);
	Task<bool> UsernameExistsAsync(string username);
}
