# Dashboard Group Analytics (NOT COMPLETE)

Creates a group analytics automatically according a value and group. The value must be a `Number` and group must be a `String`. The output is `Object`:

```javascript
{
	Audi: {
		count: 4,          // {Number} count of analyzed values in the hour
		decimals: 0,       // {Number} count of decimals
		format: '{0}x',    // {String} custom defined format, "{0}" will be a value
		period: 'hourly'   // {String} period "hourly" or "daily"
		previous: 45,      // {Number} previous calculated value
		raw: 50,           // {Number} last raw value
		type: 'sum',       // {String} type of analytics
		value: 50,         // {Number} last calculated value
	},
	BMW: {
		count: 2,          // {Number} count of analyzed values in the hour
		decimals: 0,       // {Number} count of decimals
		format: '{0}x',    // {String} custom defined format, "{0}" will be a value
		period: 'hourly'   // {String} period "hourly" or "daily"
		previous: 15,      // {Number} previous calculated value
		raw: 30,           // {Number} last raw value
		type: 'sum',       // {String} type of analytics
		value: 30,         // {Number} last calculated value
	}
}
```