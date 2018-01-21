exports.id = 'restinterpreter';
exports.title = 'Interpreter';
exports.group = 'REST';
exports.color = '#666D77';
exports.input = false;
exports.output = 1;
exports.author = 'Peter Širka';
exports.icon = 'globe';
exports.version = '1.0.0';
exports.options = { channel: '' };
exports.cloning = false;
exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="channel" data-jc-config="required:true;maxlength:40;placeholder:@(e.g. import)">@(Channel name)</div>
			<div class="help">@(Type a channel name.)</div>
		</div>
	</div>
</div>`;

exports.readme = `# REST: Interpreter

The component is an input component and it listens on a specific \`channel\`. The component can interpret some events or behaviour of Total.js application from code directly.

---

This component registers a global method \`INTERPRET(channel, data)\` and developer needs to execute this method directly in the code.`;

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

			instance.status('Channel: ' + channel);
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