# Total.js Flow Components

This repository contains all __Total.js Flow components__.

__Requirements__:

- install Node.js platform +v10
- install Total.js framework `$ npm install total4`
- important __Flow 6.0__

## Creating own components

- clone an existing component
- keep unique identificators
- each component has to contain a test file `YOURCOMPONENTNAME-run.js`
- keep readme 1:1 with readme in the component declaration

## How to install a component to my Total.js Flow?

- choose your component from this repository
- upload `componentname.js` (via database icon in designer)
- don't upload `readme.md` and `componentname-run.js`

---

## Component API

- __IMPORTANT__: `exports.id` can contain `a-z` `0-9` chars only.

```javascript
// {String}, IMPORTANT a component version
exports.version = '0.0.1';

// {String}, IMPORTANT (lower case without diacritics)
exports.id = 'component';

// {String}, optional (default: "component name")
exports.title = 'A component name (for human)';

// {String}, optional (default: "#656D78")
exports.color = '#656D78'; // use darker colors because the font color is "white"

// {Boolean}, optional (default: false)
exports.click = true;

// {Number}, optional (default: 0)
// +v3.0.0
exports.input = 0;

// or {Array of Colors}, input will have 2 inputs (red and blue)
// +v3.0.0
exports.input = ['red', 'blue'];

// {Number}, optional (default: 0)
exports.output = 1;

// or {Array of Colors}, output will have 2 outputs (red and blue)
exports.output = ['red', 'blue'];

// {String}, optional (default: "Common")
exports.group = 'Common';

// {String}, optional (default: "Unknown")
exports.author = 'Peter Širka';

// {String}, optional (default: "")
// Font-Awesome icon without "fa-"
exports.icon = 'home';

// {String or Object}, optional (default: undefined)
exports.status = 'DEFAULT STATUS TEXT';
// or
exports.status = { text: 'DEFAULT STATUS TEXT', color: 'red' };

// {String Array}
// optional (default: undefined), NPM dependencies
exports.npm = ['sqlagent', 'mqtt'];

// {Object}, optional (default "undefined")
// Default options for new and existing instances
exports.options = { enabled: true };

// Disables data cloning
exports.cloning = false;

// {Boolean}, optional (default: true)
// +v4.0.0
// hides stats under component box in designer UI
exports.traffic = false;

// {String}, optional (format: 'yyyy-MM-dd HH:mm')
// +v4.0.0
// Updated date
exports.dateupdated = '2017-17-10';

exports.install = function(component) {

	// =====================
	// DELEGATES
	// =====================

	// A close delegate (optional)
	// - "callback" argument must be executed!
	component.close = function(callback) {
		// This instance will be killed.
		// use this if some asyncronous work needs to be done
		// alternatively use component.on('close',...
	};


	// =====================
	// EVENTS
	// =====================

	component.on('click', function() {
		// optional
		// the component was clicked on in the designer
		// usefull for enabling/disabling some behavior or triggering some actions
	});

	component.on('data', function(message) {

		// RAW DATA
		// returns {Object}
		message.data;

		// Write value to data repository
		// returns {Message}
		message.set('key', 'value');

		// Read value from data repository
		// returns {Object}
		message.get('key');

		// Remove value from data repository
		// returns {Message}
		message.rem('key');

		// {Object Array} Array of all components the message has passed through (previous components)
		message.tracking;

		// {Object} Parent component (first component which started the flow)
		message.parent;

		// {Boolean} Is completed?
		message.completed;

		// {DateTime}
		message.begin;

		// How can I modify data?
		message.data = { newdata: true };

		// send this message :-)
		component.send(message);
	});

	component.on('<input-number>', function(message) {
		// message as specified above in 'data' event
		// input 0 to event '0' and so on
	});

	component.on('options', function(new_options, old_options) {
		// optional
		// options have changed in the designer
		// instance.options holds the new_options already
	});

	component.on('variables', function(variables) {
		// +v3.0.0
		// optional
		// global variables have been changed
		// instance.variable(key)
	});

	component.on('close', function() {
		// optional
		// This instance will be killed
	});

	component.on('reinit', function() {
		// optional
		// Designer has been updated, but this instance still persists
		// This instance can have new connections.
	});

	component.on('signal', function(data, parent) {
		// optional
		// Captured signal
		// @data {Object} - optional, can be "null", or "undefined"
		// @parent {Component} - a component which created this signal
	});

	component.on('service', function(counter) {
		// optional
		// Service called each 1 minute
	});

	// =====================
	// METHODS
	// =====================

	component.status(message, [color]);
	// Sends a status to designer
	// @message: {String/Object} - string will be formatted as markdown and object as JSON
	// color: {String} - "black" (default: "gray")

	component.debug(message, [style]);
	// Sends a debug message
	// @message: {String/Object} - string will be formatted as markdown and object as JSON
	// style: {String} - "info", "warning", "error" (default: "info")

	component.hasConnection(index);
	// Calculates connections
	// @index: {Number}
	// returns {Number}

	var message = component.send([index], data);
	message.set('repositorykey', 'value');
	console.log(message.get('repositorykey'));
	// Sends data
	// @index: {Number} - optional, the output index (otherwise all outputs)
	// @data: {String/Object}
	// returns Message;

	var message = component.send2([index], data);
	if (message) {
		// message will be sent
	} else {
		// no connections
	}
	// +v3.0.0
	// Alias for component.send() but with a check of connections

	component.set(key, value);
	// Writes a value to a private key-value store (data are stored on HDD)
	// @key {String}
	// @value {Object}
	// returns {Component}

	component.get(key);
	// Reads a value from a private key-value store (data are stored on HDD)
	// @key {String}
	// returns {Object}

	component.make(data);
	// Creates a new FlowData/Message instance.
	// @data {Object}
	// returns {Message}

	component.rem(key);
	// Removes a value from a private key-value store (data are stored on HDD)
	// @key {String}
	// returns {Component}

	component.variable(key);
	// +v3.0.0
	// Reads a value from global variables
	// @key {String}
	// returns {Object}

	component.signal([index], [data]);
	// Sends a signal to first connection (it emits "signal" event in target connection)
	// @index {Number} - optional, an output index (default: "undefined" --> all connections)
	// @data {Object} - optional, an additional data
	// returns {Component}

	component.click();
	// Performs click event.
	// returns {Component}

	component.log([a], [b], [c], [d]);
	// Writes some info into the log file
	// returns {Component}

	component.error(err, [parent|response|component]);
	// Creates error
	// returns {Component}

	component.save();
	// Saves current options, useful when options are changed internally. Options from settings form are saved automatically
	// returns {Component}

	component.reconfig();
	// If the component options changes on the server (not by recieving new options from designer) then use this to update options in designer

	// =====================
	// PROPERTIES
	// =====================

	component.custom;
	// {Object} - empty object for custom variables and methods

	component.name;
	// {String} - readonly, a component name (USER-DEFINED)

	component.reference;
	// {String} - readonly, a component reference (USER-DEFINED)

	component.options;
	// {Object} - readonly, custom settings

	component.state;
	// {Object} - readonly, latest state

	component.connections;
	// {Object} - readonly, all connections
};

exports.uninstall = function() {
	// OPTIONAL
};
```

