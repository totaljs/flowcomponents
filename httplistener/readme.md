# HTTP Listener

Can capture all received requests.

```javascript
response.body;      // Request body (POST/PUT/DELETE)
response.files;     // Uploaded files
response.id;        // Record ID (if exists)
response.ip;        // Current IP
response.method;    // String
response.path;      // Splitted path
response.query;     // Query string arguments
response.session;   // Session instance (if exists)
response.url;       // Current URL
response.user;      // User instance (if exists)
response.file;      // Is a static file?
response.extension; // File extension
```