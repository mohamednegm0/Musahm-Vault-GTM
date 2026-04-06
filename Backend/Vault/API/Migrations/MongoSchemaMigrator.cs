using MongoDB.Driver;
using MongoDB.Bson;

namespace API.Migrations;

public class MongoSchemaMigrator
{
    private readonly IMongoDatabase _database;

    public MongoSchemaMigrator(IMongoDatabase database)
    {
        _database = database;
    }

    public async Task ApplyMigrationsAsync()
    {
        await ApplyDocumentVersionSchemaAsync();
        await ApplyWorkflowSchemaAsync();
        await ApplyUserMapsFieldRenameAsync();
        await ConvertObjectIdsToStringsInAuditLogsAsync();
        await RemoveRestrictiveSchemasAsync();
        // Add other entity schemas here as needed
    }

    private async Task ApplyDocumentVersionSchemaAsync()
    {
        var validator = new BsonDocument
        {
            { "$jsonSchema", new BsonDocument
                {
                    { "bsonType", "object" },
                    { "required", new BsonArray { "tenant_id", "document_id", "version", "file_id", "created_by", "created_at" } },
                    { "properties", new BsonDocument
                        {
                            { "tenant_id", new BsonDocument { { "bsonType", new BsonArray { "objectId", "string" } } } },
                            { "document_id", new BsonDocument { { "bsonType", new BsonArray { "objectId", "string" } } } },
                            { "version", new BsonDocument { { "bsonType", "int" } } },
                            { "file_id", new BsonDocument { { "bsonType", new BsonArray { "objectId", "string" } } } },
                            { "file_name", new BsonDocument { { "bsonType", "string" } } },
                            { "file_size", new BsonDocument { { "bsonType", "long" } } },
                            { "content_type", new BsonDocument { { "bsonType", "string" } } },
                            { "created_by", new BsonDocument { { "bsonType", new BsonArray { "objectId", "string" } } } },
                            { "created_at", new BsonDocument { { "bsonType", "date" } } },
                            { "legal_hold", new BsonDocument { { "bsonType", "bool" } } }
                        }
                    }
                }
            }
        };

        await ApplyValidatorAsync("document_versions", validator);
    }

    private async Task ApplyWorkflowSchemaAsync()
    {
        var validator = new BsonDocument
        {
            { "$jsonSchema", new BsonDocument
                {
                    { "bsonType", "object" },
                    { "required", new BsonArray { "name", "created_at", "is_active" } },
                    { "properties", new BsonDocument
                        {
                             { "tenant_id", new BsonDocument { { "bsonType", new BsonArray { "objectId", "string", "null" } } } },
                             { "workspace_id", new BsonDocument { { "bsonType", new BsonArray { "objectId", "string", "null" } } } },
                             { "name", new BsonDocument { { "bsonType", "string" } } },
                             { "description", new BsonDocument { { "bsonType", new BsonArray { "string", "null" } } } },
                             { "is_active", new BsonDocument { { "bsonType", "bool" } } },
                             { "min_confidence_score", new BsonDocument { { "bsonType", "double" } } },
                             { "created_by", new BsonDocument { { "bsonType", new BsonArray { "objectId", "string", "null" } } } },
                             { "created_at", new BsonDocument { { "bsonType", "date" } } },
                             { "steps", new BsonDocument { { "bsonType", "array" } } },
                             { "triggers", new BsonDocument { { "bsonType", "array" } } }
                        }
                    }
                }
            }
        };

        await ApplyValidatorAsync("workflows", validator);
    }

    private async Task ApplyValidatorAsync(string collectionName, BsonDocument validator)
    {
        var collections = await _database.ListCollectionNames().ToListAsync();
        if (!collections.Contains(collectionName))
        {
            await _database.CreateCollectionAsync(collectionName);
        }

        var options = new BsonDocument { { "collMod", collectionName }, { "validator", validator } };
        try
        {
            await _database.RunCommandAsync<BsonDocument>(options);
            Console.WriteLine($"Successfully updated validator for {collectionName}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating validator for {collectionName}: " + ex.Message);
        }
    }

    private async Task ApplyUserMapsFieldRenameAsync()
    {
        var collection = _database.GetCollection<BsonDocument>("user_maps");
        
        // Check if old fields exist before renaming to avoid errors or redundant ops (though mongo handles it gracefully usually)
        // We just run updateMany with $rename.
        
        var update = Builders<BsonDocument>.Update
            .Rename("name_ar", "grc_name_ar")
            .Rename("name_en", "grc_name_en");

        try
        {
            await collection.UpdateManyAsync(new BsonDocument(), update);
            Console.WriteLine("Successfully renamed user_maps fields.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error renaming user_maps fields: {ex.Message}");
        }
    }
    private async Task ConvertObjectIdsToStringsInAuditLogsAsync()
    {
        var collection = _database.GetCollection<BsonDocument>("audit_logs");
        var filter = new BsonDocument();
        var logs = await collection.Find(filter).ToListAsync();
        foreach (var log in logs)
        {
            try
            {
                bool modified = false;
                if (log.TryGetValue("tenant_id", out var tenantId) && tenantId.IsObjectId)
                {
                    log["tenant_id"] = tenantId.AsObjectId.ToString();
                    modified = true;
                }
                if (log.TryGetValue("actor_user_id", out var actorId) && actorId.IsObjectId)
                {
                    log["actor_user_id"] = actorId.AsObjectId.ToString();
                    modified = true;
                }
                if (log.TryGetValue("entity_id", out var entityId) && entityId.IsObjectId)
                {
                    log["entity_id"] = entityId.AsObjectId.ToString();
                    modified = true;
                }
                
                if (modified)
                {
                    await collection.ReplaceOneAsync(
                        Builders<BsonDocument>.Filter.Eq("_id", log["_id"]),
                        log
                    );
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error migrating document in audit_logs. Id: {log["_id"]}, Msg: {ex.Message}");
            }
        }
        Console.WriteLine("Finished converting ObjectIds to strings in audit_logs.");
    }

    private async Task RemoveRestrictiveSchemasAsync()
    {
        var collectionsToRelax = new[] { "audit_logs", "invitations" };
        foreach (var coll in collectionsToRelax)
        {
            var options = new BsonDocument
            {
                { "collMod", coll },
                { "validator", new BsonDocument("$jsonSchema", new BsonDocument("bsonType", "object")) },
                { "validationLevel", "off" },
                { "validationAction", "warn" }
            };

            try
            {
                await _database.RunCommandAsync<BsonDocument>(options);
                Console.WriteLine($"Relaxed schema validation for {coll}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Skipping schema relaxation for {coll}: {ex.Message}");
            }
        }
    }
}
