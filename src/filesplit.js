const fs = require('fs');
const os = require('os');
const path = require('path');

const fps = require('@jadesrochers/fpstreamline')
const fh = require('./filehelpers');
const F = require('lodash/fp')
const R = require('ramda')
const subp = require('@jadesrochers/subprocess');


// resets value to 1 if less than 1
const oneMinimum = input => {
   if(input < 1){
   return 1 
   }else{ return input }
}

// Size to split into; assumes each file uses a core
const calculateSize = inputsize => cores => {
  minsize = 1;
  if(inputsize <= (cores*minsize)){
    return minsize
  }else{
    return F.round((inputsize + cores - 1)/cores)
  }
}

// Get number of lines per subfile based on total lines and # of parts.
const calculateLines = lines => parts => {
  return F.round((lines + parts - 1)/parts)
}

// Give it the number of cores to NOT use.
const coresMinus = R.pipe(
    F.subtract(os.cpus().length),
    oneMinimum,
  )

const getSplitSize = R.pipe(
  fps.append(coresMinus(1)),
  fps.runAll(calculateSize),
)

const getSplitLines = R.pipe(
  fps.append(coresMinus(1)),
  fps.runAll(calculateLines),
)

// determine the size of chunks to split the main file into
const getFileSplitSize = fps.pipeAsync(
  fh.getFileSizeMb,
  getSplitSize,
)

const getFileSplitLines = fps.pipeAsync(
  fh.getFileLines,
  getSplitLines,
)

// Modified file splitter
const splitFileSizeComm = F.curry((file, size) => R.pipe(
    fh.changeDir,
    fps.concat(` split -C ${size}m --numeric-suffixes `),
    fps.concat(fh.nameAndBody(file)),
    fps.concat('_Split_'),
  )(file)
)

// Takes array of path to file, number of lines in file
const splitFileLineComm = R.pipe(
    R.adjust(1)(lines => ` split --lines=${lines} --numeric-suffixes `),
    R.reverse,
    fps.prependUseNth(1)(fh.changeDir),
    R.adjust(2)(fh.nameAndBody),
    R.append('_Split_'),
    F.join(''),
)

// Takes a file name and puts together command to split file
const splitFileBySize = splitsize => fps.pipeAsync(
  R.append(splitsize),
  fps.runAll(splitFileSizeComm),
)

const splitFileByLines = splitlines => fps.pipeAsync(
  R.append(splitlines),
  splitFileLineComm,
)

const splitBySize = R.curry(async (file,sizemb) => {
  let comm = await splitFileSizeComm(file)(sizemb)
  await subp.shellCommand(comm)
})

const splitByLines = R.curry(async (file,lines) => {
  let comm = await splitFileLineComm([file, lines])
  await subp.shellCommand(comm)
})

const splitByCoresS = async (file) => {
  let size = await getFileSplitSize(file)
  await splitBySize(file)(size)
}

const splitByCoresL = async (file) => {
  let lines = await getFileSplitLines(file)
  await splitByLines(file, lines)
}

const splitEvenSize = async (file, pieces) => {
  let size = await fh.getFileSizeMb(file)
  let splitsize = calculateSize(size)(pieces)
  await splitBySize(file)(splitsize)
}

const splitEvenLines = async (file, pieces) => {
  let lines = await fh.getFileLines(file)
  let splitlines = calculateLines(lines)(pieces)
  await splitByLines(file, splitlines)
}


exports.getFileSplitSize = getFileSplitSize
exports.getFileSplitLines = getFileSplitLines
exports.splitBySize = splitBySize
exports.splitByLines = splitByLines
exports.splitByCoresS = splitByCoresS
exports.splitByCoresL = splitByCoresL
exports.splitEvenSize = splitEvenSize
exports.splitEvenLines = splitEvenLines

exports.splitFileSizeComm = splitFileSizeComm
exports.splitFileLineComm = splitFileLineComm
exports.oneMinimum = oneMinimum
exports.calculateSize = calculateSize
exports.calculateLines = calculateLines

