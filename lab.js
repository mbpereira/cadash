const analytics = require('./src/services/processors/analytics');

analytics.analyze('2021')
  .then(analised => console.log(analised))
  .catch(err => console.log('erro', err))
