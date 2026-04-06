using Core.DTOs;
using static Core.Constants.ConstAppConfiguration;

namespace Service;

public class SearchService : ISearchService
{
    private readonly IUnitOfWork _unitOfWork;

    public SearchService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ResponseResult<IEnumerable<Document>>> KeywordSearchAsync(string query)
    {
        // Simple mock search in title/content
        var results = await _unitOfWork.Documents.FindAsync(d => 
            d.Title.Contains(query, StringComparison.OrdinalIgnoreCase)
        );
        return new ResponseResult<IEnumerable<Document>>(results, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<Document>>> SemanticSearchAsync(string query)
    {
        // Placeholder for real Vector/Semantic search
        // Using keyword search as fallback
        var results = await _unitOfWork.Documents.FindAsync(d => 
            d.Title.Contains(query, StringComparison.OrdinalIgnoreCase)
        );
         return new ResponseResult<IEnumerable<Document>>(results, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<string>> AskVaultAsync(string question)
    {
        // Placeholder for RAG/AI logic
        return new ResponseResult<string>("I am Musahm AI. You asked: '" + question + "'. Based on your vault, I found that we are still working on the RAG integration.", ApiStatusCode.OK);
    }
}
