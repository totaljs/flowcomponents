# Data transformation

This component tries to transform `string` to `object` with except "custom parser".

__Custom function__:

```javascript
// value {Object} contains received data
// next(newValue) returns transformed value (IMPORTANT)
// Example:

var lines = value.split('\n');
var obj = {};
obj.name = lines[0];
obj.price = lines[1];

next(obj);
```