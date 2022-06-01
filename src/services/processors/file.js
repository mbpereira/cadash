const fs = require('fs')
const { readline } = require('../../utils/fs')

const createFileProcessor = ({ input, inputEncoding = 'utf-8' }) => {
	const _transformers = [], chunks = [], originalChunks = []
	let _reader, _writer, _onFinish

	_reader = readline(input, inputEncoding)

	const write = queue => {
		if (queue.length <= 0)
			return _writer.close()

		const ok = _writer.write(queue.shift())

		if (!ok)
			return _writer.once('drain', () => write(queue))

		write(queue)
	}

	const processor = {
		transform: cb => {
			_transformers.push(cb)
			return processor
		},
		writeTo: ({ output, outputEncoding = 'utf-8' }) => {
			_writer = fs.createWriteStream(output, outputEncoding)
			return processor
		},
		process: () => {
			_reader
				.onLine(line => {
					originalChunks.push(line)
					_transformers.forEach(transform => line = transform(line))
					chunks.push(line)
				})

			_reader.onClose(() => {
				if (!_writer) return _onFinish()

				write(chunks.slice())
				_writer.on('close', _onFinish)
			})

			return processor
		},
		onFinish: cb => {
			_onFinish = () => cb({ originalChunks, chunks })
			return processor
		}
	}

	return processor
}

module.exports = {
	createFileProcessor
}