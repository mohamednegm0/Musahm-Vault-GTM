# Start Dev Servers — Musahm Vault

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/) with npm
- MongoDB instance (configured in `Backend/Vault/API/appsettings.json`)

---

## Backend (.NET API)

```bash
cd Backend/Vault
dotnet run --project API
```

- **URL:** `http://localhost:5042`
- **Swagger UI:** `http://localhost:5042/swagger`
- **Launch profile:** Uses the `http` profile from `API/Properties/launchSettings.json`

### HTTPS (optional)

```bash
dotnet run --project API --launch-profile https
```

- **URL:** `https://localhost:7150`

---

## Frontend (React + Vite)

```bash
cd Frontend
npm install          # first time only
npm run dev:web
```

- **URL:** `http://localhost:5173` (Vite default)

### Pointing to Local Backend

By default, the frontend connects to the remote API (`https://api-s2.vault.musahm.com`).
To use your local backend, edit `Frontend/apps/web/.env.development`:

```env
VITE_API_URL=http://localhost:5042
```

---

## Running Both Together

Open two terminals:

**Terminal 1 — Backend:**

```bash
cd Backend/Vault
dotnet run --project API
```

**Terminal 2 — Frontend:**

```bash
cd Frontend
npm run dev:web
```

---

## Other Useful Commands

| Command              | Location             | Purpose                            |
| -------------------- | -------------------- | ---------------------------------- |
| `dotnet build`       | `Backend/Vault/`     | Build backend without running      |
| `npm run build`      | `Frontend/`          | Production build (all workspaces)  |
| `npm run type-check` | `Frontend/`          | TypeScript type checking           |
| `npm run preview`    | `Frontend/apps/web/` | Preview production build locally   |
| `npm run dev:mobile` | `Frontend/`          | Start mobile app dev server (Expo) |
