// DTOs/TagResponseDto.cs
namespace NoteFlowApi.Dtos.TagDtos;

// DTO de SAÍDA para Tag — também em classe clássica
public class TagResponseDto {
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}