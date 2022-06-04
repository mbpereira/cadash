const { getMemcached } = require('../factories/memcached')

const oneDay = 3600 * 24
const cacheService = (memcache) => ({
  get: key => new Promise((res, rej) => {
    memcache.get(key, (err, data) => {
      if (err) return rej(err)
      res(data)
    })
  }),
  set: (key, value, expiresIn = oneDay) => new Promise((res, rej) => {
    memcache.set(key, value, expiresIn, err => {
      if (err) return rej(err)
      res()
    })
  })
})

module.exports = {
  createCacheService: (memcache = getMemcached()) => cacheService(memcache)
}