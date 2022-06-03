const { createReadStream } = require('fs')
const { join } = require('path')
const extract = require('unzipper/lib/extract')

const insightsPath = join('.', 'insights')

module.exports = () => new Promise((res, rej) => {
  console.log('Extraindo arquivos de dados. Por favor, aguarde!')
  const originalFilesPath = join(insightsPath, 'original')
  createReadStream(join(originalFilesPath, 'original.zip'))
    .pipe(extract({ path: originalFilesPath }))
    .on('close', res)
    .on('error', rej)
})