using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteFlowApi.Dtos.NoteDtos;
using NoteFlowApi.Dtos.TagDtos; 
using NoteFlowApi.Interfaces;
using NoteFlowApi.Models;

namespace NoteFlowApi.Controllers;

[Authorize]
[ApiController]
[Route("api/notes")]
public class NotesController : BaseController {
    private readonly INoteRepository _noteRepo;

    public NotesController(INoteRepository noteRepo) {
        _noteRepo = noteRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? tagId,
        [FromQuery] NoteStatus? status) {
        var notes = await _noteRepo.GetAllAsync(CurrentUserId, tagId, status);
        var response = notes.Select(MapToResponseDto);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id) {
        var note = await _noteRepo.GetByIdAsync(id, CurrentUserId);

        if (note is null)
            return NotFound();

        return Ok(MapToResponseDto(note));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] NoteCreateDto dto) {
        var note = new Note {
            Title = dto.Title,
            Content = dto.Content,
            UserId = CurrentUserId
        };

        var created = await _noteRepo.CreateAsync(note, dto.TagIds);

        if (created is null)
            return BadRequest();

        var response = MapToResponseDto(created);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] NoteUpdateDto dto) {
        var success = await _noteRepo.UpdateAsync(id, CurrentUserId, dto.Title, dto.Content);

        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpPatch("{id:guid}/archive")]
    public async Task<IActionResult> Archive(Guid id) {
        var success = await _noteRepo.ArchiveAsync(id, CurrentUserId);

        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpPatch("{id:guid}/restore")]
    public async Task<IActionResult> Restore(Guid id) {
        var success = await _noteRepo.RestoreAsync(id, CurrentUserId);

        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) {
        var success = await _noteRepo.DeleteAsync(id, CurrentUserId);

        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpPost("{noteId:guid}/tags")]
    public async Task<IActionResult> AddTag(Guid noteId, [FromBody] AddTagDto dto) {
        var success = await _noteRepo.AddTagAsync(noteId, dto.TagId, CurrentUserId);

        if (!success)
            return BadRequest();

        return NoContent();
    }

    [HttpDelete("{noteId:guid}/tags/{tagId:guid}")]
    public async Task<IActionResult> RemoveTag(Guid noteId, Guid tagId) {
        var success = await _noteRepo.RemoveTagAsync(noteId, tagId, CurrentUserId);

        if (!success)
            return NotFound();

        return NoContent();
    }

    private static NoteResponseDto MapToResponseDto(Note note) {
        return new NoteResponseDto {
            Id = note.Id,
            Title = note.Title,
            Content = note.Content,
            Status = note.Status.ToString(),
            CreatedAt = note.CreatedAt,
            UpdatedAt = note.UpdatedAt,
            Tags = note.NoteTags.Select(nt => new TagResponseDto {
                Id = nt.Tag.Id,
                Name = nt.Tag.Name
            })
        };
    }
}