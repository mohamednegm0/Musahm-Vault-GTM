---
description: Conduct a code review and ensure clean architecture rules
---
When reviewing or refactoring code in Musahm-Vault, adhere strictly to these guidelines:

## .NET Backend (C# & MongoDB)
1. **SOLID Principles:** Ensure code is loosely coupled and highly cohesive.
2. **Thin Controllers:** Controllers should only handle HTTP routing and parameter binding. All business logic must reside in the Services.
3. **Async Everywhere:** Ensure `async`/`await` is used properly through the entire stack, especially for MongoDB operations (e.g., `ToListAsync()`, `InsertOneAsync()`).
4. **No DB logic in Services:** Services should not use `MongoClient` directly; they should rely on Repositories.

## React Frontend (TypeScript)
1. **Strict Typing:** Avoid using `any`. Ensure all states and API responses are typed properly.
2. **Pure Components:** Keep UI rendering pure. Move side effects to `useEffect` or custom hooks.
3. **Avoid Prop Drilling:** If props are passed down more than 2 levels, consider using React Context or a state manager.
