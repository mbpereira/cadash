const express = require('express')
const server = express()
const { join } = require('path')
const { getAllFileNamesFromDirectory } = require('./utils/fs')

const controllersPath = join(__dirname, 'controllers')
const port = process.env.PORT

const startMiddlewares = []

const endMiddlewares = [
  (req, res, next, err) => {
    res.status(err.statusCode).send(err)
  }
]

const getController = controllerName => require(join(controllersPath, controllerName))

const mapControllers = controllers =>
  controllers
    .forEach(controller => getController(controller).mapRoutes(server))

const mapMiddlewares = middlewares =>
  middlewares
    .forEach(middleware => server.use(middleware))

const run = async () => {
  const controllers = await getAllFileNamesFromDirectory(controllersPath)

  mapMiddlewares(startMiddlewares)
  mapControllers(controllers)
  mapMiddlewares(endMiddlewares)

  server.listen(port, () => console.log(`Running on port ${port}`))
}

module.exports = {
  run
};