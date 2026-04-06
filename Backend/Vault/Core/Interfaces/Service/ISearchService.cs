using Core.DTOs;

namespace Core.Interfaces.Service;
public interface ISearchService
{
    Task<ResponseResult<IEnumerable<Document>>> KeywordSearchAsync(string query);
    Task<ResponseResult<IEnumerable<Document>>> SemanticSearchAsync(string query);
    Task<ResponseResult<string>> AskVaultAsync(string question);
}
