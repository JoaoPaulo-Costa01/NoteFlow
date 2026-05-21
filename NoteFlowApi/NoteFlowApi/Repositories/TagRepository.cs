using Microsoft.EntityFrameworkCore;
using NoteFlowApi.Data;
using NoteFlowApi.Interfaces;
using NoteFlowApi.Models;

namespace NoteFlowApi.Repositories;

public class TagRepository : ITagRepository {
    
    private readonly AppDbContext _db;

    public TagRepository(AppDbContext db) {
        _db = db;
    }

    public async Task<IEnumerable<Tag>> GetAllAsync(Guid userId) {
        return await _db.Tags
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.Name)
            .ToListAsync(); // Retorna as entidades puras
    }

    public async Task<bool> ExistsAsync(Guid userId, string name, Guid? excludeId = null) {
        var query = _db.Tags
            .Where(t => t.UserId == userId && t.Name == name);

        if (excludeId.HasValue)
            query = query.Where(t => t.Id != excludeId.Value);

        return await query.AnyAsync();
    }

    public async Task<Tag> CreateAsync(Tag tag) {
        _db.Tags.Add(tag);
        await _db.SaveChangesAsync();
        return tag; // Retorna a Entidade
    }

    public async Task<bool> UpdateAsync(Guid id, Guid userId, string name) {
        var tag = await _db.Tags
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (tag is null) return false;

        tag.Name = name;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId) {
        var tag = await _db.Tags
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (tag is null) return false;

        _db.Tags.Remove(tag);
        await _db.SaveChangesAsync();
        return true;
    }
}