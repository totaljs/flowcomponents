exports.id = 'flowboardsocket';
exports.title = 'Flowboard: Socket';
exports.group = 'Flowbard';
exports.color = '#AC92EC';
exports.icon = 'fa-plug';
exports.input = true;
exports.output = 1;
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.readme = `# Flowbard: Socket

- input \`0 = OFF\` and \`1 = ON\`
- output \`0 = OFF\` and \`1 = ON\``;

exports.install = function(instance) {

	var arr = ['Off', 'On'];

	instance.custom.reconfigure = function() {
		instance.status(global.FLOWBOARD ? arr[instance.get('state') || 0] : 'Flowbard not found.', global.FLOWBOARD ? null : 'red');
	};

	instance.on('data', function(response) {
		instance.set('state', response.data);
		instance.flowboard_send(response.data);
		instance.status(arr[response.data]);
	});

	instance.on('options', instance.custom.reconfigure);
	instance.custom.reconfigure();

	// Flowboard methods:

	instance.flowboard_send = function(data, category) {
		global.FLOWBOARD &&	global.FLOWBOARD.send(instance, data, category);
	};

	instance.flowboard_process = function(message) {
		instance.send(message.value);
		instance.status(arr[message.value]);
		instance.flowboard_send(message.value);
	};

	instance.flowboard_laststate = function() {
		return instance.get('state');
	};
};