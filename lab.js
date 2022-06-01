const { join } = require('path')
const { createFileProcessor } = require('./src/services/processors/file')

const inputFile = join('./', 'files', 'survey_results_public.csv')
const outputFile = inputFile.concat('.tmp')

createFileProcessor({ input: inputFile })
	.transform(line => {
		processedLine = line + '\n'
		const matches = processedLine.match(/"(.*?)"/ig)
		if (Array.isArray(matches))
			matches.forEach(m => processedLine = processedLine.replace(m, m.replace(/,/ig, ' -')))
		return processedLine
	})
	.process()
	.onFinish(data => {
		const { chunks, originalChunks } = data
		console.log(`${originalChunks.length} linhas lidas`)
		console.log(`${chunks.length} linhas processadas`)
	})

// const process = filepath => new Promise((res, rej) => {
// 	const ext = getFileExtension(filepath)
// 	const reader = readline(filepath)
// 	const tmpfile = `${filepath}.tmp${ext}`
// 	const writer = fs.createWriteStream(tmpfile)

// 	const queue = []

// 	reader.on('line', line => {
// 		try {
// 			line = line + '\n'
// 			const matches = line.match(/"(.*?)"/ig)
// 			if (Array.isArray(matches))
// 				matches.forEach(m => line = line.replace(m, m.replace(/,/ig, ' -')))
// 			queue.unshift(line)
// 		} catch (e) {
// 			rej(e)
// 		}
// 	})

// 	reader.on('close', () => {
// 		console.log('finish...')
// 		save()
// 	})


// })

// process(join('./', 'files', 'survey_results_public.csv'))
// 	.then(() => "Processado")
// 	.catch(console.error)