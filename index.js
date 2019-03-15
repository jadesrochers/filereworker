const split = require('./src/filesplit')
const help = require('./src/filehelpers')

let combine
combine = {...combine,...split}
combine = {...combine,...help}
module.exports = combine 
