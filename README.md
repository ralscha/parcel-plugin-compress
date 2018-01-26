Parcel plugin that precompresses all assets in production mode. 

This plugin utilizes [@gfx/zopfli](https://github.com/gfx/universal-zopfli-js) for GZip compression
and [brotli](https://www.npmjs.com/package/brotli) for Brotli compression.


### Installation

```
npm install parcel-plugin-compress -D
```


### Browser Support for Brotli

Current versions of the major browsers send `br` in the `Accept-Encoding` header when the request is sent over TLS

Support introduced in version ...

  * Edge 15
  * Firefox 44
  * Chrome 50
  * Safari 11


### Server support

To take advantage of precompressed resources you need a server that is able to understand the `Accept-Encoding` header and look for files that end in `.gz` or `.br`

#### NGINX 
NGINX supports Gzip compressed files out of the box with the `gzip_static` directive. 

Add this to a `http`, `server` or `location` section and NGINX will automatically look for files ending with .gz when the request contains an `Accept-Encoding` header with the value `gzip`. 
```
gzip_static  on;  
```
See the [documentation](http://nginx.org/en/docs/http/ngx_http_gzip_static_module.html) for more information.

To support Brotli you currently need to build NGINX from source with the [ngx_brotli](https://github.com/google/ngx_brotli) module from Google. 


#### Apache HTTPD
https://blog.desgrange.net/post/2017/04/10/pre-compression-with-gzip-and-brotli-in-apache.html


#### LightSpeed
Support for Brotli introduced in version [5.2](https://www.litespeedtech.com/products/litespeed-web-server/release-log)



