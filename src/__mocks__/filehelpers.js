// /__mocks__/filehelpers.js

const fh = jest.requireActual('../filehelpers')
const mockfs = require('mock-fs')

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
    'file.csv': randRows(100000) 
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

fh.mockfs = mockfs
module.exports = fh
