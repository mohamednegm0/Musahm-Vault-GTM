using API.Migrations;
using Core.Repository;
using Core.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using Repository.Repositories;
using Service;
using Service.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

#region Configure Cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
    {
        builder.SetIsOriginAllowed(_ => true)
               .AllowAnyMethod()
               .AllowAnyHeader()
               .WithExposedHeaders("Content-Disposition")
               .AllowCredentials();
    });
});
#endregion
// ================= Mongo =================
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton<IMongoDatabase>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    var client = new MongoClient(settings.ConnectionString);
    return client.GetDatabase(settings.DatabaseName);
});

builder.Services.AddHttpContextAccessor();
// ================= DI =================
builder.Services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<ISearchService, SearchService>();
builder.Services.AddScoped<RestSharp.RestClient>();
builder.Services.AddScoped<IGRCService, GRCService>();
builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<IAgentActionLogService, AgentActionLogService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IDocumentAclService, DocumentAclService>();
builder.Services.AddScoped<IDocumentExtractionService, DocumentExtractionService>();
builder.Services.AddScoped<IDocumentVersionService, DocumentVersionService>();
builder.Services.AddScoped<IInvitationService, InvitationService>();
builder.Services.AddScoped<IObligationService, ObligationService>();
builder.Services.AddScoped<ITaskEntityService, TaskEntityService>();
builder.Services.AddScoped<IWorkflowService, WorkflowService>();
builder.Services.AddScoped<IWorkflowAssignmentService, WorkflowAssignmentService>();
builder.Services.AddScoped<IWorkflowInstanceService, WorkflowInstanceService>();
builder.Services.AddScoped<IWorkspaceMemberService, WorkspaceMemberService>();
builder.Services.AddScoped<IWorkspaceService, WorkspaceService>();
builder.Services.AddScoped<IRecycleBinService, Service.Services.RecycleBinService>();
builder.Services.AddScoped<ICompanyMapService, CompanyMapService>();
builder.Services.AddScoped<IUserMapService, UserMapService>();
builder.Services.AddScoped<IIntegrationService, IntegrationService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEmailService, Service.Services.EmailService>();
builder.Services.AddSingleton<IJsonLocalizationService, Service.Localization.JsonLocalizationService>();

// ================= Permission System Services =================
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();

// ================= Helpers =================
builder.Services.AddScoped<Service.Helpers.GrcServiceHelper>();
builder.Services.AddScoped<MongoSchemaMigrator>();

// ================= Seeders =================
builder.Services.AddScoped<Service.Seeders.MainSeeder>();
builder.Services.AddScoped<Service.Seeders.PermissionSeeder>();
builder.Services.AddScoped<Service.Seeders.RoleSeeder>();
builder.Services.AddScoped<Service.Seeders.RolePermissionSeeder>();
builder.Services.AddScoped<Service.Seeders.DocumentTypeSeeder>();
builder.Services.AddScoped<Service.Seeders.TriggerSeeder>();
builder.Services.AddScoped<Service.Seeders.ActionSeeder>();
builder.Services.AddScoped<Service.Seeders.EventSeeder>();

// ================= JWT =================
var tokenSecretKey = builder.Configuration["TokenSecretKey"]
    ?? throw new Exception("TokenSecretKey is missing");

