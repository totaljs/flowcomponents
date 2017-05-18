exports.id = 'flowboardoutput';
exports.title = 'Flowboard: Output';
exports.group = 'Flowbard';
exports.color = '#AC92EC';
exports.icon = 'fa-commenting';
exports.input = true;
exports.output = 0;
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.readme = `# Flowbard: Output

This component shows data as they are. Output can be __HTML__ and can contain __Font-Awesome icons__, colors, etc..`;

exports.install = function(instance) {

	instance.custom.reconfigure = function() {
		instance.status(global.FLOWBOARD ? '' : 'Flowbard not found.', global.FLOWBOARD ? null : 'red');
	};

	instance.on('data', function(response) {
		instance.set('state', response.data);
		instance.custom.send(response.data);
	});

	instance.custom.send = function(data, category) {
		global.FLOWBOARD &&	global.FLOWBOARD.send(instance, data, category);
	};

	instance.on('options', instance.custom.reconfigure);
	instance.custom.reconfigure();
	instance.custom.current = function() {
		return instance.get('state');
	};
};