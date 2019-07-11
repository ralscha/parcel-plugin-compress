const chalk = require('chalk');

const brotliAdapter = () => {
	try {
		const iltorb = require('iltorb');

		return { compress: iltorb.compressSync }
	} catch (err) {
		console.log(chalk.yellow('Compression warning: iltorb could not be loaded. Falling back to brotli.'));

		const brotli = require('brotli');

		return brotli
	}
};

module.exports = brotliAdapter;
