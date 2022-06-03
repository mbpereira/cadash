const Memcached = require('memcached');

const cache = new Memcached(process.env.MEMCACHED_SERVER)

module.exports = {
  get: key => new Promise((res, rej) => {
    cache.get(key, (err, data) => {
      if (err) return rej(err)
      res(data)
    })
  }),
  set: (key, value, expiresIn = 3600) => new Promise((res, ret) => {
    cache.set(key, value, expiresIn, err => {
      if (err) return rej(err)
      res()
    })
  })
}