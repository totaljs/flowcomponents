exports.id = 'fo';
exports.version = '1.0.0';
exports.title = 'First Out';
exports.group = 'Common';
exports.color = '#F6BB42';
exports.input = 1;
exports.output = 1;
exports.author = 'Peter Širka';
exports.icon = 'minus';
exports.readme = `# First Out

This component is a part of FI__FO__ stack. __IMPORTANT__ message can't changed repository because this component needs a reference to \`First In\` component.`;

exports.install = function(instance) {
	instance.on('data', function(data) {
		var fifo = data.repository.fifo;
		if (fifo && fifo.instance) {
			fifo.instance.custom.done(fifo.index);
			data.repository.fifo = undefined;
			instance.send2(data);
		}
	});
};