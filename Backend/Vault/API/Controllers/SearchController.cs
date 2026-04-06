using System.ComponentModel.DataAnnotations;
using Core.DTOs;
using Core.Interfaces.Service;
using static Core.Constants.ConstAppConfiguration;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SearchController(ISearchService service, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly ISearchService _service = service;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpPost("keyword")]
    public async Task<ActionResult<ResponseResult<IEnumerable<Document>>>> Keyword([FromBody] SearchRequest request)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<IEnumerable<Document>>(errorMessage, ApiStatusCode.BadRequest));
        }
        return Ok(await _service.KeywordSearchAsync(request.Query));
    }

    [HttpPost("semantic")]
    public async Task<ActionResult<ResponseResult<IEnumerable<Document>>>> Semantic([FromBody] SearchRequest request)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<IEnumerable<Document>>(errorMessage, ApiStatusCode.BadRequest));
        }
        return Ok(await _service.SemanticSearchAsync(request.Query));
    }

    [HttpPost("ask")]
    public async Task<ActionResult<ResponseResult<object>>> Ask([FromBody] SearchRequest request)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<object>(errorMessage, ApiStatusCode.BadRequest));
        }
        return Ok(new ResponseResult<object>(new { answer = await _service.AskVaultAsync(request.Query) }, ApiStatusCode.OK));
    }
}

public class SearchRequest : IValidatableObject
{
    public string Query { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;
        if (string.IsNullOrEmpty(Query))
        {
            yield return new ValidationResult(localizationService?.Get("Val_Required") ?? "Query is required", new[] { nameof(Query) });
        }
    }
}
