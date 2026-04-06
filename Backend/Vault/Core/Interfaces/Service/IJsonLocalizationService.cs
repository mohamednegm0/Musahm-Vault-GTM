namespace Core.Interfaces.Service;

public interface IJsonLocalizationService
{
    string Get(string key);
    string Get(string key, params object[] args);
}
