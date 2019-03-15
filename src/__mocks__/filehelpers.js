// /__mocks__/filehelpers.js

const fh = jest.requireActual('../filehelpers')

var mockSize = jest.fn()
var mockLines = jest.fn()
mockSize.mockReturnValueOnce(155)
mockSize.mockReturnValue(70)
mockLines.mockReturnValueOnce(312450)
mockLines.mockReturnValue(124600)

fh.getFileSizeMb = mockSize
fh.getFileLines = mockLines

module.exports = fh
