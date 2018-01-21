# HTTP route
When a request comes in bellow object is available at `flowdata.data`:
```javascript
{
	params: { id: '1' },     // params for dynamic routes, e.g. /test/{id}
	query: { msg: 'Hello' }, // parsed query string, e.g. /test/1?msg=Hello
	body: { test: 'OK' },    // object if json requests otherwise string
	session: {},			 // sesion data
	user: {},				 // user
	files: []				 // files
}
```

See documentation for flags [here](https://docs.totaljs.com/latest/en.html#api~HttpRouteOptionsFlags~unauthorize)
Method flags are set automatically e.g. `get, post, put or delete`

`id:ROUTE_ID` flag cannot be used since it's already used by this component internally
