using MongoDB.Driver;
using MongoDB.Bson;
using System;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        var client = new MongoClient("mongodb://localhost:27017");
        var database = client.GetDatabase("MusahmVault");
        
        var validator = new BsonDocument
        {
            { "$jsonSchema", new BsonDocument
                {
                    { "bsonType", "object" },
                    { "required", new BsonArray { "tenant_id", "document_id", "version", "file_id", "created_by", "created_at" } },
                    { "properties", new BsonDocument
                        {
                            { "tenant_id", new BsonDocument { { "bsonType", "objectId" } } },
                            { "document_id", new BsonDocument { { "bsonType", "objectId" } } },
                            { "version", new BsonDocument { { "bsonType", "int" } } },
                            { "file_id", new BsonDocument { { "bsonType", "objectId" } } },
                            { "file_name", new BsonDocument { { "bsonType", "string" } } },
                            { "file_size", new BsonDocument { { "bsonType", "long" } } },
                            { "content_type", new BsonDocument { { "bsonType", "string" } } },
                            { "created_by", new BsonDocument { { "bsonType", "objectId" } } },
                            { "created_at", new BsonDocument { { "bsonType", "date" } } }
                        }
                    }
                }
            }
        };

        var options = new BsonDocument { { "collMod", "document_versions" }, { "validator", validator } };
        try {
            await database.RunCommandAsync<BsonDocument>(options);
            Console.WriteLine("Successfully updated validator for document_versions");
        } catch (Exception ex) {
            Console.WriteLine("Error: " + ex.Message);
        }
    }
}
