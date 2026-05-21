namespace NoteFlowApi.Infrastructure.AI;

internal class GeminiRequest {
    public List<GeminiContent> Contents { get; set; } = [];
}

internal class GeminiContent {
    public List<GeminiPart> Parts { get; set; } = [];
}

internal class GeminiPart {
    public string Text { get; set; } = string.Empty;
}

internal class GeminiResponse {
    public List<GeminiCandidate> Candidates { get; set; } = [];
}

internal class GeminiCandidate {
    public GeminiContent Content { get; set; } = new();
}