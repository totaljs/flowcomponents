exports.id = 'commandercommand';
exports.title = 'Commander: Commands';
exports.group = 'Commander';
exports.color = '#798099';
exports.icon = 'arrow-right';
exports.input = false;
exports.output = ['#DA4453', '#3BAFDA'];
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.readme = `# Commander: Commands

This component can process received commands from Commander application.

__Data__:
- \`data.type\` can be \`command\` or \`option\`
- \`data.body\` contains a body of message \`{String}\`
- \`data.user\` contains an user instance \`{Object}\`
- \`data.id\` contains an identificator for options/message

__Outputs__:
- \`red\` is a basic command
- \`blue\` is an option from options`;

exports.install = function(instance) {

	function process_command(client, body, id) {
		var obj = {};
		obj.body = body;
		obj.id = id;
		obj.type = 'command';
		obj.user = client.user;
		var data = instance.make(obj);
		data.set('client', client);
		instance.send2(0, data);
	}

	function process_option(client, body, id) {
		var obj = {};
		obj.body = body;
		obj.id = id;
		obj.type = 'option';
		obj.user = client.user;
		var data = instance.make(obj);
		data.set('client', client);
		instance.send2(1, data);
	}

	ON('commander.command', process_command);
	ON('commander.option', process_option);

	instance.on('close', function() {
		OFF('commander.command', process_command);
		OFF('commander.option', process_option);
	});
};