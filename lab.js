const fs = require('fs')
const { join } = require('path')
const { readline, getFileExtension } = require('./src/utils/fs')

let lineNumber = 0

const process = filepath => new Promise((res, rej) => {
	const ext = getFileExtension(filepath)
	const reader = readline(filepath)
	const tmpfile = `${filepath}.tmp${ext}`
	const writer = fs.createWriteStream(tmpfile)

	const queue = []

	reader.on('line', line => {
		try {
			line = line + '\n'
			const matches = line.match(/"(.*?)"/ig)
			if (Array.isArray(matches))
				matches.forEach(m => line = line.replace(m, m.replace(/,/ig, ' -')))
			queue.unshift(line)
		} catch (e) {
			rej(e)
		}
	})

	reader.on('close', () => {
		console.log('finish...')
		save()
	})

	const save = () => {
		if (queue.length <= 0) {
			writer.close()
			return
		}

		const ok = writer.write(queue.pop())
		if (!ok) {
			writer.once('drain', save)
			return
		}

		save()
	}
})

process(join('./', 'files', 'survey_results_public.csv'))
	.then(() => "Processado")
	.catch(console.error)