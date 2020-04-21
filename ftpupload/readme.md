# FTP Upload

__INPUT__:


```javascript
{
	// Optional, default is FTP used in configuration
	url: 'FTP address with credentials',

	// SINGLE UPLOAD
	filename: 'filename to upload (absoute path)',
	target: 'FTP path',

	// OR MULTIPLE UPLOAD
	files: [
		{
			filename: '',
			target: ''
		}
	]
}
```

__OUTPUT__:

```javascript
{ success: true }
```