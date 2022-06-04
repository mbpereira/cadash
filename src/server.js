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
  { directory: join(__dirname, '..', 'public', 'assets'), publicUrl: '/assets' },
  { directory: join(__dirname, '..', 'node_modules', 'chart.js', 'dist'), publicUrl: '/chartjs' },
  { directory: join(__dirname, '..', 'node_modules', 'bootstrap', 'dist'), publicUrl: '/bootstrap' },
  { directory: join(__dirname, '..', 'node_modules', 'axios', 'dist'), publicUrl: '/axios' }
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
    .forEach(({ directory, publicUrl }) => {
      console.log('Mapping ', directory)
      server.use(publicUrl, express.static(directory))
    })

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