using Microsoft.EntityFrameworkCore;
using NoteFlowApi.Data;
using NoteFlowApi.Interfaces;
using NoteFlowApi.Models;

namespace NoteFlowApi.Repositories;

// Responsabilidade única: conversar com o banco de dados.
// Retorna entidades Note — jamais DTOs.
public class NoteRepository : INoteRepository {
    private readonly AppDbContext _db;

    public NoteRepository(AppDbContext db) {
        _db = db;
    }

    // Inclui NoteTags/Tag para que a Controller tenha os dados completos ao mapear
    public async Task<IEnumerable<Note>> GetAllAsync(Guid userId, Guid? tagId, NoteStatus? status) {
        var query = _db.Notes
            .Include(n => n.NoteTags)
                .ThenInclude(nt => nt.Tag)
            .Where(n => n.UserId == userId)
            .AsQueryable();

        query = status.HasValue
            ? query.Where(n => n.Status == status.Value)
            : query.Where(n => n.Status == NoteStatus.Active);

        if (tagId.HasValue)
            query = query.Where(n => n.NoteTags.Any(nt => nt.TagId == tagId.Value));

        // Retorna as entidades ordenadas — sem projeção para DTO
        return await query
            .OrderByDescending(n => n.UpdatedAt)
            .ToListAsync();
    }

    // Busca por Id garantindo posse pelo UserId (segurança)
    public async Task<Note?> GetByIdAsync(Guid id, Guid userId) {
        return await _db.Notes
            .Include(n => n.NoteTags)
                .ThenInclude(nt => nt.Tag)
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
    }

    // Repositório recebe a entidade pronta, associa tags e salva no banco
    public async Task<Note?> CreateAsync(Note note, List<Guid>? tagIds) {
        if (tagIds is { Count: > 0 }) {
            var validTagIds = await _db.Tags
                .Where(t => tagIds.Contains(t.Id) && t.UserId == note.UserId)
                .Select(t => t.Id)
                .ToListAsync();

            foreach (var tagId in validTagIds)
                note.NoteTags.Add(new NoteTag { TagId = tagId });
        }

        _db.Notes.Add(note);
        await _db.SaveChangesAsync();

        // Recarrega a entidade com as navegações para a Controller mapear corretamente
        return await GetByIdAsync(note.Id, note.UserId);
    }

    public async Task<bool> UpdateAsync(Guid id, Guid userId, string? title, string content) {
        var note = await _db.Notes
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (note is null)
            return false;

        note.Title = title;
        note.Content = content;
        note.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ArchiveAsync(Guid id, Guid userId) {
        var note = await _db.Notes
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (note is null)
            return false;

        note.Status = NoteStatus.Archived;
        note.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreAsync(Guid id, Guid userId) {
        var note = await _db.Notes
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (note is null)
            return false;

        note.Status = NoteStatus.Active;
        note.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId) {
        var note = await _db.Notes
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (note is null)
            return false;

        _db.Notes.Remove(note);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AddTagAsync(Guid noteId, Guid tagId, Guid userId) {
        var noteExists = await _db.Notes.AnyAsync(n => n.Id == noteId && n.UserId == userId);
        if (!noteExists) return false;

        var tagExists = await _db.Tags.AnyAsync(t => t.Id == tagId && t.UserId == userId);
        if (!tagExists) return false;

        var alreadyLinked = await _db.NoteTags.AnyAsync(nt => nt.NoteId == noteId && nt.TagId == tagId);
        if (alreadyLinked) return false;

        _db.NoteTags.Add(new NoteTag { NoteId = noteId, TagId = tagId });
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveTagAsync(Guid noteId, Guid tagId, Guid userId) {
        var noteTag = await _db.NoteTags
            .Include(nt => nt.Note)
            .FirstOrDefaultAsync(nt =>
                nt.NoteId == noteId &&
                nt.TagId == tagId &&
                nt.Note.UserId == userId);

        if (noteTag is null) return false;

        _db.NoteTags.Remove(noteTag);
        await _db.SaveChangesAsync();
        return true;
    }
}