## Message

When is the message instance created?

```javascript
// FIRST CASE:
component.on('data', function(message) {
	// Properties:
	message.id;               // {Number} A message identificator
	message.index;            // {Number} An input number
	message.begin;            // {Date} when it started
	message.data;             // {Anything} user defined data
	message.completed;        // {Boolean} is sending completed?
	message.tracking;         // {Array of Instances} all instances in order which they modified data
	message.parent;           // {Component} a parent instance

	// Methods (private message repository):
	message.set(key, value);  // Sets a key-value to message repository (doesn't modify data)
	message.get(key);         // Gets a key-value (doesn't read data from "data")
	message.rem(key);         // Removes a key-value (doesn't read data from "data")
	message.rewrite(data);    // Rewrites the current with new
});

// SECOND CASE
var message = component.send('YOUR-DATA-TO-CHILD-CONNECTIONS');
```

## Multiple inputs

```javascript
// data from all inputs go to 'data' event
component.on('data', function(message) {
	// message as specified above
	message.index; // Input number
});

// data from specific input go also to the corresponding event -> input 0 to event '0'
component.on('0', function(message) {
	// message as specified above
});
```

---

## Client-Side

### Events

```javascript
ON('open.componentname', function(component, options) {
	// Settings will be open
});

ON('save.componentname', function(component, options) {
	// Settings will be save
});

ON('select.componentname', function(component) {
	// A component has been selected in designer.
});

ON('click.componentname', function(component) {
	// Performed "click"
});

ON('add.componentname', function(component) {
	// A component has been added.
});

ON('rem.componentname', function(component) {
	// A component has been removed.
});

ON('apply', function() {
	// Designer will be sent to server and then will be applied
});
```

### Good to know

__How to change count of outputs/inputs dynamically?__

`v3.0.0` This is possible on client-side only.

```javascript
ON('save.componentname', function(component, options) {

	component.output = 5;
	// component.input = 3;

	// or
	component.output = ['green', 'red', 'blue'];
	// component.input = ['green', 'red', 'blue'];

	// or set output to default
	component.output = null;
	// component.input = null;
});
```

### Components: jComponent +v17.0.0

Bellow jComponents can be used in `Settings form`:

- autocomplete (declared `body`)
- binder (declared in `body`)
- calendar (declared in `body`)
- checkbox
- checkboxlist
- codemirror
- colorpicker (declared in `body`)
- confirm (declared in `body`)
- contextmenu (declared in `body`)
- datepicker (declared in `body`)
- directory
- dragdropfiles
- dropdown
- dropdowncheckbox
- error
- exec (declared in `body`)
- filereader
- form
- importer
- input
- keyvalue
- loading
- menu (declared in `body`)
- timepicker (declared in `body`)
- message (declared in `body`)
- multioptions
- nosqlcounter
- repeater
- repeater-group
- shorcuts (declared in `body`)
- search
- selectbox
- textbox
- textboxlist
- validation
- visible

__References:__

- [Componentator.com](https://componentator.com/)
- [jComponents on Github](https://github.com/totaljs/jComponent)


---

## Support

Total.js Support is applied for components which are from developers: __Peter Širka__ and __Martin Smola__. Do you want own components? [Contact us](https://www.totaljs.com/contact/).

## Contact

- contact form <https://www.totaljs.com/contact/>
- <info@totaljs.com>
