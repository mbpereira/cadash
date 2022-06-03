const { join, basename } = require('path')

const insightsPath = join(basename(process.cwd()), '..', 'insights', 'original')

const csv = filename => join(insightsPath, `${filename}.csv`)

module.exports = {
  createApiRoute: path => `/api/${path}`,
  insightCsv: csv
}