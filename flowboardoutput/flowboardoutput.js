exports.id = 'flowboardoutput';
exports.title = 'Output';
exports.group = 'Flowboard';
exports.color = '#AC92EC';
exports.icon = 'fa-commenting';
exports.input = true;
exports.output = 0;
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.readme = `# Flowboard: Output

This component shows data as they are. Output can be __HTML__ and can contain __Font-Awesome icons__, colors, etc..`;

exports.install = function(instance) {

	instance.reconfigure = function() {
		instance.status(global.FLOWBOARD ? '' : 'Flowboard not found.', global.FLOWBOARD ? null : 'red');
	};

	instance.on('data', function(response) {
		instance.set('state', response.data);
		instance.flowboard && instance.flowboard('laststate', response.data);
	});

	instance.on('options', instance.reconfigure);
	instance.reconfigure();

	instance.on('flowboard', function(type, data) {
		switch (type) {
			case 'laststate':
				var data = instance.get('state');
				data !== undefined && instance.flowboard && instance.flowboard('laststate', data);
				break;
		}
	});
};