using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NoteFlowApi.Models;

namespace NoteFlowApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options) {
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<NoteTag> NoteTags => Set<NoteTag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        // Obrigatório: inicializa as tabelas do Identity
        base.OnModelCreating(modelBuilder);

        // ── NoteTag: chave primária composta ──────────────────────────────
        modelBuilder.Entity<NoteTag>()
            .HasKey(nt => new { nt.NoteId, nt.TagId });

        // ── NoteTag → Note ────────────────────────────────────────────────
        modelBuilder.Entity<NoteTag>()
            .HasOne(nt => nt.Note)
            .WithMany(n => n.NoteTags)
            .HasForeignKey(nt => nt.NoteId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── NoteTag → Tag ─────────────────────────────────────────────────
        modelBuilder.Entity<NoteTag>()
            .HasOne(nt => nt.Tag)
            .WithMany(t => t.NoteTags)
            .HasForeignKey(nt => nt.TagId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Note: Status armazenado como string legível no banco ──────────
        modelBuilder.Entity<Note>()
            .Property(n => n.Status)
            .HasConversion<string>();

        // ── Tag: unicidade de Name por UserId ─────────────────────────────
        modelBuilder.Entity<Tag>()
            .HasIndex(t => new { t.UserId, t.Name })
            .IsUnique();
    }
}