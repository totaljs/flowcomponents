# Total.js Messenger: Message

This component evaluates data when is created a new message in Total.js messenger.

- message repository contains `client` and `controller` instance,
- output contains a raw data of message:
```javascript
{
	body: 'MARKDOWN',
	type: 'channel', // or "user"
	target: { id: 'String', name: 'String', linker: 'String' } // "channel" or "user" instance
	from: { id: 'String', name: 'String', email: 'String', picture: 'String', ... },
	mobile: false, // Is message from a mobile device?
	robot: false, // Is message from a robot? (A message created manually on the server)
	edited: false, // Is message edited?
	users: ['IDUSER A', 'IDUSER B', '...'], // Users tagged in the message
	files: [{ name: 'My photo.jpg', url: '/download/3498349839843934.jpg' }] // Uploaded files
}
```