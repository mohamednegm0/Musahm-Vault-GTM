require('dotenv').config();
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, 'project_memory.json');

// التأكد من وجود ملف الذاكرة أو إنشاؤه
if (!fs.existsSync(MEMORY_FILE)) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify({ rules: [], snippets: [], context: {} }, null, 2));
}

const server = new Server(
  { name: "musahm-memory-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "save_project_rule",
        description: "Save a new coding rule or pattern for Musahm Vault project",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Short title of the rule (e.g. Service Pattern)" },
            content: { type: "string", description: "The full rule or instruction" },
            category: { type: "string", enum: ["backend", "frontend", "general", "naming"] }
          },
          required: ["title", "content"]
        }
      },
      {
        name: "get_project_rules",
        description: "Retrieve all saved project rules and standards",
        inputSchema: { type: "object", properties: { category: { type: "string" } } }
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  let memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));

  switch (name) {
    case "save_project_rule":
      const newRule = { 
        id: Date.now(), 
        title: args.title, 
        content: args.content, 
        category: args.category || 'general' 
      };
      memory.rules.push(newRule);
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
      return { content: [{ type: "text", text: `✅ Rule '${args.title}' has been remembered forever.` }] };

    case "get_project_rules":
      const filtered = args.category 
        ? memory.rules.filter(r => r.category === args.category)
        : memory.rules;
      return { content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }] };

    default:
      throw new Error("Unknown tool");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
