using Core.Interfaces.Service;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using RestSharp;

namespace Service.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly string _senderEmail;
    private readonly string _clientId;
    private readonly string _clientSecret;
    private readonly string _tenantId;
    private readonly string _frontendUrl;

    public EmailService(IConfiguration config)
    {
        _config = config;
        var settings = _config.GetSection("EmailSettings");
        _senderEmail = settings["SenderEmail"] ?? "";
        _clientId = settings["ClientId"] ?? "";
        _clientSecret = settings["ClientSecret"] ?? "";
        _tenantId = settings["TenantId"] ?? "";
        _frontendUrl = settings["FrontendUrl"] ?? "https://www-s2.vault.musahm.com";
    }

    private async Task<string> GetAccessTokenAsync()
    {
        var client = new RestClient($"https://login.microsoftonline.com/{_tenantId}/oauth2/v2.0/token");
        var request = new RestRequest();
        request.Method = Method.Post;
        request.AddParameter("client_id", _clientId);
        request.AddParameter("scope", "https://graph.microsoft.com/.default");
        request.AddParameter("client_secret", _clientSecret);
        request.AddParameter("grant_type", "client_credentials");

        var response = await client.ExecuteAsync(request);
        if (!response.IsSuccessful)
        {
            throw new Exception($"Failed to get access token: {response.Content}");
        }

        var json = JsonDocument.Parse(response.Content!);
        return json.RootElement.GetProperty("access_token").GetString()!;
    }

    public async Task SendOtpEmailAsync(string toEmail, string otp, string documentName)
    {
        var subject = "Your Verification Code - رمز التحقق الخاص بك";
        var fileNameStyled = $"<div style='background: #f3f4f6; border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; margin: 15px 0; font-weight: 700; color: #4f46e5; text-align: center;'>{documentName}</div>";
        
        var body = GetBilingualHtmlTemplate(
            "Verification Code", "رمز التحقق",
            $"Your verification code to access the document:{fileNameStyled}", 
            $"رمز التحقق الخاص بك للوصول للمستند:{fileNameStyled}",
            otp, // Display OTP prominently
            "" // No button for OTP
        );
        
        await SendGraphEmailAsync(toEmail, subject, body);
    }

    public async Task SendTaskAssignedEmailAsync(string toEmail, string taskTitle, string taskId, string? documentName = null, string? documentId = null)
    {
        Console.WriteLine($"[EmailService] Preparing to send Task Assigned email to: {toEmail}, TaskId: {taskId}");
        var subject = $"Task Assigned - {taskTitle} - تم إسناد مهمة";
        var link = $"{_frontendUrl}/tasks"; 

        string docPreviewEn = "";
        string docPreviewAr = "";

        if (!string.IsNullOrEmpty(documentName) && !string.IsNullOrEmpty(documentId))
        {
             var docLink = $"{_frontendUrl}/document/view?id={documentId}";
             var fileNameStyled = $"<div style='background: #f3f4f6; border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; margin: 15px 0; font-weight: 700; color: #4f46e5; text-align: center;'><a href='{docLink}' style='text-decoration:none; color:#4f46e5;'>{documentName}</a></div>";
             
             docPreviewEn = $"<br/><p>Please review the attached document:</p>{fileNameStyled}";
             docPreviewAr = $"<br/><p>يرجى مراجعة المستند المرفق:</p>{fileNameStyled}";
        }
        
        var body = GetBilingualHtmlTemplate(
            "New Task Assigned", "تم إسناد مهمة جديدة",
            $"A new task has been assigned to you: <b>{taskTitle}</b>{docPreviewEn}",
            $"تم إسناد مهمة جديدة لك: <b>{taskTitle}</b>{docPreviewAr}",
            "View Task", "عرض المهمة",
            link
        );
        
        await SendGraphEmailAsync(toEmail, subject, body);
    }

    public async Task SendInvitationEmailAsync(string toEmail, string invitationId, string documentName)
    {
        var subject = "New Document Invitation - دعوة جديدة لمستند";
        var link = $"{_frontendUrl}/invitation/accept?id={invitationId}&email={toEmail}";
        var fileNameStyled = $"<div style='background: #f3f4f6; border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; margin: 15px 0; font-weight: 700; color: #4f46e5; text-align: center;'>{documentName}</div>";

        var body = GetBilingualHtmlTemplate(
            "New Invitation", "دعوة جديدة",
            $"You have been invited to access the document:{fileNameStyled}",
            $"لقد تمت دعوتك للوصول إلى المستند:{fileNameStyled}",
            "Accept Invitation", "قبول الدعوة",
            link
        );
        
        await SendGraphEmailAsync(toEmail, subject, body);
    }

    public async Task SendInvitationAcceptedEmailAsync(string toEmail, string invitationId, string documentName)
    {
        var subject = "Access Granted - تم منح الصلاحية";
        var link = $"{_frontendUrl}/document/view?id={invitationId}&email={toEmail}";
        var fileNameStyled = $"<div style='background: #f3f4f6; border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; margin: 15px 0; font-weight: 700; color: #4f46e5; text-align: center;'>{documentName}</div>";

        var body = GetBilingualHtmlTemplate(
            "Access Granted", "تم منح الصلاحية",
            $"You have successfully accepted the invitation for:{fileNameStyled}",
            $"لقد قمت بقبول الدعوة بنجاح للمستند:{fileNameStyled}",
            "View Document", "عرض المستند",
            link
        );
        
        await SendGraphEmailAsync(toEmail, subject, body);
    }

    private async Task SendGraphEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            string accessToken = await GetAccessTokenAsync();
            var client = new RestClient("https://graph.microsoft.com/v1.0");
            var request = new RestRequest($"/users/{_senderEmail}/sendMail");
            request.Method = Method.Post;
            request.AddHeader("Authorization", $"Bearer {accessToken}");
            request.AddHeader("Content-Type", "application/json");

            var emailPayload = new
            {
                message = new
                {
                    subject = subject,
                    body = new
                    {
                        contentType = "HTML",
                        content = body
                    },
                    toRecipients = new[]
                    {
                        new { emailAddress = new { address = toEmail } }
                    }
                },
                saveToSentItems = "true"
            };

            request.AddJsonBody(emailPayload);

            var response = await client.ExecuteAsync(request);
            if (!response.IsSuccessful)
            {
                throw new Exception($"Failed to send email via Graph API: {response.Content}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending email: {ex.Message}");
            throw;
        }
    }

    private string GetBilingualHtmlTemplate(string titleEn, string titleAr, string messageEn, string messageAr, string actionTextOrCode, string actionTextAr = "", string buttonUrl = "")
    {
        bool isButton = !string.IsNullOrEmpty(buttonUrl);
        string actionHtmlEn, actionHtmlAr;
        
        if (isButton)
        {
            actionHtmlEn = $@"<div style='text-align: left; margin-top: 20px;'>
                                <a href='{buttonUrl}' class='button'>{actionTextOrCode}</a>
                            </div>";
                            
            actionHtmlAr = $@"<div style='text-align: right; margin-top: 20px;'>
                                <a href='{buttonUrl}' class='button'>{actionTextAr}</a>
                            </div>";
        }
        else 
        {
            // It's a code
            actionHtmlEn = $@"<div style='text-align: left; margin-top: 20px;'>
                                <div class='otp-code'>{actionTextOrCode}</div>
                              </div>";
                              
            actionHtmlAr = $@"<div style='text-align: right; margin-top: 20px;'>
                                <div class='otp-code'>{actionTextOrCode}</div>
                              </div>";
        }

        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); direction: ltr; }}
        .header {{ background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px 20px; text-align: center; color: white; }}
        .header h1 {{ margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }}
        .content {{ padding: 40px; color: #374151; }}
        
        /* English Section */
        .section-en {{ text-align: left; margin-bottom: 25px; }}
        .section-en h2 {{ color: #111827; font-size: 22px; margin-top: 0; margin-bottom: 15px; }}
        .section-en p {{ font-size: 16px; line-height: 1.6; margin: 0; }}

        /* Divider */
        .divider {{ height: 1px; background-color: #e5e7eb; margin: 30px 0; }}

        /* Arabic Section */
        .section-ar {{ text-align: right; direction: rtl; margin-bottom: 25px; }}
        .section-ar h2 {{ font-family: 'Tahoma', sans-serif; color: #111827; font-size: 20px; margin-top: 0; margin-bottom: 15px; }}
        .section-ar p {{ font-family: 'Tahoma', sans-serif; font-size: 16px; line-height: 1.6; margin: 0; }}

        .button {{ display: inline-block; padding: 12px 30px; background: #6366f1; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); min-width: 150px; text-align: center; }}
        .button:hover {{ background: #4f46e5; transform: translateY(-2px); }}
        .otp-code {{ background: #f3f4f6; color: #111827; font-size: 28px; font-weight: 800; letter-spacing: 4px; padding: 15px 25px; border-radius: 8px; border: 2px dashed #d1d5db; display: inline-block; direction: ltr; }}
        
        .footer {{ padding: 20px; background: #f9fafb; text-align: center; color: #9ca3af; font-size: 14px; border-top: 1px solid #f3f4f6; }}
        b {{ color: #6366f1; font-weight: 700; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Musahm Vault</h1>
        </div>
        <div class='content'>
            
            <!-- English Section -->
            <div class='section-en'>
                <h2>{titleEn}</h2>
                <p>{messageEn}</p>
                {actionHtmlEn}
            </div>

            <!-- Divider -->
            <div class='divider'></div>

            <!-- Arabic Section -->
            <div class='section-ar'>
                <h2>{titleAr}</h2>
                <p>{messageAr}</p>
                {actionHtmlAr}
            </div>

        </div>
        <div class='footer'>
            <p>&copy; {DateTime.Now.Year} Musahm. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
    }
}
