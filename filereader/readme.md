# File Reader

This component reads a file from file system.

## Input
If incomming object has a path property then filename option is ignored.

Example of incomming object
\`\`\`javascript
{
	path: '/public/robots.txt',
	type: 'text', // optional, default text
	encoding: 'utf8' // optional, default utf8
}
\`\`\`
