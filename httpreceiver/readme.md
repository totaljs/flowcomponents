# HTTP Receiver

This component can receive all data from this web application. Choose which route data you want to receive and everything will work automatically. __Response__ is an object:

```javascript
response.body;      // (Object) Request body (POST/PUT/DELETE)
response.files;     // (Object Array) Uploaded files
response.id;        // (String/Number) Record ID (if exists)
response.ip;        // (String) Current IP
response.method;    // (String) HTTP method
response.path;      // (Array) Splitted path
response.query;     // (Object) Query string arguments
response.session;   // (Object) Session instance (if exists)
response.url;       // (String) Current URL
response.user;      // (Object) User instance (if exists)
```