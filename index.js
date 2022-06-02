require('dotenv/config')

const bootstrap = require('./bootstrap')
const server = require('./src/server')

bootstrap()
  .then(server.run)