exports.id = 'restinterpreter';
exports.title = 'Interpreter';
exports.group = 'REST';
exports.color = '#B0331B';
exports.input = false;
exports.output = 1;
exports.author = 'Peter Širka';
exports.icon = 'globe';
exports.version = '1.0.0';
exports.options = { channel: '' };
exports.html = '';

exports.readme = `# REST: Interpreter

The component is input component and it listens on a specific \`channel\`. It registers a global method \`INTERPRET(channel, data)\` and developer needs to execute this method directly in the code. The component can interpret some events or behaviour of Total.js application from code directly.`;

var channels = {};

global.INTERPRET = function(channel, data) {
	if (channels[channel]) {
		for (var i = 0, length = channels[channel].length; i < length; i++)
			channels[channel][i].send2(data);
	}
};

exports.install = function(instance) {

	var channel = null;
	var remove = function(name) {
		var channel = channels[name];
		if (channel) {
			var index = channel.indexOf(instance);
			if (index !== -1)
				channel.splice(index, 1);
			if (!channel.length)
				delete channels[instance.options.channel];
		}
	};

	instance.on('close', function() {
		channel && remove(channel);
	});

	instance.reconfigure = function() {
		channel && instance.options.channel !== channel && remove(channel);
		channel = instance.options.channel;
		if (channel) {
			if (channels[channel]) {
				if (channels[channel].indexOf(instance) === -1)
					channels[channel].push(instance);
			} else
				channels[channel] = [instance];
			instance.status('Listen: ' + channel);
		} else
			instance.status('Not configured', 'red');
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};

exports.uninstall = function() {
	channels = null;
	delete global.INTERPRET;
};