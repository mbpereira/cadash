const { readdir, createReadStream, cp, rm } = require('fs')
const { createInterface } = require('readline')

const getAllFileNamesFromDirectory = (path, includeDirectories) => new Promise((res, rej) => {
	readdir(path, { withFileTypes: true }, (err, files) => {
		if (err) return rej(err)
		res(files.filter(f => !includeDirectories && !f.isDirectory()).map(f => f.name))
	})
})

const readline = (path, encoding = 'utf8') => {
	const stream = createReadStream(path, { encoding })
	const reader = createInterface({ input: stream })
	return reader
}

const mv = (src, dest) => new Promise((res, rej) => {
	try {

		cp(src, dest, err => {
			if (err) throw err

			rm(src, err => {
				if (err) throw err
				res()
			})
		})
	} catch (e) {
		rej(e)
	}
})

const getFileExtension = filename => filename.match(/\.[0-9a-z]+$/i)[0]

module.exports = {
	getAllFileNamesFromDirectory,
	readline,
	mv,
	getFileExtension
}