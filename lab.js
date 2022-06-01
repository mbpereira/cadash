const fs = require('fs')
const path = require('path')
const readline = require('readline')
const stream = fs.createReadStream(path.join('.', 'src', 'controllers', 'upload.js'), { encoding: 'utf8' })

let i = 0
const process = readline.createInterface(stream)
process.on('line', line => console.log(i++, line) && stream.close())
