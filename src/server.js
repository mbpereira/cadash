const express = require('express')
const server = express()
const { join } = require('path')
const { getAllFileNamesFromDirectory } = require('./utils/fs')

const controllersPath = join(__dirname, 'controllers')
const port = process.env.PORT

const startMiddlewares = []

const endMiddlewares = [
  (err, req, res, next) => {
    res.status(err.status || 500).send(err)
  }
]

const staticPaths = [
  join(__dirname, '..', 'public', 'assets')
]

const getController = controllerName => require(join(controllersPath, controllerName))

const mapControllers = controllers =>
  controllers
    .forEach(controller => getController(controller).mapRoutes(server))

const mapMiddlewares = middlewares =>
  middlewares
    .forEach(middleware => server.use(middleware))

const mapStaticPaths = paths =>
  paths
    .forEach(path => server.use(express.static(path)))

const run = async () => {
  const controllers = await getAllFileNamesFromDirectory(controllersPath)

  mapMiddlewares(startMiddlewares)
  mapStaticPaths(staticPaths)
  mapControllers(controllers)
  mapMiddlewares(endMiddlewares)

  server.listen(port, () => console.log(`Running on port ${port}`))
}

module.exports = {
  run
};