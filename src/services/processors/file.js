const fs = require('fs')
const { readline } = require('../../utils/fs')

const createFileProcessor = ({ input, inputEncoding = 'utf-8' }) => {
  const transformers = [], chunks = [], originalChunks = []
  let reader, writer, _onFinish

  reader = readline(input, inputEncoding)

  const write = queue => {
    if (queue.length <= 0)
      return writer.close()

    const ok = writer.write(queue.shift())

    if (!ok)
      return writer.once('drain', () => write(queue))

    write(queue)
  }

  const processor = {
    transform: cb => {
      transformers.push(cb)
      return processor
    },
    writeTo: ({ output, outputEncoding = 'utf-8' }) => {
      writer = fs.createWriteStream(output, outputEncoding)
      return processor
    },
    process: () => {
      reader
        .onLine(line => {
          originalChunks.push(line)
          transformers.forEach(transform => line = transform(line))
          chunks.push(line)
        })

      reader.onClose(() => {
        if (!writer) return _onFinish()

        write(chunks.slice())
        writer.on('close', _onFinish)
      })

      return processor
    },
    onFinish: cb => {
      _onFinish = () => typeof cb === 'function' && cb({ originalChunks, chunks })
      return processor
    }
  }

  return processor
}

module.exports = {
  createFileProcessor
}