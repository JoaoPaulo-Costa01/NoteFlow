using NoteFlowApi.Models;

namespace NoteFlowApi.Dtos.AiDtos;

public class AiRequestDto {
    public string Content { get; set; } = string.Empty;
    public AiAction Action { get; set; }
}