const path = require('path');
const { countBreaks } = require('grapheme-breaker');
const stripAnsi = require('strip-ansi');
const chalk = require('chalk');
const filesize = require('filesize');

const columns = [{ align: 'left' }, { align: 'right' }, { align: 'right' }];

// Several functions in here were taken from parcel's official Logging class
// https://github.com/parcel-bundler/parcel/blob/2aa72153509a72c0fd247b3e94495071ae61f717/src/Logger.js#L154
function pad(text, length, align = 'left') {
  let pad = ' '.repeat(length - stringWidth(text));
  if (align === 'right') {
    return pad + text;
  }

  return text + pad;
}

function stringWidth(string) {
  return countBreaks(stripAnsi('' + string));
}

function table(table) {
  // Measure column widths
  let colWidths = [];

  table.forEach((row) => {
    row.forEach((item, idx) => {
      colWidths[idx] = Math.max(colWidths[idx] || 0, stringWidth(item));
    })
  });

  // Render rows
  table.forEach((row) => {
    let items = row.map((item, i) => {
      // Add padding between columns unless the alignment is the opposite to the
      // next column and pad to the column width.
      let padding =
        !columns[i + 1] || columns[i + 1].align === columns[i].align ? 4 : 0;
      return pad(item, colWidths[i] + padding, columns[i].align);
    });

    console.log(items.join(''));
  });
}

function sortResults(a, b) {
  const aSize = a.size;
  const bSize = b.size;
  const aFile = a.file;
  const bFile = b.file;

  if (aSize > bSize) {
    return -1;
  }

  if (aSize < bSize) {
    return 1;
  }

  if (aSize === bSize) {
    if (aFile < bFile) {
      return -1;
    }

    if (aFile > bFile) {
      return 1;
    }

    return 0;
  }
}

function formatResults(result) {
  return [
    path.relative(process.cwd(), result.file).replace(/(.+)\/(.+)$/, (_, p1, p2) => chalk.gray(`${p1}/`) + chalk.bold.cyan(p2)),
    chalk.bold.magenta(filesize(result.size)),
    chalk.bold.green(result.time / 1000 + 's'),
  ]
}

module.exports = {
  table,
  pad,
  stringWidth,
  sortResults,
  formatResults,
};
