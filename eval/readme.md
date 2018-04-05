# Code

This component executes custom JavaScript code as it is and it doesn't contain any secure scope.

```javascript
// value {Object} contains received data
// send(outputIndex, newValue) sends a new value
// instance {Object} a current component instance
// flowdata {Object} a current flowdata
// repository {Object} a current repository of flowdata
// Example:

// send() can be execute multiple times
send(0, value);
```