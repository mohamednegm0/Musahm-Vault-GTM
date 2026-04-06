using System.Text.Json;
using Core.Interfaces.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace Service.Localization;

public class JsonLocalizationService : IJsonLocalizationService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IHostEnvironment _env;
    private Dictionary<string, Dictionary<string, string>> _resources;

    public JsonLocalizationService(IHttpContextAccessor httpContextAccessor, IHostEnvironment env)
    {
        _httpContextAccessor = httpContextAccessor;
        _env = env;
        _resources = new Dictionary<string, Dictionary<string, string>>(StringComparer.OrdinalIgnoreCase);
        LoadResources();
    }

    private void LoadResources()
    {
        var basePath = Path.Combine(_env.ContentRootPath, "Resources", "Localization");
        if (!Directory.Exists(basePath)) return;

        var files = Directory.GetFiles(basePath, "*.json");
        foreach (var file in files)
        {
            // File name without extension: "messages.ar" or "messages.en"
            // Split by '.' → last segment is the culture code: "ar" or "en"
            var fileName = Path.GetFileNameWithoutExtension(file);
            var parts = fileName.Split('.');
            var culture = parts.Last(); // "ar" or "en"

            // Only process files with valid 2-letter or 5-letter culture codes
            if (culture.Length != 2 && culture.Length != 5) continue;

            try
            {
                var content = File.ReadAllText(file);
                var dict = JsonSerializer.Deserialize<Dictionary<string, string>>(content);
                if (dict != null)
                {
                    if (!_resources.ContainsKey(culture))
                    {
                        _resources[culture] = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                    }

                    foreach (var kvp in dict)
                    {
                        _resources[culture][kvp.Key] = kvp.Value;
                    }
                }
            }
            catch
            {
                // Skip unreadable or malformed files
            }
        }
    }

    public string Get(string key)
    {
        var culture = GetCurrentCulture();
        if (_resources.ContainsKey(culture) && _resources[culture].TryGetValue(key, out var value))
        {
            return value;
        }

        // Fallback to English if not found
        if (culture != "en" && _resources.ContainsKey("en") && _resources["en"].TryGetValue(key, out var enValue))
        {
            return enValue;
        }

        return key; // Return key if translation missing
    }

    public string Get(string key, params object[] args)
    {
        var value = Get(key);
        try
        {
            return string.Format(value, args);
        }
        catch
        {
            return value;
        }
    }

    private string GetCurrentCulture()
    {
        var context = _httpContextAccessor.HttpContext;
        if (context == null) return "ar";

        // 1. Check custom 'lang' header (highest priority - sent by frontend explicitly)
        var langHeader = context.Request.Headers["lang"].ToString();
        if (!string.IsNullOrWhiteSpace(langHeader))
        {
            if (langHeader.StartsWith("ar", StringComparison.OrdinalIgnoreCase)) return "ar";
            if (langHeader.StartsWith("en", StringComparison.OrdinalIgnoreCase)) return "en";
        }

        // 2. Check standard Accept-Language header
        var headers = context.Request.GetTypedHeaders();
        var acceptLanguage = headers.AcceptLanguage;

        if (acceptLanguage != null && acceptLanguage.Count > 0)
        {
            var lang = acceptLanguage
                .OrderByDescending(x => x.Quality ?? 1)
                .First().Value.ToString();

            if (lang.StartsWith("ar", StringComparison.OrdinalIgnoreCase)) return "ar";
            if (lang.StartsWith("en", StringComparison.OrdinalIgnoreCase)) return "en";
        }

        // 3. Check query string ?lang=ar
        if (context.Request.Query.ContainsKey("lang"))
        {
            var queryLang = context.Request.Query["lang"].ToString();
            if (queryLang.StartsWith("ar", StringComparison.OrdinalIgnoreCase)) return "ar";
            if (queryLang.StartsWith("en", StringComparison.OrdinalIgnoreCase)) return "en";
        }

        // Default: Arabic (system default)
        return "ar";
    }
}
