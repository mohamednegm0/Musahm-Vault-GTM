---
description: Create a new .NET Web API endpoint with MongoDB
---
Follow these steps to create a new API endpoint in the Musahm-Vault Backend:

1. **Create the Model/Entity:**
   Create the MongoDB entity class in the respective domain folder. Ensure it inherits from standard BaseEntity if applicable and uses `[BsonId]` for the Id.
2. **Create the DTOs:**
   Create Request and Response DTOs to avoid exposing the domain model directly. Use Data Annotations for validation.
3. **Update or Create the Repository:**
   Add MongoDB data access logic (e.g., using `IMongoCollection<T>`) to the Repository interface and implementation. Ensure all DB calls are asynchronous (`async`/`await`).
4. **Update or Create the Service:**
   Implement business logic in the Service layer, injecting the Repository. Keep the logic modular and testable.
5. **Create the Controller:**
   Add a new endpoint in `c:\Source\Musahm-Vault\Backend\Vault\API\Controllers`. Ensure proper routing, `[Authorize]` attributes if necessary, and use standard HTTP verbs (GET, POST, PUT, DELETE). Inject the Service, **never** the Repository directly.
6. **Register Dependencies:**
   If a new Service or Repository was created, ensure it is registered in the DI container (usually in `Program.cs` or an Extension method).
