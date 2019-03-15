const fs = require('fs');
// Replace some of my functions with the built in path tools
/* const path = require('path'); */
const os = require('os');

const fps = require('@jadesrochers/fpstreamline')
const F = require('lodash/fp')
const R = require('ramda')
const subp = require('@jadesrochers/subprocess');

const getFileName = fullPath => fullPath.slice(fullPath.lastIndexOf('/')+1)
const getFileBody = fullPath => fullPath.slice(fullPath.lastIndexOf('/')+1, fullPath.lastIndexOf('.'))
const getPath = fullPath => fullPath.slice(0,-(fullPath.length-(fullPath.lastIndexOf('/')+1)))

const getFileStats = filePath => fs.statSync(filePath) 
const getDirectoryContent = fullPath => fs.readdirSync(fullPath)

const loadFile = (filepath, encoding = 'utf8') => fs.readFileSync(filepath, encoding)
const loadJSONFile = (filepath, encoding = 'utf8') => fps.toJSON(loadFile(filepath, encoding)) 

const getFileSizeMb = fps.pipeAsync(
  getFileStats,
  F.get('size'),
  fps.divide(1024 * 1024),
  F.round,
)

// Takes a filePath and gets the line count
const getFileLines = fps.pipeAsync(
  R.concat('wc -l '),
  subp.shellCommand,
  subp.commandOutput,
  F.split(' '),
  F.nth(0),
  fps.strToNum,
)

// Takes the path of the original file to look for split versions.
const getSplitPaths = path => fps.pipeAsync(
  getPath,
  getDirectoryContent,
  F.filter(fps.strSearchBool(/_Split_/)),
  F.map(R.concat(getPath(path))),
)(path)


const fileName = R.pipe(
  getFileName,
  F.add(''),
  F.add(' '),
)

// Change to a directory
const changeDir = R.pipe(
  getPath,
  R.concat('cd '),
  fps.concat(' && '),
)

// Outputs name and body of file path from the full path input
const nameAndBody = R.pipe(
  fps.prependUseNth(0)(getFileBody),
  fps.prependUseNth(1)(getFileName),
  F.dropRight(1),
  F.join(' '),
)

// Give it an array of files to delete
const deleteFiles = fps.pipeAsync(
  F.castArray,
  F.join(' '),
  F.add('rm -v '),
  subp.shellCommand,
  subp.commandOutput,
)

// Puts first line of source into dest
// take [source, dest] as arg
const insertHeading = R.pipe(
    fps.appendUseNth(1)(n=>n),
    F.reverse,
    fps.appendUseNth(1)(changeDir),
    R.insert(3)('head -n 1'),
    F.reverse,
    R.insert(3)(' | cat - '),
    R.insert(5)('> tmp && mv tmp'),
    F.join(' '),
  )

const insertHeadings = async (sourcepath) => {
  var paths = await getSplitPaths(sourcepath)
  for(split of paths.slice(1)){
    var headingComm = insertHeading([sourcepath, split])
    await subp.shellCommand(headingComm) 
  }
}

exports.getFileName = getFileName
exports.getFileBody = getFileBody
exports.loadJSONFile = loadJSONFile
exports.loadFile = loadFile
exports.getPath = getPath
exports.getFileSizeMb = getFileSizeMb
exports.getFileLines = getFileLines
exports.getSplitPaths = getSplitPaths
exports.fileName = fileName
exports.changeDir = changeDir
exports.nameAndBody = nameAndBody
exports.deleteFiles = deleteFiles
exports.insertHeading = insertHeading
exports.insertHeadings = insertHeadings

