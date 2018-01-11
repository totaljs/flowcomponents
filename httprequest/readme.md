# Request

This component creates a request with received data.

__Response:__

```javascript
{
	data: String,
	headers: Object,
	status: Number,
	host: String
}
```

__Dynamic arguments__:
Are performed via FlowData repository and can be used for URL address or for custom headers/cookies/auth. Use `repository` component for creating of dynamic arguments. Examples:

- url address can be in this form `https://hostname.com/{key}/`
- headers values e.g. `{token}`
- cookies values e.g. `{token}`