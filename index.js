const fs = require('fs');
const { default: pQueue } = require('p-queue');
const { cosmiconfig } = require('cosmiconfig');
const chalk = require('chalk');
const zopfliAdapter = require('./zopfliAdapter');
const brotliAdapter = require('./brotliAdapter');
const zlib = require('zlib');
const { table, sortResults, formatResults } = require('./formatter');

const brotli = brotliAdapter();
const zopfli = zopfliAdapter();

const defaultOptions = {
	test: '.',
	threshold: undefined,
	concurrency: 2,
	gzip: {
		enabled: true,
		numiterations: 15,
		blocksplitting: true,
		blocksplittinglast: false,
		blocksplittingmax: 15,
		zlib: false,
		zlibLevel: zlib.constants.Z_BEST_COMPRESSION,
		zlibMemLevel: zlib.constants.Z_BEST_COMPRESSION
	},
	brotli: {
		enabled: true,
		mode: 0,
		quality: 11,
		lgwin: 22,
		lgblock: 0,
		enable_dictionary: true,
		enable_transforms: false,
		greedy_block_split: false,
		enable_context_modeling: false
	}
};

let output = [];

module.exports = bundler => {
	bundler.on('bundled', async (bundle) => {
		if (process.env.NODE_ENV === 'production') {
			const start = new Date().getTime();
			console.log(chalk.bold('\n🗜️  Compressing bundled files...\n'));

			try {
				const explorer = cosmiconfig('compress');
				const { config: { gzip, brotli, test, threshold } } = (await explorer.search()) || { config: defaultOptions };

				const fileTest = new RegExp(test);
				function* filesToCompress(bundle) {
					if (bundle.name && fileTest.test(bundle.name)) {
						yield bundle.name
					}
					for (var child of bundle.childBundles) {
						yield* filesToCompress(child)
					}
				}

				const queue = new pQueue({ concurrency: defaultOptions.concurrency });

				[...filesToCompress(bundle)].forEach(file => {
					queue.add(() => gzipCompress(file, { ...defaultOptions.gzip, threshold, ...gzip }));
					queue.add(() => brotliCompress(file, { ...defaultOptions.brotli, threshold, ...brotli }));
				});

				await queue.onIdle();

				const end = new Date().getTime();
				const formattedOutput = output.sort(sortResults).map(formatResults);

				console.log(chalk.bold.green(`\n✨  Compressed in ${((end - start) / 1000).toFixed(2)}s.\n`));

				table(formattedOutput);
			} catch (err) {
				console.error(chalk.bold.red('❌  Compression error:\n'), err);
			}
		}
	});

	function gzipCompress(file, config) {
		if (!config.enabled) {
			return Promise.resolve();
		}

		let stat;

		try {
			stat = fs.statSync(file);
		} catch (err) {
			return Promise.resolve();
		}

		const start = new Date().getTime();

		if (!stat.isFile()) {
			return Promise.resolve();
		}

		if (config.threshold && stat.size < config.threshold) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			fs.readFile(file, function (err, content) {
				if (err) { return reject(err); }

				if (config.zlib) {
					zlib.gzip(content, { level: config.zlibLevel, memLevel: config.zlibMemLevel }, handleCompressedData.bind(this, resolve, reject));
				} else {
					zopfli.gzip(content, config, handleCompressedData.bind(this, resolve, reject));
				}
			});
		});


		function handleCompressedData(resolve, reject, err, compressedContent) {
			if (err) { return reject(err); }

			if (stat.size > compressedContent.length) {
				const fileName = file + '.gz';

				fs.writeFile(fileName, compressedContent, () => {
					const end = new Date().getTime();

					output.push({ size: compressedContent.length, file: fileName, time: end - start });

					return resolve();
				});
			} else {
				resolve();
			}
		}
	}

	function brotliCompress(file, config) {
		if (!config.enabled) {
			return Promise.resolve();
		}

		let stat;

		try {
			stat = fs.statSync(file);
		} catch (err) {
			return Promise.resolve();
		}

		const start = new Date().getTime();

		if (!stat.isFile()) {
			return Promise.resolve();
		}

		if (config.threshold && stat.size < config.threshold) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			fs.readFile(file, (err, content) => {
				if (err) { return reject(err); }

				const compressedContent = brotli.compress(content, config);

				if (compressedContent !== null && stat.size > compressedContent.length) {
					const fileName = file + '.br';

					fs.writeFile(fileName, compressedContent, () => {
						const end = new Date().getTime();

						output.push({ size: compressedContent.length, file: fileName, time: end - start });

						return resolve();
					});
				} else {
					resolve();
				}
			});
		});
	}
};




