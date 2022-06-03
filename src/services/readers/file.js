const fs = require('fs')
const { readline } = require('../../utils/fs')

const createFileReader = ({ input, inputEncoding = 'utf-8' }) => {
  const transformers = [], chunks = [], originalChunks = []
  let reader, writer, _onFinish, _onError

  reader = readline(input, inputEncoding)

  const write = queue => {
    if (queue.length <= 0)
      return writer.close()

    const ok = writer.write(queue.shift())

    if (!ok)
      return writer.once('drain', () => write(queue))

    write(queue)
  }

  const tryExec = cb => {
    try {
      return cb()
    } catch (e) {
      _onError(e)
    }
  }

  const processor = {
    transform: cb => {
      transformers.push(cb)
      return processor
    },
    writeTo: ({ output, outputEncoding = 'utf-8' }) => {
      writer = tryExec(() => fs.createWriteStream(output, outputEncoding))
      return processor
    },
    read: () => {
      reader
        .onLine(line =>
          tryExec(() => {
            originalChunks.push(line)
            transformers.forEach(transform => line = transform(line))
            chunks.push(line)
          })
        )

      reader.onClose(() =>
        tryExec(() => {
          if (!writer) return _onFinish()

          write(chunks.slice())
          writer.on('close', _onFinish)
        })
      )

      return processor
    },
    onFinish: cb => {
      _onFinish = () => typeof cb === 'function' && cb({ originalChunks, chunks })
      return processor
    },
    onError: cb => {
      _onError = err => typeof cb === 'function' && cb(err)
      return processor
    }
  }

  return processor
}

module.exports = {
  createFileReader
}