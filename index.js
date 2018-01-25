const path = require('path');
const fs = require('fs');
const glob = require('glob-promise');
const zopfli = require('node-zopfli');
const pQueue = require('p-queue');
const brotli = require('brotli');

module.exports = bundler => {

    const logger = bundler.logger;

	bundler.on('bundled', async (bundle) => {
		const dir = path.dirname(bundle.name);
		const inputGlob = path.join(dir, '/**/!(*.gz|*.br)');
		const files = await glob(inputGlob);

		const queue = new pQueue({concurrency: 2});

		files.forEach(file => {
			queue.add(() => zopfliCompress(file));
			queue.add(() => brotliCompress(file));
		});    

		await queue.onIdle();
        logger.clear();

	});

	function zopfliCompress(file) {
		const stat = fs.statSync(file);
		if (!stat.isFile()) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			fs.readFile(file, function(err, content) {
				logger.status('🗜', 'Compressing: ' + file);
				zopfli.gzip(content, { numiterations: 15, blocksplitting: true, blocksplittinglast: false, blocksplittingmax: 15}, 
							function(err, compressedContent) {
					if (stat.size > compressedContent.length) {
						fs.writeFile(file + '.gz', compressedContent, () => resolve());
					} else {
						resolve();
					}
				});
			});
		});
	}

	function brotliCompress(file) {
		const stat = fs.statSync(file);
		if (!stat.isFile()) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			fs.readFile(file, (err, content) => {
				logger.status('🗜', 'Compressing: ' + file);
				const compressedContent = brotli.compress(content, { mode: 1, quality: 11, lgwin: 22 });
				if (compressedContent !== null && stat.size > compressedContent.length) {
					fs.writeFile(file + '.br', compressedContent, () => resolve());
				} else {
					resolve();
				}
			});

		});
	}
};