var key = Encoding.UTF8.GetBytes("401b09eab3c013d4ca54922bb802bec8fd5318192b0aAMK167d8b3727429090fb337591abd3e44453b954555b7a0812e1081c39b740293f765eae731f5a65ed1" + tokenSecretKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// ================= Authorization =================
builder.Services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, API.Authorization.PermissionAuthorizationHandler>();

builder.Services.AddAuthorization(options =>
{
    // Helper method to add policy
    void AddPermissionPolicy(string permission) => 
        options.AddPolicy(permission, policy => policy.Requirements.Add(new API.Authorization.PermissionRequirement(permission)));
    
    // Documents Module
    AddPermissionPolicy(Core.Constants.ConstPermissions.Documents.View);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Documents.Create);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Documents.Edit);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Documents.Delete);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Documents.Download);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Documents.Share);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Documents.CheckInOut);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Documents.Restore);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Documents.Move);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Documents.Rename);
    
    // Workspaces Module
    AddPermissionPolicy(Core.Constants.ConstPermissions.Workspaces.View);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Workspaces.Create);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Workspaces.Edit);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Workspaces.Delete);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Workspaces.Export);
    
    // WorkspaceMembers Module
    AddPermissionPolicy(Core.Constants.ConstPermissions.WorkspaceMembers.View);
    AddPermissionPolicy(Core.Constants.ConstPermissions.WorkspaceMembers.Add);
    AddPermissionPolicy(Core.Constants.ConstPermissions.WorkspaceMembers.Remove);
    AddPermissionPolicy(Core.Constants.ConstPermissions.WorkspaceMembers.ManagePermissions);
    
    // Comments Module
    AddPermissionPolicy(Core.Constants.ConstPermissions.Comments.View);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Comments.Create);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Comments.Edit);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Comments.Delete);
    
    // Tasks Module
    AddPermissionPolicy(Core.Constants.ConstPermissions.Tasks.View);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Tasks.Create);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Tasks.Edit);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Tasks.Delete);
    
    // Workflows Module
    AddPermissionPolicy(Core.Constants.ConstPermissions.Workflows.View);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Workflows.Create);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Workflows.Edit);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Workflows.Delete);
    
    // Activities Module
    AddPermissionPolicy(Core.Constants.ConstPermissions.Activities.View);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Activities.Create);
    AddPermissionPolicy(Core.Constants.ConstPermissions.Activities.Delete);
    
    // AuditLogs Module
    AddPermissionPolicy(Core.Constants.ConstPermissions.AuditLogs.View);
    AddPermissionPolicy(Core.Constants.ConstPermissions.AuditLogs.Export);
});

// ================= Controllers =================
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressModelStateInvalidFilter = true;
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Encoder = System.Text.Encodings.Web.JavaScriptEncoder.Create(System.Text.Unicode.UnicodeRanges.All);
    });

// ================= Swagger + JWT =================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Vault API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ================= Pipeline =================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Vault API v1");
    });
}

// app.UseHttpsRedirection();
app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

#region MongoDB Schema Update
using (var scope = app.Services.CreateScope())
{
    var migrator = scope.ServiceProvider.GetRequiredService<MongoSchemaMigrator>();
    await migrator.ApplyMigrationsAsync();
}
#endregion

#region Seeding
using (var scope = app.Services.CreateScope())
{
    try
    {
        var mainSeeder = scope.ServiceProvider.GetRequiredService<Service.Seeders.MainSeeder>();
        await mainSeeder.SeedAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Seeding failed: {ex.Message}");
    }
    
    // Drop restrictive index on invitations if it exists
    var database = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
    
    // // Clean up unused collections
    // try
    // {
    //     await database.DropCollectionAsync("workflow_action_definitions");
    //     await database.DropCollectionAsync("WorkflowActionDefinitions");
    //     await database.DropCollectionAsync("users");
    //     Console.WriteLine("Dropped unused collections: workflow_action_definitions, users");
    // }
    // catch (Exception ex)
    // {
    //     Console.WriteLine($"Cleanup warning: {ex.Message}");
    // }

    var invitationsCollection = database.GetCollection<MongoDB.Bson.BsonDocument>("invitations");
    try
    {
        using (var cursor = await invitationsCollection.Indexes.ListAsync())
        {
            var indexes = await cursor.ToListAsync();
            Console.WriteLine("Debug: Existing indexes on 'invitations':");
            foreach(var idx in indexes) 
            {
                Console.WriteLine($" - {idx["name"]}");
            }

            var indexName = "workspace_id_1_email_1";
            var existingIndex = indexes.FirstOrDefault(i => i["name"] == indexName);
            if (existingIndex != null)
            {
                 await invitationsCollection.Indexes.DropOneAsync(indexName);
                 Console.WriteLine($"Successfully dropped index '{indexName}' from 'invitations'");
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine("Index check info: " + ex.Message);
    }
}
#endregion

app.Run();
