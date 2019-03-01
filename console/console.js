exports.id = 'console';
exports.title = 'Console';
exports.group = 'Inputs';
exports.color = '#917DD6';
exports.output = ['#3BAFDA', '#F6BB42', '#DA4453'];
exports.click = true;
exports.author = 'Peter Širka';
exports.icon = 'terminal';
exports.version = '1.0.0';

exports.readme = `# Console

This component attachs into the Node.js \`console\` instance. Response is a \`string\` value, outputs:

- \`blue\` is from \`console.log()\` and \`console.info()\`
- \`orange\` is from \`console.warn()\`
- \`red\` is from \`console.error()\``;

var components = [];
var backup;

function attach() {

	backup && detach();
	backup = {};
	backup.log = console.log;
	backup.error = console.error;
	backup.warn = console.warn;
	backup.info = console.info;

	var serialize = function(obj) {
		var msg = '';
		for (var i = 0; i < obj.length; i++) {
			var arg = obj[i];
			var val;

			if (arg === undefined)
				val = 'undefined';
			else if (arg === null)
				val = 'null';
			else if (typeof(arg) === 'object' || arg instanceof Array)
				val = JSON.stringify(arg);
			else
				val = arg.toString();

			msg += (msg ? ' ' : '') + val;
		}

		return msg;
	};

	console.log = function() {
		backup.log.apply(console, arguments);
		var msg = serialize(arguments);
		for (var i = 0, length = components.length; i < length; i++)
			components[i].send2(0, msg);
	};

	console.error = function() {
		backup.error.apply(console, arguments);
		var msg = serialize(arguments);
		for (var i = 0, length = components.length; i < length; i++)
			components[i].send2(2, msg);
	};

	console.warn = function() {
		backup.warn.apply(console, arguments);
		var msg = serialize(arguments);
		for (var i = 0, length = components.length; i < length; i++)
			components[i].send2(1, msg);
	};

	console.info = function() {
		backup.info.apply(console, arguments);
		var msg = serialize(arguments);
		for (var i = 0, length = components.length; i < length; i++)
			components[i].send2(0, msg);
	};
}

function detach() {
	if (backup) {
		console.log = backup.log;
		console.warn = backup.warn;
		console.info = backup.info;
		console.error = backup.error;
		backup = null;
	}
}

exports.install = function(instance) {
	!backup && attach();
	components.push(instance);
	instance.on('close', function() {
		components.splice(components.indexOf(instance), 1);
		!components.length && detach();
	});
};

exports.uninstall = function() {
	detach();
	components = null;
	backup = null;
};
