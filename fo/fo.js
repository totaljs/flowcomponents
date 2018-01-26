exports.id = 'fo';
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
		if (data.repository.fifo) {
			data.repository.fifo.custom.done();
			instance.send2(data);
		}
	});
};