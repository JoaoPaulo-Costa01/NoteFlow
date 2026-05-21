using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteFlowApi.Dtos.AiDtos;
using NoteFlowApi.Interfaces;

namespace NoteFlowApi.Controllers;

[Authorize]
[ApiController]
[Route("api/ai")]
public class AiController : BaseController {
    private readonly IAiService _aiService;

    public AiController(IAiService aiService) {
        _aiService = aiService;
    }

    [HttpPost]
    public async Task<IActionResult> Process([FromBody] AiRequestDto dto) {
        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest(new { error = "O conteúdo da nota não pode estar vazio." });

        var result = await _aiService.ProcessAsync(dto.Content, dto.Action);

        if (string.IsNullOrWhiteSpace(result))
            return StatusCode(503, new { error = "A IA está sobrecarregada no momento. Tente novamente em alguns instantes." });

        return Ok(new AiResponseDto { Result = result });
    }
}