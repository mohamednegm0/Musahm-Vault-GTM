# Musahm Vault MCP Server 🤖

This server implements the Model Context Protocol (MCP) to allow AI agents (Claude, Cursor, etc.) to interact directly with the Musahm Vault database.

## 🛠 Features
- **Documents**: List and get details of documents.
- **Tasks**: Monitor workflow tasks.
- **Workflows**: View automation workflows.

## 🚀 How to Use

### 1. Claude Desktop
Add the following to your `claude_desktop_config.json` (usually in `%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "musahm-vault": {
      "command": "node",
      "args": ["d:/projects/backend/Musahm-Vault/Backend/Vault/MCP-Bots/VaultServer.js"],
      "env": {
        "MONGO_URL": "mongodb://localhost:27017",
        "DB_NAME": "MusahmVault"
      }
    }
  }
}
```

### 2. Cursor
Go to **Settings > Models > MCP Servers** and add a new server:
- **Name**: Musahm Vault
- **Type**: command
- **Command**: `node d:/projects/backend/Musahm-Vault/Backend/Vault/MCP-Bots/VaultServer.js`

### 3. Desktop Inspector (Testing)
Run this command to test the tools in a web interface:
```bash
npx @modelcontextprotocol/inspector node d:/projects/backend/Musahm-Vault/Backend/Vault/MCP-Bots/VaultServer.js
```

## 📂 Structure
- `VaultServer.js`: The main MCP server logic.
- `.env`: Configuration for MongoDB.
- `package.json`: Dependencies.
