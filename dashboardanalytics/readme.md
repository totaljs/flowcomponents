# Dashboard Analytics

Creates analytics automatically according a value. The value must be a number. The output is `Object`:

```javascript
{
    count: 2,          // {Number} count of analyzed values in the hour
    decimals: 0,       // {Number} count of decimals
    format: '{0} °C',  // {String} custom defined format, "{0}" will be a value
    period: 'hourly'   // {String} period "hourly" or "daily"
    previous: 15,      // {Number} previous calculated value
    raw: 32.3          // {Number} last raw value
    type: 'max',       // {String} type of analytics
    value: 32.3,       // {Number} last calculated value
}
```

This components sends to Dashboard two types of data:
- `laststate` with the last know state
- `stats` with stats