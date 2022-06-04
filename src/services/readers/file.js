const fs = require('fs')
const { readline } = require('../../utils/fs')

const createFileReader = ({ input, inputEncoding = 'utf-8' }) => {
  const transformerEvents = []
  const chunks = []
  const originalChunks = []
  const onLineEvents = []
  const onTransformEvents = []

  let reader, writer, _onFinish, _onError, _stopIf

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
      if (typeof _onError === 'function') _onError(e)
    }
  }

  const canContinue = () => {
    if (typeof _stopIf === 'function')
      return !_stopIf({ chunks, originalChunks })
    return true
  }
  const processor = {
    transform: cb => {
      transformerEvents.push(cb)
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
            onLineEvents.forEach(evt => evt(line))
            originalChunks.push(line)
            transformerEvents.forEach(evt => line = evt(line))
            chunks.push(line)
            onTransformEvents.forEach(evt => evt(line))
            if (!canContinue())
              reader.close()
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
    },
    stop: () => reader.close(),
    onLine: cb => {
      onLineEvents.push(cb)
      return processor
    },
    onTransform: cb => {
      onTransformEvents.push(cb)
      return processor
    },
    stopIf: cb => {
      _stopIf = cb
      return processor
    }
  }

  return processor
}

module.exports = {
  createFileReader
}