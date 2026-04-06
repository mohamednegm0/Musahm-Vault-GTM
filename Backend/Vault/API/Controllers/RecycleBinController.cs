using Microsoft.AspNetCore.Mvc;
using Core.DTOs;
using Core.Interfaces.Service;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Api.Controllers;

[Route("api/recycle-bin")]
[ApiController]
public class RecycleBinController : BaseApiController
{
    private readonly IRecycleBinService _recycleBinService;

    public RecycleBinController(IRecycleBinService recycleBinService)
    {
        _recycleBinService = recycleBinService;
    }

    [HttpGet]
    public async Task<ActionResult<ResponseResult<IEnumerable<RecycleBinItemDto>>>> GetDeletedItems()
    {
        if (CurrentUser == null) return Unauthorized(new ResponseResult<IEnumerable<RecycleBinItemDto>>("Unauthorized", Core.Constants.ConstAppConfiguration.ApiStatusCode.UnAuthorized));
        var result = await _recycleBinService.GetDeletedItemsAsync(CurrentUser);
        return Ok(result);
    }

    [HttpPost("restore/{itemType}/{id}")]
    public async Task<ActionResult<ResponseResult<StringModel>>> RestoreItem(string itemType, string id)
    {
        if (CurrentUser == null) return Unauthorized(new ResponseResult<StringModel>("Unauthorized", Core.Constants.ConstAppConfiguration.ApiStatusCode.UnAuthorized));
        var result = await _recycleBinService.RestoreItemAsync(itemType, id, CurrentUser);
        return Ok(result);
    }

    [HttpDelete("hard-delete/{itemType}/{id}")]
    public async Task<ActionResult<ResponseResult<StringModel>>> HardDeleteItem(string itemType, string id)
    {
        if (CurrentUser == null) return Unauthorized(new ResponseResult<StringModel>("Unauthorized", Core.Constants.ConstAppConfiguration.ApiStatusCode.UnAuthorized));
        var result = await _recycleBinService.HardDeleteItemAsync(itemType, id, CurrentUser);
        return Ok(result);
    }

    [HttpDelete("empty")]
    public async Task<ActionResult<ResponseResult<StringModel>>> EmptyRecycleBin()
    {
        if (CurrentUser == null) return Unauthorized(new ResponseResult<StringModel>("Unauthorized", Core.Constants.ConstAppConfiguration.ApiStatusCode.UnAuthorized));
        var result = await _recycleBinService.EmptyRecycleBinAsync(CurrentUser);
        return Ok(result);
    }
}
