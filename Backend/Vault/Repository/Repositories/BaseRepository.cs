using Core.Interfaces;
using Core.Repository;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using System;
using System.Linq.Expressions;

namespace Repository.Repositories
{
    public class BaseRepository<T> : IBaseRepository<T> where T : class, IEntity
    {
        protected readonly IMongoCollection<T> _collection;

        public BaseRepository(IMongoDatabase database, string? collectionName = null)
        {
            if (string.IsNullOrEmpty(collectionName))
            {
                collectionName = typeof(T).Name.ToLower() + "s";
            }
            _collection = database.GetCollection<T>(collectionName);
        }

        #region Get
        public async Task<T> GetByIdAsync(string id)
        {
            var filter = Builders<T>.Filter.Eq(doc => doc.Id, id);
            return await _collection.Find(filter).SingleOrDefaultAsync();
        }

        public T GetById(string id)
        {
            var filter = Builders<T>.Filter.Eq(doc => doc.Id, id);
            return _collection.Find(filter).SingleOrDefault();
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _collection.Find(_ => true).ToListAsync();
        }

        public IEnumerable<T> GetAll()
        {
             return _collection.Find(_ => true).ToList();
        }
        #endregion

        #region Add 
        public async Task<T> AddAsync(T entity)
        {
            await _collection.InsertOneAsync(entity);
            return entity;
        }

        public T Add(T entity)
        {
            _collection.InsertOne(entity);
            return entity;
        }
        #endregion

        #region Update
        public async Task<T> UpdateAsync(string id, T entity)
        {
             await _collection.ReplaceOneAsync(doc => doc.Id == id, entity);
             return entity;
        }
        #endregion

        #region Delete
        public async Task DeleteAsync(string id)
        {
            await _collection.DeleteOneAsync(doc => doc.Id == id);
        }

        public void Delete(string id)
        {
            _collection.DeleteOne(doc => doc.Id == id);
        }
        #endregion

        #region Count
        public long Count()
        {
            return _collection.CountDocuments(_ => true);
        }

        public async Task<long> CountAsync()
        {
            return await _collection.CountDocumentsAsync(_ => true);
        }

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _collection.Find(predicate).ToListAsync();
        }
        #endregion
    }
}