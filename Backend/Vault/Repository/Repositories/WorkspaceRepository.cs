using Core.Entities;
using MongoDB.Driver;

namespace Repository.Repositories;

public class WorkspaceRepository : BaseRepository<Workspace>
{
    public WorkspaceRepository(IMongoDatabase database) : base(database)
    {
    }
}
