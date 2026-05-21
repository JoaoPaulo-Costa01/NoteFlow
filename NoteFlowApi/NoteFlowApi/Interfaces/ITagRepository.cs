using NoteFlowApi.Models;

namespace NoteFlowApi.Interfaces;

public interface ITagRepository {
    Task<IEnumerable<Tag>> GetAllAsync(Guid userId);
    Task<bool> ExistsAsync(Guid userId, string name, Guid? excludeId = null);
    Task<Tag> CreateAsync(Tag tag);
    Task<bool> UpdateAsync(Guid id, Guid userId, string name);
    Task<bool> DeleteAsync(Guid id, Guid userId);
}