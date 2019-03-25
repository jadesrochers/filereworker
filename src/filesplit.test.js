jest.mock('./filehelpers')
const fsplit = require('./filesplit')
const fh = require('./filehelpers')
const subp = require('@jadesrochers/subprocess');

test('Minimum always set to one', () => {
  expect(fsplit.oneMinimum(3)).toBe(3)
  expect(fsplit.oneMinimum(1)).toBe(1)
  expect(fsplit.oneMinimum(0.1)).toBe(1)
  expect(fsplit.oneMinimum(-2)).toBe(1)
})

test('Calculate split size from file size', () => {
  expect(fsplit.calculateSize(64)(8)).toBe(9)
  expect(fsplit.calculateSize(45)(9)).toBe(6)
})

test('Calculate split lines from file lines', () => {
  expect(fsplit.calculateLines(6000)(6)).toBe(1001)
  expect(fsplit.calculateLines(3500)(7)).toBe(501)
})

test('Split file by size command', () => {
  expect(fsplit.splitFileSizeComm('/fake/filename.txt')(10)).toBe('cd /fake/ &&  split -C 10m --numeric-suffixes filename.txt filename_Split_')
})

test('Split file by lines command', () => {
  expect(fsplit.splitFileLineComm(['/path/to/fakefile.txt',2500])).toBe('cd /path/to/ &&  split --lines=2500 --numeric-suffixes fakefile.txt fakefile_Split_')
})

test('Check file split Size', async () => {
  expect.assertions(1)
  await expect(fsplit.getFileSplitSize('fake.txt')).resolves.toBe(18)
})

test('Check file split Lines', async () => {
  expect.assertions(1)
  await expect(fsplit.getFileSplitLines('fake.txt')).resolves.toBe(34718)
})

jest.mock('@jadesrochers/subprocess')
test('Test file size splitter, integrates size commands', async () => {
  expect.assertions(1)
  await fsplit.splitBySize('/path/to/fake.txt')
  expect(subp.shellCommand).toHaveBeenCalledWith('cd /path/to/ &&  split -C 9m --numeric-suffixes fake.txt fake_Split_')
})

test('Test file line splitter; integrates line commands', async () => {
  expect.assertions(1)
  await fsplit.splitByLines('/path/to/fake.txt')
  expect(subp.shellCommand).toHaveBeenCalledWith('cd /path/to/ &&  split --lines=13845 --numeric-suffixes fake.txt fake_Split_')
})
