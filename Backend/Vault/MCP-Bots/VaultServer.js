require('dotenv').config();
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { MongoClient, ObjectId } = require("mongodb");

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "MusahmVault";

let client, db;
async function connectToDb() {
  if (!client) { client = new MongoClient(MONGO_URL); await client.connect(); db = client.db(DB_NAME); }
  return db;
}

const server = new Server({ name: "musahm-vault-server", version: "2.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ── Documents ──────────────────────────────────────────────────────────
    { name: "list_documents", description: "List documents with optional filters (workspace_id, status, limit)", inputSchema: { type: "object", properties: { workspace_id: { type: "string" }, status: { type: "string", description: "Draft | InReview | Approved | Signed | Pending | Rejected" }, limit: { type: "number", default: 10 } } } },
    { name: "get_document_details", description: "Get full details of a document by ID", inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } },
    { name: "list_document_versions", description: "List all versions of a document", inputSchema: { type: "object", properties: { document_id: { type: "string" } }, required: ["document_id"] } },
    { name: "list_document_extractions", description: "List AI extraction results for documents", inputSchema: { type: "object", properties: { document_id: { type: "string" }, limit: { type: "number", default: 10 } } } },
    { name: "list_document_types", description: "List all configured document types", inputSchema: { type: "object", properties: {} } },

    // ── Workspaces ─────────────────────────────────────────────────────────
    { name: "list_workspaces", description: "List all workspaces", inputSchema: { type: "object", properties: { limit: { type: "number", default: 20 } } } },
    { name: "list_workspace_members", description: "List members of a specific workspace", inputSchema: { type: "object", properties: { workspace_id: { type: "string" } }, required: ["workspace_id"] } },

    // ── Workflows ──────────────────────────────────────────────────────────
    { name: "list_workflows", description: "List defined workflows (filter by is_active)", inputSchema: { type: "object", properties: { is_active: { type: "boolean" } } } },
    { name: "list_workflow_instances", description: "List workflow instances (filter by status or workflow_id)", inputSchema: { type: "object", properties: { status: { type: "string", description: "Running | Completed | Failed | Paused | Terminated" }, workflow_id: { type: "string" }, limit: { type: "number", default: 10 } } } },
    { name: "list_workflow_assignments", description: "List workflow assignments (which workflows apply to which docs/workspaces)", inputSchema: { type: "object", properties: { workflow_id: { type: "string" }, limit: { type: "number", default: 10 } } } },
    { name: "list_workflow_events", description: "List all workflow events log", inputSchema: { type: "object", properties: { instance_id: { type: "string" }, limit: { type: "number", default: 20 } } } },

    // ── Tasks ──────────────────────────────────────────────────────────────
    { name: "list_tasks", description: "List tasks (filter by status or assigned_to user)", inputSchema: { type: "object", properties: { status: { type: "string", description: "Pending | Completed | Rejected" }, assigned_to: { type: "string" }, limit: { type: "number", default: 20 } } } },

    // ── Users & Roles ──────────────────────────────────────────────────────
    { name: "list_roles", description: "List all roles defined in the system", inputSchema: { type: "object", properties: {} } },
    { name: "list_user_roles", description: "List role assignments for users", inputSchema: { type: "object", properties: { user_id: { type: "string" } } } },
    { name: "list_permissions", description: "List all permissions in the system", inputSchema: { type: "object", properties: {} } },
    { name: "list_role_permissions", description: "List permissions assigned to roles", inputSchema: { type: "object", properties: { role_id: { type: "string" } } } },
    { name: "list_document_acl", description: "List document access control list (who has access to which document)", inputSchema: { type: "object", properties: { document_id: { type: "string" }, user_id: { type: "string" } } } },

    // ── Invitations ────────────────────────────────────────────────────────
    { name: "list_invitations", description: "List sent invitations (filter by status)", inputSchema: { type: "object", properties: { status: { type: "string" }, workspace_id: { type: "string" }, limit: { type: "number", default: 10 } } } },

    // ── Obligations ────────────────────────────────────────────────────────
    { name: "list_obligations", description: "List document obligations and deadlines", inputSchema: { type: "object", properties: { status: { type: "string" }, limit: { type: "number", default: 10 } } } },

    // ── Activities & Audit ─────────────────────────────────────────────────
    { name: "list_activities", description: "List system activity events (most recent first)", inputSchema: { type: "object", properties: { limit: { type: "number", default: 20 } } } },
    { name: "list_audit_logs", description: "List security audit logs (filter by action)", inputSchema: { type: "object", properties: { action: { type: "string" }, user_id: { type: "string" }, limit: { type: "number", default: 20 } } } },
    { name: "list_agent_action_logs", description: "List AI agent action logs", inputSchema: { type: "object", properties: { status: { type: "string", description: "Pending | Draft | Completed" }, limit: { type: "number", default: 10 } } } },

    // ── Triggers ───────────────────────────────────────────────────────────
    { name: "list_triggers", description: "List workflow triggers configured in the system", inputSchema: { type: "object", properties: {} } },
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const database = await connectToDb();
  const { name, arguments: args } = request.params;

  const respond = (data) => ({ content: [{ type: "text", text: JSON.stringify(data, null, 2) }] });
  const err = (msg) => ({ content: [{ type: "text", text: `Error: ${msg}` }], isError: true });

  try {
    switch (name) {

      // ── Documents ──────────────────────────────────────────────────────
      case "list_documents": {
        const q = {};
        if (args.workspace_id) q.workspace_id = new ObjectId(args.workspace_id);
        if (args.status) q.status = args.status;
        return respond(await database.collection("documents").find(q).limit(args.limit || 10).toArray());
      }
      case "get_document_details": {
        const doc = await database.collection("documents").findOne({ _id: new ObjectId(args.id) });
        return respond(doc || "Document not found");
      }
      case "list_document_versions": {
        return respond(await database.collection("document_versions").find({ document_id: args.document_id }).toArray());
      }
      case "list_document_extractions": {
        const q = {};
        if (args.document_id) q.document_id = args.document_id;
        return respond(await database.collection("document_extractions").find(q).limit(args.limit || 10).toArray());
      }
      case "list_document_types": {
        return respond(await database.collection("document_types").find({}).toArray());
      }

      // ── Workspaces ─────────────────────────────────────────────────────
      case "list_workspaces": {
        return respond(await database.collection("workspaces").find({}).limit(args.limit || 20).toArray());
      }
      case "list_workspace_members": {
        const q = {};
        if (args.workspace_id) q.workspace_id = args.workspace_id;
        return respond(await database.collection("workspace_members").find(q).toArray());
      }

      // ── Workflows ──────────────────────────────────────────────────────
      case "list_workflows": {
        const q = {};
        if (args.is_active !== undefined) q.is_active = args.is_active;
        return respond(await database.collection("workflows").find(q).toArray());
      }
      case "list_workflow_instances": {
        const q = {};
        if (args.status) q.status = args.status;
        if (args.workflow_id) q.workflow_id = args.workflow_id;
        return respond(await database.collection("workflow_instances").find(q).limit(args.limit || 10).toArray());
      }
      case "list_workflow_assignments": {
        const q = {};
        if (args.workflow_id) q.workflow_id = args.workflow_id;
        return respond(await database.collection("workflow_assignments").find(q).limit(args.limit || 10).toArray());
      }
      case "list_workflow_events": {
        const q = {};
        if (args.instance_id) q.instance_id = args.instance_id;
        return respond(await database.collection("workflow_events").find(q).sort({ created_at: -1 }).limit(args.limit || 20).toArray());
      }

      // ── Tasks ──────────────────────────────────────────────────────────
      case "list_tasks": {
        const q = {};
        if (args.status) q.status = args.status;
        if (args.assigned_to) q.assigned_to = args.assigned_to;
        return respond(await database.collection("tasks").find(q).limit(args.limit || 20).toArray());
      }

      // ── Users & Roles ──────────────────────────────────────────────────
      case "list_roles": {
        return respond(await database.collection("roles").find({}).toArray());
      }
      case "list_user_roles": {
        const q = {};
        if (args.user_id) q.user_id = args.user_id;
        return respond(await database.collection("user_roles").find(q).toArray());
      }
      case "list_permissions": {
        return respond(await database.collection("permissions").find({}).toArray());
      }
      case "list_role_permissions": {
        const q = {};
        if (args.role_id) q.role_id = args.role_id;
        return respond(await database.collection("role_permissions").find(q).toArray());
      }
      case "list_document_acl": {
        const q = {};
        if (args.document_id) q.document_id = args.document_id;
        if (args.user_id) q.user_id = args.user_id;
        return respond(await database.collection("document_acl").find(q).toArray());
      }

      // ── Invitations ────────────────────────────────────────────────────
      case "list_invitations": {
        const q = {};
        if (args.status) q.status = args.status;
        if (args.workspace_id) q.workspace_id = args.workspace_id;
        return respond(await database.collection("invitations").find(q).limit(args.limit || 10).toArray());
      }

      // ── Obligations ────────────────────────────────────────────────────
      case "list_obligations": {
        const q = {};
        if (args.status) q.status = args.status;
        return respond(await database.collection("obligations").find(q).limit(args.limit || 10).toArray());
      }

      // ── Activities & Audit ─────────────────────────────────────────────
      case "list_activities": {
        return respond(await database.collection("activities").find({}).sort({ created_at: -1 }).limit(args.limit || 20).toArray());
      }
      case "list_audit_logs": {
        const q = {};
        if (args.action) q.action = args.action;
        if (args.user_id) q.user_id = args.user_id;
        return respond(await database.collection("audit_logs").find(q).sort({ timestamp: -1 }).limit(args.limit || 20).toArray());
      }
      case "list_agent_action_logs": {
        const q = {};
        if (args.status) q.status = args.status;
        return respond(await database.collection("agent_action_logs").find(q).limit(args.limit || 10).toArray());
      }

      // ── Triggers ───────────────────────────────────────────────────────
      case "list_triggers": {
        return respond(await database.collection("triggers").find({}).toArray());
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return err(error.message);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("✅ Musahm Vault MCP Server v2.0 — Ready (25 tools covering all collections)");
}

main().catch((error) => { console.error("Server error:", error); process.exit(1); });
