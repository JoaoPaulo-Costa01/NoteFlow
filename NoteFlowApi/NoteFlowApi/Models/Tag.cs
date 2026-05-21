using System.ComponentModel.DataAnnotations;

namespace NoteFlowApi.Models;

public class Tag {
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    // Preparação para Auth — FK sem navegação por enquanto
    [Required]
    public Guid UserId { get; set; }

    // Navegação N:N via NoteTag
    public ICollection<NoteTag> NoteTags { get; set; } = [];
}