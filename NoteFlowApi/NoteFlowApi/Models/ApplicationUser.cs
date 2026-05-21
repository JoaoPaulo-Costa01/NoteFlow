using Microsoft.AspNetCore.Identity;

namespace NoteFlowApi.Models;

public class ApplicationUser : IdentityUser<Guid> {
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}