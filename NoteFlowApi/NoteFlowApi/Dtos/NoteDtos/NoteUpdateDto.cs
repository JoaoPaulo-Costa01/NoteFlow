using System.ComponentModel.DataAnnotations;

namespace NoteFlowApi.Dtos.NoteDtos;

// DTO de ENTRADA: representa o corpo do PUT /api/notes/{id}
public class NoteUpdateDto {
    [MaxLength(255)]
    public string? Title { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;
}