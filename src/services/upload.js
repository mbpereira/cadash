const { join } = require('path')
const { getFileExtension, move } = require('../utils/fs')

const uploadPath = process.env.UPLOAD_DIR

const filesService = () => ({
  saveFile: async (file, newFilenameWithoutExtension = null) => {
    const ext = getFileExtension(file.originalFilename)
    const original = file.filepath
    let filename = file.originalFilename
    if (newFilenameWithoutExtension)
      filename = newFilenameWithoutExtension + ext
    await move(original, join(uploadPath, filename))
  }
})

module.exports = filesService