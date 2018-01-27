exports.id = 'duration';
exports.title = 'Duration';
exports.group = 'Time';
exports.color = '#656D78';
exports.output = 1;
exports.input = 2;
exports.cloning = false;
exports.author = 'Peter Širka';
exports.icon = 'clock-o';
exports.version = '1.0.0';

exports.readme = `# Duration

This component measures a duration of Flow processing for same message id.

- first input: starting component
- second input: final component
- output contains \`Number\` of __seconds__`;

exports.install = function(instance) {

	var keys = {};

	instance.on('0', function(response) {
		if (keys[response.id]) {
			var sec = ((new Date() - keys[response.id]) / 1000).floor(2);
			instance.send2(sec);
			instance.status(sec + ' sec.');
			delete keys[response.id];
		} else
			keys[response.id] = new Date();
	});

	instance.on('1', function(response) {
		if (keys[response.id]) {
			var sec = ((new Date() - keys[response.id]) / 1000).floor(2);
			instance.send2(sec);
			instance.status(sec + ' sec.');
			delete keys[response.id];
		} else
			keys[response.id] = new Date();
	});

	instance.on('close', () => keys = null);
};