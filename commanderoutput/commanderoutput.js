exports.id = 'commanderoutput';
exports.title = 'Commander: Output';
exports.group = 'Commander';
exports.color = '#AC92EC';
exports.icon = 'arrow-left';
exports.input = true;
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.readme = `# Commander: Output

This component can send a message in \`html\` format back to the sender of command. The component expects \`{String}\` value on the input.`;

exports.install = function(instance) {
	instance.on('data', function(response) {
		if (response.data) {
			var client = response.get('client');
			client && client.commander_message && client.commander_message(response.data);
		}
	});
};