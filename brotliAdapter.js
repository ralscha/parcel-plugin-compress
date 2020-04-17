const chalk = require('chalk');

const brotliAdapter = () => {
	const zlib = require('zlib');
	if (zlib.brotliCompressSync) {
		return { isZlib: true, compress: zlib.brotliCompressSync };
	} else {
		console.log(chalk.yellow('Compression warning: zlib too old. Falling back to brotli.'));
		const brotli = require('brotli');
		return brotli;
	}
};

module.exports = brotliAdapter;
