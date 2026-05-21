// Controllers/TagsController.cs
using Microsoft.AspNetCore.Mvc;
using NoteFlowApi.Dtos.TagDtos;
using NoteFlowApi.Interfaces;
using NoteFlowApi.Models;

namespace NoteFlowApi.Controllers;

[Route("api/tags")]
public class TagsController : BaseController {
    // Construtor Clássico Explícito
    private readonly ITagRepository _tagRepo;

    public TagsController(ITagRepository tagRepo) {
        _tagRepo = tagRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() {
        // Pega as entidades do banco
        var tags = await _tagRepo.GetAllAsync(CurrentUserId);

        // Traduz as entidades para DTOs
        var response = tags.Select(MapToResponseDto);

        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TagRequestDto dto) {
        var exists = await _tagRepo.ExistsAsync(CurrentUserId, dto.Name.Trim());
        if (exists)
            return Conflict(new { error = "Já existe uma tag com este nome." });

        // Monta a entidade
        var tag = new Tag {
            Name = dto.Name.Trim(),
            UserId = CurrentUserId
        };

        // Salva a entidade
        var created = await _tagRepo.CreateAsync(tag);

        // Traduz a entidade salva para DTO de saída
        var response = MapToResponseDto(created);

        return Created($"/api/tags/{response.Id}", response);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] TagRequestDto dto) {
        var nameConflict = await _tagRepo.ExistsAsync(CurrentUserId, dto.Name.Trim(), excludeId: id);
        if (nameConflict)
            return Conflict(new { error = "Já existe outra tag com este nome." });

        var updated = await _tagRepo.UpdateAsync(id, CurrentUserId, dto.Name.Trim());
        return updated ? NoContent() : NotFound();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) {
        var deleted = await _tagRepo.DeleteAsync(id, CurrentUserId);
        return deleted ? NoContent() : NotFound();
    }

    // Método Tradutor (Entidade -> DTO)
    private static TagResponseDto MapToResponseDto(Tag tag) {
        return new TagResponseDto {
            Id = tag.Id,
            Name = tag.Name
        };
    }
}