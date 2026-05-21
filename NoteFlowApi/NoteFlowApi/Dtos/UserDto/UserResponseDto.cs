namespace NoteFlowApi.Dtos.UserDto;

public class UserResponseDto {
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}