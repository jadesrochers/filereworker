// /__mocks__/subprocess.js
const subp = jest.genMockFromModule('@jadesrochers/subprocess')

var mockShell = jest.fn()
var mockOutput = jest.fn(n => n.stdout)
mockShell.mockReturnValueOnce({stdout: '23200 filename.example', stderr: ''})
mockShell.mockReturnValue({stdout: '', stderr: ''})
subp.shellCommand = mockShell
subp.commandOutput = mockOutput

module.exports = subp
