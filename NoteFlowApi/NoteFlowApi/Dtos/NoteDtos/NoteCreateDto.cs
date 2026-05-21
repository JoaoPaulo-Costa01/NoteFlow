using System.ComponentModel.DataAnnotations;

namespace NoteFlowApi.Dtos.NoteDtos;
public class NoteCreateDto {
    [MaxLength(255)]
    public string? Title { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    public List<Guid>? TagIds { get; set; }
}