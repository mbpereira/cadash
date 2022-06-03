const analytics = require('../services/processors/analytics')
const { createApiRoute } = require('../utils/app')

module.exports = {
  mapRoutes: server => {
    console.log('Mapped analytics')
    server.get(createApiRoute('analytics'), async (req, res, next) => {
      try {
        const data = await analytics.analyzeAllDisponibleYears()
        res.status(200).send(data)
      } catch (e) {
        next(e)
      }
    })
    server.get(createApiRoute('analytics/:year'), async (req, res, next) => {
      try {
        const data = await analytics.analyze(req.params.year)
        res.status(200).send(data)
      } catch (e) {
        next(e)
      }
    })
  }
}