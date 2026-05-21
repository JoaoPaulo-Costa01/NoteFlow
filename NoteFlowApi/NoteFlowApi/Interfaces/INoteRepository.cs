// Interfaces/INoteRepository.cs
using NoteFlowApi.Models;

namespace NoteFlowApi.Interfaces;

// Contrato do repositório: opera APENAS com entidades do domínio.
// Nenhum método aqui conhece ou menciona DTOs.
public interface INoteRepository {
    Task<IEnumerable<Note>> GetAllAsync(Guid userId, Guid? tagId, NoteStatus? status);
    Task<Note?> GetByIdAsync(Guid id, Guid userId);
    Task<Note?> CreateAsync(Note note, List<Guid>? tagIds);
    Task<bool> UpdateAsync(Guid id, Guid userId, string? title, string content);
    Task<bool> ArchiveAsync(Guid id, Guid userId);
    Task<bool> RestoreAsync(Guid id, Guid userId);
    Task<bool> DeleteAsync(Guid id, Guid userId);
    Task<bool> AddTagAsync(Guid noteId, Guid tagId, Guid userId);
    Task<bool> RemoveTagAsync(Guid noteId, Guid tagId, Guid userId);
}