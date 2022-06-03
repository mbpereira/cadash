const analytics = require('./src/services/processors/analytics');
const { createFileReader } = require('./src/services/readers/file');
const { join } = require('path')

analytics.analyzeAllDisponibleYears()
  .then(analised => console.log(analised[0].mostUsedDatabasesByCountries))
  .catch(err => console.log('erro', err))
