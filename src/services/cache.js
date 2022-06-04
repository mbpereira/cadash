const Memcached = require('memcached');

const cache = new Memcached(process.env.MEMCACHED_SERVER)

const oneDay = 3600 * 24
module.exports = {
  get: key => new Promise((res, rej) => {
    cache.get(key, (err, data) => {
      if (err) return rej(err)
      res(data)
    })
  }),
  set: (key, value, expiresIn = oneDay) => new Promise((res, rej) => {
    cache.set(key, value, expiresIn, err => {
      if (err) return rej(err)
      res()
    })
  })
}