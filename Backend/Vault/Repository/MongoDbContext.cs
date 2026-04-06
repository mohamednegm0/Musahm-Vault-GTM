namespace Repository;

using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Core.Settings;

public class MongoDbContext
{
    public IMongoDatabase Database { get; }

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        Database = client.GetDatabase(settings.Value.DatabaseName);
    }

    public IMongoCollection<T> GetCollection<T>(string name)
    {
        return Database.GetCollection<T>(name);
    }
}
