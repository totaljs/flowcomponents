exports.id = 'fi';
exports.title = 'First In';
exports.group = 'Common';
exports.color = '#F6BB42';
exports.input = 1;
exports.output = 1;
exports.author = 'Peter Širka';
exports.icon = 'plus';
exports.click = true;
exports.readme = `# First In

This component is a part of __FI__FO stack. __IMPORTANT__ message can't changed repository because it contains a reference to this component. Click sends next data.`;

exports.install = function(instance) {

	var stack = [];
	var wait = false;

	instance.custom.send = function() {

		instance.custom.status();

		if (wait || !stack.length)
			return;

		var data = stack.shift();
		if (data) {
			wait = true;
			data.repository.fifo = instance;
			instance.send2(data);
		}
	};

	instance.custom.done = function() {
		wait = false;
		instance.custom.send();
	};

	instance.custom.status = function() {
		setTimeout2(instance.id, function() {
			if (stack.length)
				instance.status(stack.length + ' items in stack', 'red');
			else
				instance.status('');
		}, 1000, 5);
	};

	instance.on('click', function() {
		wait = false;
		instance.custom.send();
	});

	instance.on('data', function(data) {
		stack.push(data);
		instance.custom.send();
	});

};