namespace Core.Constants
{
    public class ConstAppConfiguration
    {

        public const string EmailPattern = @"^((?:(?:(?:\w[\.\-\+]?)*)\w)+)\@((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$";


        public static class ApiStatusCode
        {
            public const int OK = 200;
            public const int Created = 201;
            public const int Accepted = 202;
            public const int NoContent = 204;
            public const int Found = 302;
            public const int PermanentRedirect = 308;
            public const int BadRequest = 400;
            public const int UnAuthorized = 401;
            public const int Forbidden = 403;
            public const int NotFound = 404;
            public const int MethodNotAllowed = 405;
            public const int Conflict = 409;
            public const int ExpectationFailed = 417;
            public const int InternalServerError = 500;
            public const int WorkflowRequired = 460; // Custom: action blocked pending workflow approval
        }
    }
}
