exports.id = 'split';
exports.title = 'Split';
exports.group = 'Common';
exports.color = '#656D78';
exports.input = true;
exports.output = 1;
exports.options = {};
exports.author = 'Jiří Travěnec';
exports.icon = 'compress';
exports.readme = `# Split

This component iterates over the received data and sends every item separately.`;

exports.install = function(instance) {
	instance.on('data', function (response) {
		var data = response.data;
		if (data instanceof Array) {
			for (var i = 0; i < data.length; i++) {
				if (data[i] != null)
					instance.send2(data[i]);
			}
		}
	});
};