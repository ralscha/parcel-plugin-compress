const brotliAdapter = () => {
	const zlib = require('zlib');
	if (zlib.brotliCompressSync) {
		return { isZlib: true, compress: zlib.brotliCompressSync };
	} else {
		const brotli = require('brotli');
		return brotli;
	}
};

module.exports = brotliAdapter;
