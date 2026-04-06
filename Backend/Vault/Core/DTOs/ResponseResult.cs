using Core.Constants;

namespace Core.DTOs
{
    public class ResponseResult<T>
    {
        public ResponseResult()
        {
        }

        public ResponseResult(bool isSucceeded)
        {
            IsSucceeded = isSucceeded;
            ApiStatusCode = ConstAppConfiguration.ApiStatusCode.OK;
            ErrorMessage = null;
            ReturnData = default;
        }
        public ResponseResult(string? errorMessage)
        {
            IsSucceeded = false;
            ApiStatusCode = ConstAppConfiguration.ApiStatusCode.BadRequest;
            ErrorMessage = errorMessage;
            ReturnData = default;
        }

        public ResponseResult(T? returnData, int apiStatusCode)
        {
            IsSucceeded = true;
            ApiStatusCode = apiStatusCode;
            ErrorMessage = "";
            ReturnData = returnData;
        }

        public ResponseResult(T? returnData, int apiStatusCode, bool isSucceeded)
        {
            IsSucceeded = isSucceeded;
            ApiStatusCode = apiStatusCode;
            ErrorMessage = "";
            ReturnData = returnData;
        }
        public ResponseResult(T? returnData, int apiStatusCode, string successMessage)
        {
            IsSucceeded = true;
            ApiStatusCode = apiStatusCode;
            ErrorMessage = "";
            ReturnData = returnData;
            SuccessMessage = successMessage;
        }

        public ResponseResult(string? errorMessage, int apiStatusCode)
        {
            IsSucceeded = false;
            ApiStatusCode = apiStatusCode;
            ErrorMessage = errorMessage;
            ReturnData = default;
        }

        public ResponseResult(T? returnData, int apiStatusCode, bool isSucceeded, string errorMessage)
        {
            IsSucceeded = isSucceeded;
            ApiStatusCode = apiStatusCode;
            ErrorMessage = "";
            ReturnData = returnData;
            ErrorMessage = errorMessage;
        }
        public bool IsSucceeded { get; set; }
        public int ApiStatusCode { get; set; }
        public string? SuccessMessage { get; set; }
        public string? ErrorMessage { get; set; }
        public T? ReturnData { get; set; }
        public object? ExtraReturnData { get; set; }
        public object? Extra2ReturnData { get; set; }
    }
}