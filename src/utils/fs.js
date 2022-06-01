const { readdir, createReadStream, cp, rm, rename } = require('fs')
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

	const _readline = {
		getInterface: () => reader,
		getStream: () => stream,
		onLine: cb => {
			reader.on('line', cb)
			return _readline
		},
		onClose: cb => {
			reader.on('close', cb)
			return _readline
		},
	}

	return _readline
}

const copy = (src, dest) => new Promise((res, rej) => {
	cp(src, dest, err => {
		if (err) return rej(err)
		res()
	})
})

const remove = filepath => new Promise((res, rej) => {
	rm(filepath, err => {
		if (err) return rej(err)
		res()
	})
})

const move = async (src, dest) => {
	await copy(src, dest)
	await remove(src)
}

const _rename = (src, dest) => new Promise((res, rej) => {
	rename(src, dest, err => {
		if (err) return rej(err)
		res()
	})
})

const getFileExtension = filename => filename.match(/\.[0-9a-z]+$/i)[0]

module.exports = {
	getAllFileNamesFromDirectory,
	readline,
	move,
	copy,
	remove,
	getFileExtension,
	rename: _rename
}