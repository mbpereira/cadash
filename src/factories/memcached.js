const Memcached = require('memcached');

const getMemcached = () => new Memcached(process.env.MEMCACHED_SERVER)

module.exports = {
  getMemcached
}
