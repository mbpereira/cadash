const { join } = require('path')
const { mv, getFileExtension } = require('../utils/fs')

const uploadPath = process.env.UPLOAD_DIR

const filesService = () => ({
  saveFile: async (file, newFilenameWithoutExtension = null) => {
    const ext = getFileExtension(file.originalFilename)
    const original = file.filepath
    let filename = file.originalFilename
    if (newFilenameWithoutExtension)
      filename = newFilenameWithoutExtension + ext
    await mv(original, join(uploadPath, filename))
  }
})

module.exports = filesService