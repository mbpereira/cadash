const analytics = require('../services/processors/analytics')
const { createApiRoute } = require('../utils/app')

module.exports = {
  mapRoutes: server => {
    console.log('Mapped analytics')
    // server.get(createApiRoute('analytics'), async (req, res, next) => {
    //   try {
    //     const refresh = req.query.refresh
    //     const data = await analytics.analyzeAllDisponibleYears(refresh)
    //     res.status(200).send(data)
    //   } catch (e) {
    //     next(e)
    //   }
    // })
    server.get(createApiRoute('analytics/:year'), async (req, res, next) => {
      try {
        const refresh = req.query.refresh === 'true'
        const data = await analytics.analyze(req.params.year, refresh)
        res.status(200).send(data)
      } catch (e) {
        next(e)
      }
    })
  }
}