const chalk = require('chalk');

const zopfliAdapter = () => {
	try {
		const zopfli = require('node-zopfli-es');
		return zopfli;
	} catch (err) {
		console.log(chalk.yellow('Compression warning: node-zopfli-es could not be loaded. Falling back to @gfx/zopfli.'))

		const zopfli = require('@gfx/zopfli');
		return zopfli;
	}
}

module.exports = zopfliAdapter
