exports.id = 'childprocess_exec';
exports.title = 'Child Process: Exec';
exports.group = 'Common';
exports.color = '#37BC9B';
exports.version = '1.0.1';
exports.input = 1;
exports.output = ['green | stdout', 'red | stderr'];
exports.author = 'Peter Širka';
exports.icon = 'calculator';
exports.options = { filename: '', arg: [], convert: 'buffer', timeout: 5000 };


exports.html = `<div class="padding">
	<div data---="textbox__filename__required:true" class="m">@(Filename)</div>
	<div class="help m">@(The component will replace <code>{0}</code> with received data.)</div>
</div>`;

exports.readme = `# Child Process

Executes a child process.`;

exports.install = function(instance) {

	var Exec = require('child_process').exec;
	var isformat = false;

	instance.on('data', function(response) {
		var opt = instance.options;
		Exec(isformat ? opt.filename.format(response.data) : opt.filename, function(err, stdout, stderr) {
			if (err) {
				instance.throw(err);
			} else {
				stdout && instance.send(0, stdout);
				stderr && instance.send(1, stderr);
			}
		});
	});

	instance.convertsend = function(index, data) {
		switch (instance.options.convert) {
			case 'buffer':
				break;
			case 'string':
				data = data.toString('utf8');
				break;
			case 'number':
				data = +data.toString('utf8').trim();
				if (isNaN(data))
					return;
				break;
			case 'boolean':
				data = data.toString('utf8').trim() === 'true';
				break;
			case 'base64':
				data = data.toString('base64');
				break;
			case 'hex':
				data = data.toString('hex');
				break;
		}

		instance.send(index, data);
	};

	instance.reconfigure = function() {
		var options = instance.options;
		isformat = false;

		if (options.arg) {
			for (var i = 0; i < options.arg.length; i++) {
				var is = options.arg[i].indexOf('{0}') !== -1;
				if (is)
					isformat = true;
			}
		}

		isformat = options.filename.indexOf('{0}') !== -1;
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};