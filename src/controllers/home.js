const { join } = require('path')

const indexHtml = join(__dirname, '..', '..', 'public', 'index.html')

module.exports = {
  mapRoutes: server => {
    console.log('Mapped home')
    const renderIndex = async (req, res, next) => res.sendFile(indexHtml)
    const routes = ['', '/', '/home', '/index']
    routes.forEach(route => server.get(route, renderIndex))
  }
}