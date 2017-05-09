# Total.js Messenger: Users

This component evaluates user data when the user is online (green output) / offline (red output).

- output contains a raw data of the user
- supports websocket client via `message.get('client')`
- supports websocket controller via `message.get('controller')`

__Data Example__:

```javascript
{
	id: 'IDENTIFICATOR'
	name: 'Peter Širka',
	online: true,
	datecreated: Date,
	datelogged: Date,
	position: 'Web Developer',
	department: 'IT department',
	picture: 'IDENTIFICATOR', // needs to be formated like this /photos/{ID}.jpg
	linker: 'peter-sirka',
	email: 'petersirka@gmail.com',
	status: 'My work is my hobby',
	notifications: true,
	unreadcount: 3, // how many messages is unread?
	unread: {}, // key === ID
	channels: {}, // key === ID
	lastmessages: {}, // key === ID of user or channel
	mobile: false, // is from mobile device?
	sa: true // is super admin?
}
```