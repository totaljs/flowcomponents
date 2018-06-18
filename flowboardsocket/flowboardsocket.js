exports.id = 'flowboardsocket';
exports.title = 'Socket';
exports.group = 'Flowboard';
exports.color = '#AC92EC';
exports.icon = 'fa-plug';
exports.input = true;
exports.output = 1;
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.readme = `# Flowboard: Socket

- input \`0 = OFF\` and \`1 = ON\`
- output \`0 = OFF\` and \`1 = ON\``;

exports.install = function(instance) {

	var arr = ['Off', 'On'];

	instance.reconfigure = function() {
		instance.status(global.FLOWBOARD ? arr[instance.get('state') || 0] : 'Flowboard not found.', global.FLOWBOARD ? null : 'red');
	};

	instance.on('data', function(response) {
		instance.set('state', response.data);
		instance.flowboard && instance.flowboard('laststate', response.data);
		instance.status(arr[response.data]);
	});

	instance.on('options', instance.reconfigure);
	instance.reconfigure();

	instance.on('flowboard', function(type, data) {
		switch (type) {

			case 'laststate':
				// Sends last know state
				var state = instance.get('state');
				state !== undefined && instance.flowboard && instance.flowboard('laststate', state);
				break;

			case 'switch':

				// data === {Number}
				// 0: off, 1: on

				// Sends data to device
				instance.send2(data);

				// Change status and last know state
				instance.status(arr[data]);
				instance.set('state', data);

				// Send the last state to Flowboard
				instance.flowboard && instance.flowboard('laststate', data);
				break;
		}
	});
};
