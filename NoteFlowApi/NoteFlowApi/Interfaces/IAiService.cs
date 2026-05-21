using NoteFlowApi.Models;

namespace NoteFlowApi.Interfaces;

public interface IAiService {
    Task<string> ProcessAsync(string content, AiAction action);
}