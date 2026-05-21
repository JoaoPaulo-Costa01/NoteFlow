using Google.GenAI;
using NoteFlowApi.Interfaces;
using NoteFlowApi.Models;

namespace NoteFlowApi.Infrastructure.AI;

public class GeminiService : IAiService {
    private readonly string _apiKey;
    private readonly string _model;
    private readonly ILogger<GeminiService> _logger;

    public GeminiService(IConfiguration configuration, ILogger<GeminiService> logger) {
        _apiKey = configuration["GeminiSettings:ApiKey"]!;
        _model = configuration["GeminiSettings:Model"] ?? "gemini-2.5-flash";
        _logger = logger;
    }

    public async Task<string> ProcessAsync(string content, AiAction action) {
        try {
            Environment.SetEnvironmentVariable("GEMINI_API_KEY", _apiKey);
            Environment.SetEnvironmentVariable("GOOGLE_API_KEY", _apiKey);

            var client = new Client();
            var prompt = BuildPrompt(content, action);

            var response = await client.Models.GenerateContentAsync(model: _model, contents: prompt);

            return response?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text ?? string.Empty;
        } catch (Exception ex) {
            _logger.LogError(ex, "Gemini API request failed.");
            return string.Empty;
        }
    }

    private static string BuildPrompt(string content, AiAction action) {
        return action switch {
            AiAction.Summarize =>
                $"Crie um resumo conciso e objetivo do seguinte texto em português. Retorne apenas o resumo, sem introduções ou explicações adicionais:\n\n{content}",

            AiAction.SuggestTags =>
                $"Analise o seguinte texto e retorne de 3 a 5 palavras-chave relevantes separadas por vírgula, em letras minúsculas, sem espaços entre as palavras compostas. Retorne apenas as palavras-chave, sem explicações:\n\n{content}",

            AiAction.ImproveWriting =>
                $"Corrija a gramática, melhore a clareza e a coesão do seguinte texto em português, mantendo o tom e a intenção originais. Retorne apenas o texto melhorado, sem comentários adicionais:\n\n{content}",

            AiAction.GenerateTitle =>
                $"Crie um título curto e objetivo com no máximo 8 palavras para o seguinte texto em português. Retorne apenas o título, sem aspas ou pontuação final:\n\n{content}",

            _ => throw new ArgumentOutOfRangeException(nameof(action), action, null)
        };
    }
}