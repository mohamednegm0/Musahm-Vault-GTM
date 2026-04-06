using Core.Interfaces;
using System.Linq.Expressions;
namespace Core.Repository;
public interface IBaseRepository<T> where T : class, IEntity
{    
    Task<T> AddAsync(T entity);
    Task<T> GetByIdAsync(string id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> UpdateAsync(string id, T entity);
    Task DeleteAsync(string id);
    T GetById(string id);
    IEnumerable<T> GetAll();
    T Add(T entity);
    void Delete(string id);
    long Count();
    Task<long> CountAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
}