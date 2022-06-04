const analytics = require('./src/services/processors/analytics');
const { createFileReader } = require('./src/services/readers/file');
const { insightCsv } = require('./src/utils/app');

const files = [{
  file: '2021',
  columns: ['DevType', 'Country', 'DatabaseWantToWorkWith', 'DatabaseHaveWorkedWith', 'LanguageHaveWorkedWith', 'LanguageWantToWorkWith']
}, {
  file: '2020',
  columns: ['DevType', 'Country', 'DatabaseDesireNextYear', 'DatabaseWorkedWith', 'LanguageWorkedWith', 'LanguageDesireNextYear']
}, {
  file: '2019',
  columns: ['DevType', 'Country', 'DatabaseDesireNextYear', 'DatabaseWorkedWith', 'LanguageWorkedWith', 'LanguageDesireNextYear']
}, {
  file: '2018',
  columns: ['DevType', 'Country', 'DatabaseDesireNextYear', 'DatabaseWorkedWith', 'LanguageWorkedWith', 'LanguageDesireNextYear']
}]

files.forEach(({ file: f, columns }) => {
  const csv = insightCsv(f)
  let identifiers = []

  const reader = createFileReader({ input: csv })
    .transform(line => {
      processedLine = line
      const matches = processedLine.match(/"(.*?)"/ig)
      if (Array.isArray(matches))
        matches.forEach(m => processedLine = processedLine.replace(m, m.replace(/,/ig, ' -')))
      return processedLine
    })
    .transform(line => line.replace(/"/ig, ''))
    .stopIf(({ chunks }) => chunks.length > 0)
    .read()
    .onFinish(({ chunks }) => {
      const line = chunks[0]
      columns.forEach(c => {
        const pos = line.split(',').indexOf(c)
        console.log(`Arquivo: ${f}; Coluna ${c}; Posição ${pos}`)
      })
    })
})