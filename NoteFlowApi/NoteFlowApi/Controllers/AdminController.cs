using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NoteFlowApi.Data;
using NoteFlowApi.Dtos.UserDto;
using NoteFlowApi.Models;
using System.Security.Claims;

namespace NoteFlowApi.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase {
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _db;

    public AdminController(UserManager<ApplicationUser> userManager, AppDbContext db) {
        _userManager = userManager;
        _db = db;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers() {
        var users = await _userManager.Users
            .OrderBy(u => u.Email)
            .ToListAsync();

        var response = users.Select(u => new UserResponseDto {
            Id = u.Id,
            Email = u.Email!,
            CreatedAt = u.CreatedAt
        });

        return Ok(response);
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id) {
        var user = await _userManager.FindByIdAsync(id.ToString());

        if (user is null)
            return NotFound(new { error = "Usuário não encontrado." });

        var requesterId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (id == requesterId)
            return BadRequest(new { error = "Um administrador não pode deletar a própria conta por esta rota." });

        var result = await _userManager.DeleteAsync(user);

        if (!result.Succeeded)
            return StatusCode(500, new { error = "Falha ao deletar usuário." });

        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats() {
        var totalUsers = await _userManager.Users.CountAsync();
        var totalNotes = await _db.Notes.CountAsync();
        var totalActiveNotes = await _db.Notes.CountAsync(n => n.Status == NoteStatus.Active);
        var totalArchivedNotes = await _db.Notes.CountAsync(n => n.Status == NoteStatus.Archived);
        var totalTags = await _db.Tags.CountAsync();

        return Ok(new { totalUsers, totalNotes, totalActiveNotes, totalArchivedNotes, totalTags });
    }
}