jest.mock('@jadesrochers/subprocess')

const mockfs = require('mock-fs')
const fh = require('./filehelpers')
const subp = require('@jadesrochers/subprocess');

randRows = (rows) => {
  var str = ''
  for(var i = 0; i < rows; i++){
    str = str.concat(Math.random() + '\n')
  }
  return str
}

mockfs({
  '/fake/path/dir': {
    'fakefile1.txt': 'Fake file 1 contents',
    'fakefile2.txt': 'Another fake file',
    'fakefile3.txt': 'The last fake file in this location',
  },
  '/not/a/real': {
    'file.csv': randRows(30000) 
  },
  '/fake/splits': {
    'notsplit.txt': '',
    'fake_Split_01': 'split1',
    'fake_Split_02': 'split2',
    'fake_Split_05': 'split5',
    'fake_Split_23': 'split23',
    'otherfile.csv': '',
    'source.json': '',
  }
   
})

test('Get file name', () => {
  expect(fh.getFileName('/home/jad/dev/javascript/react/geoJsonProcess.js')).toBe('geoJsonProcess.js')
})

test('File name fn, name with a space', () => {
  expect(fh.fileName('/home/jad/dev/javascript/react/geoJsonProcess.js')).toBe(' geoJsonProcess.js')
})

test('Get the file name without extension', () => {
  expect(fh.getFileBody('/home/jad/dev/javascript/react/geoJsonProcess.js')).toBe('geoJsonProcess')
})

test('Get the path of the file', async () => {
  expect.assertions(1)
  expect(fh.getPath('/test/name/geoJsonProcess.js')).toBe('/test/name/')
})

test('Change dir command', () => {
  expect(fh.changeDir('/fake/example/dir/filename.txt')).toBe('cd /fake/example/dir/ && ')
})

test('Get file name and body(name without ext)', () => {
  expect(fh.nameAndBody('/fake/path/to/fakefile.txt')).toBe('fakefile.txt fakefile')
})

test('Insert file heading command', () => {
  expect(fh.insertHeading(['/path/to/original.txt','/path/to/original_split01.txt'])).toBe('cd /path/to/ &&  head -n 1 /path/to/original.txt  | cat -  /path/to/original_split01.txt > tmp && mv tmp /path/to/original_split01.txt')
})

test('File size in Mb', async () => {
  expect.assertions(1)
  await expect(fh.getFileSizeMb('/not/a/real/file.csv')).resolves.toBe(1)
})

test('Get number of file lines', async () => {
  expect.assertions(2)
  await expect(fh.getFileLines('fakefile.txt')).resolves.toBe(23200)
  expect(subp.shellCommand).toHaveBeenCalledWith('wc -l fakefile.txt')
})

test('File number of lines', async () => {
  expect.assertions(4)
  await expect(fh.deleteFiles('onefile.txt')).resolves.toBe('')
  expect(subp.shellCommand).toHaveBeenLastCalledWith('rm -v onefile.txt')
  await expect(fh.deleteFiles(['one.txt', 'two.txt', 'three.json'])).resolves.toBe('')
  expect(subp.shellCommand).toHaveBeenLastCalledWith('rm -v one.txt two.txt three.json')
})

test('Find split files by name', async () => {
  expect.assertions(1)
  await expect(fh.getSplitPaths('/fake/splits/source.json')).resolves
    .toEqual(expect.arrayContaining(["/fake/splits/fake_Split_01", "/fake/splits/fake_Split_02", "/fake/splits/fake_Split_05", "/fake/splits/fake_Split_23"]))
})

test('Insert Headings command integration', async () => {
  expect.assertions(2)
  expect(subp.shellCommand).toHaveBeenCalledTimes(3)
  await fh.insertHeadings('/fake/splits/otherfile.csv')
  expect(subp.shellCommand).toHaveBeenCalledTimes(6)
  mockfs.restore()
})

