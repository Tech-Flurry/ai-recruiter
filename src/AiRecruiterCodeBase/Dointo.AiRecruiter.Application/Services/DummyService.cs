using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.Validators;
using Dointo.AiRecruiter.Domain.ValueObjects;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Services;

public interface IDummyService
{
	Task<IProcessingState> DeleteAsync(string Id, string ownerId);
	Task<IProcessingState> GetAsync(string ownerId, bool allowInactive = false);
	Task<IProcessingState> SaveAsync(DummyDto dummyDto, Owner owner, string username);
}

internal class DummyService(IDummyRepository repository, IResolver<DummyEntity, DummyDto> workspaceListingResolver) : IDummyService
{
	public async Task<IProcessingState> SaveAsync(DummyDto dummyDto, Owner owner, string username)
	{
		var dummyEntity = await repository.GetByIdAsync(dummyDto.Id) ?? new DummyEntity( );
		dummyEntity.Name = dummyDto.Name;
		dummyEntity.Age = dummyDto.Age;
		dummyEntity.Id = dummyDto.Id.IsNotNullAndEmpty( ) ? dummyDto.Id : null!;
		var validationResult = new DummyValidator( ).Validate(dummyEntity);

		if (!validationResult.IsValid)
			return validationResult.ToValidationErrorState(nameof(DummyEntity));

		try
		{
			var savedEntity = await repository.SaveAsync(dummyEntity, username);
			await repository.CommitAsync( );
			return new SuccessState<DummyEntity>("Entity has been saved", savedEntity);
		}
		catch (Exception ex)
		{
			return new ExceptionState("An error occurred while saving the entity", ex.Message);
		}
	}

	public async Task<IProcessingState> GetAsync(string ownerId, bool allowInactive = false)
	{
		try
		{
			var entities = await repository.GetByOwnerAsync(ownerId, allowInactive);
			var dto = entities.Select(workspaceListingResolver.Resolve).ToList( );
			return new SuccessState<List<DummyDto>>("Entities have been fetched", dto);
		}
		catch (Exception ex)
		{
			return new ExceptionState("An error occurred while fetching the entities", ex.Message);
		}
	}

	public async Task<IProcessingState> DeleteAsync(string id, string ownerId)
	{
		var entity = await repository.GetByIdAsync(id);
		if (entity is null)
			return new ErrorState("Workspace not found");

		//if (!entity.Owner.Id.IsEqual(ownerId))
		//	return new UnauthorizedState("You are not authorized to perform this action");

		try
		{
			entity.IsDeleted = true;
			await repository.SaveAsync(entity, ownerId);
			await repository.CommitAsync( );
			return new SuccessState("Entity has been deleted");
		}
		catch (Exception ex)
		{
			return new ExceptionState("An error occurred while deleting the workspace", ex.Message);
		}
	}
}
