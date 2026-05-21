using System.ComponentModel.DataAnnotations;

namespace NoteFlowApi.Models {

    public class Note {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [MaxLength(255)]
        public string? Title { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public NoteStatus Status { get; set; } = NoteStatus.Active;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Preparação para Auth — FK sem navegação por enquanto
        [Required]
        public Guid UserId { get; set; }

        // Navegação N:N via NoteTag
        public ICollection<NoteTag> NoteTags { get; set; } = [];
    }
}