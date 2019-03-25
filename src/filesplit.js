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
  fps.append(coresMinus(3)),
  fps.runAll(calculateSize),
)

const getSplitLines = R.pipe(
  fps.append(coresMinus(3)),
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
const splitFileBySize = fps.pipeAsync(
  fps.appendUseNth(0)(getFileSplitSize),
  fps.runAll(splitFileSizeComm),
)

const splitFileByLines = fps.pipeAsync(
  fps.appendUseNth(0)(getFileSplitLines),
  splitFileLineComm,
)

const splitBySize = async (file) => {
  var comm = await splitFileBySize(file)
  await subp.shellCommand(comm)
}

const splitByLines = async (file) => {
  var comm = await splitFileByLines(file)
  await subp.shellCommand(comm)
}


exports.getFileSplitSize = getFileSplitSize
exports.getFileSplitLines = getFileSplitLines
exports.splitBySize = splitBySize
exports.splitByLines = splitByLines
exports.splitFileSizeComm = splitFileSizeComm
exports.splitFileLineComm = splitFileLineComm
exports.oneMinimum = oneMinimum
exports.calculateSize = calculateSize
exports.calculateLines = calculateLines

