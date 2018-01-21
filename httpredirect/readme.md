# HTTP Redirect

Creates a Total.js redirect for GET requests. __IMPORTANT__: data are sent only while the request is redirected on a relative URL address.

```javascript
{
	query: { msg: 'Hello' }, // parsed query string, e.g. /test/1?msg=Hello
	headers: {}, // Header keys
	uri: {}, // Parsed URL,
	url: '' // Relative URL
}
```