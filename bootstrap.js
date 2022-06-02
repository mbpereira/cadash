const { createReadStream } = require('fs')
const { join } = require('path')
const extract = require('unzipper/lib/extract')
const { createFileProcessor } = require('./src/services/processors/file')

const insightsPath = join('.', 'insights')

const csv = filename => ({
  input: join(insightsPath, 'original', `${filename}.csv`),
  output: join(insightsPath, `${filename}.csv`),
  filename: `${filename}.csv`
})

const bootstrap = () => Promise.all([csv('2021'), csv('2020'), csv('2019'), csv('2018')]
  .map(({ input, output }) => new Promise((res, rej) => {
    createFileProcessor({ input })
      .transform(line => {
        processedLine = line + '\n'
        const matches = processedLine.match(/"(.*?)"/ig)
        if (Array.isArray(matches))
          matches.forEach(m => processedLine = processedLine.replace(m, m.replace(/,/ig, ' -')))
        return processedLine
      })
      .process()
      .writeTo({ output })
      .onFinish(async data => {
        const { chunks, originalChunks } = data
        console.log(`${originalChunks.length} linhas lidas`)
        console.log(`${chunks.length} linhas processadas`)
        res()
      })
      .onError(rej)
  })))
  .then(files => console.log('Arquivos processados'))
  .catch(console.error)

module.exports = () => new Promise((res, rej) => {
  console.log('Processando arquivos de dados. Por favor, aguarde!')
  const originalFilesPath = join(insightsPath, 'original')
  createReadStream(join(originalFilesPath, 'original.zip'))
    .pipe(extract({ path: originalFilesPath }))
    .on('close', () => res(bootstrap()))
})