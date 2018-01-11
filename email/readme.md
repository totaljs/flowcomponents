# Email sender

You need to configure this component.

__Outputs__:
- `green` message has been sent successfully
- `red` an error while sending

__Dynamic arguments__:
Are performed via FlowData repository and can be used for subject, from/to addresses or attachments. Use `repository` component for creating of dynamic arguments. Examples:

- subject `{name}`
- from address e.g. `{from}`
- to address e.g. `{to}`

__Attachments__:
`FlowData` repository needs to contain `attachments` key with user-defined array in the form:

```javascript
[
	{ filename: '/absolute/path/to/some/file.pdf', name: 'report.pdf' },
	{ filename: '/or/absolute/path/to/package.zip' }
]```