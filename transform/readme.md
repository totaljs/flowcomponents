# Data transformation

This component tries to transform `string` to `object`.

__Custom function__:

```javascript
// value {String} contains received data
// next(newvalue) returns transformed value (IMPORTANT)
// Example:

var lines = value.split('\n');
var obj = {};
obj.name = lines[0];
obj.price = lines[1];

next(obj);
```