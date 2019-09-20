# File Reworker
Has a variety of helper functions for working with files to get file stats  
like path,stats, name.
The main functions though are for splitting files by size or by lines  
into smaller files.

## Whats the Use?
The file helpers are just little shortcuts, but the splitting functions  
are used for making very large files into smaller files without breaking  
lines in data such as text,csv.

## installation 
npm install @jadesrochers/filereworker

const filere = require('@jadesrochers/checksettings')

## Usage
There are several ways to split files; by size, number, and cores,  
with each option having size and lines sub options.

### Manually split by size or lines
Split a file into pieces specified by size in Mb.
```javascript
fsplit.splitFileSize('/fake/filename.txt')(10)
```

Split a file into pieces specified by number of lines.
```javascript
fsplit.splitFileLines(['/path/to/fakefile.txt',2500])
```

For both these functions, if the size/lines does not result in evenly  
dividing the file, the last file will be the remainder so the others are equal.  

### Automatic sizing of the splits
For these functions you don't need to provide a size or lines argument, just an indication of which size metric to use.

#### Split into even size/line piece specifying just the number
Specify the number of files, and based on either lines or size
will try and make that exact number as even as possible.
```javascript
fsplit.splitEvenSize('/not/a/real/file.csv')
fsplit.splitEvenLines('/not/a/real/file.csv')
```
#### Split by number of cores
Splits files into pieces based on the number of cores you have minus 1.  
There is a size(S) and lines(L) version based on which will more accurately  
split up the processing workload for the resulting files.  
```javascript
fsplit.splitByCoresS('/not/a/real/file.csv')
fsplit.splitByCoresL('/not/a/real/file.csv')
```

### Helper functions
Some function to do basic path and sizing tasks.

Get file name:
```javascript
fh.getFileName('/path/to/filename.txt')  
>> filename.txt 
```

Get a file path:  
```javascript
filere.getPath('/test/name/file.js')  
>> /test/name
```

Get file name without extension:  
```javascript
fh.nameAndBody('/fake/path/to/fakefile.txt')  
>> fakefile
```

Get file size in Mb:  
```javascript
fh.getFileSizeMb('/not/a/real/file.csv')
```

Get number of lines in file:  
```javascript
fh.getFileLines('/path/to/fakefile.txt')
```
