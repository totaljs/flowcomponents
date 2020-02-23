exports.id = 'fi';
exports.version = '1.1.0';
exports.title = 'First In';
exports.group = 'Common';
exports.color = '#F6BB42';
exports.input = 1;
exports.output = 1;
exports.author = 'Peter Širka';
exports.icon = 'plus';
exports.options = { outputs: 1, timeout: '1 minute' };
exports.click = true;
exports.readme = `# First In

This component is a part of __FI__FO stack. __IMPORTANT__ message can't changed repository because it contains a reference to this component. \`Click\` clears queue.`;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3">
			<div data-jc="textbox" data-jc-path="outputs" data-jc-config="type:number;validation:value > 0;increment:true;maxlength:3">@(Number of outputs)</div>
			<div class="help m">@(Minimum is "1")</div>
		</div>
		<div class="col-md-3">
			<div data-jc="textbox" data-jc-path="timeout" data-jc-config="maxlength:20">@(Timeout)</div>
			<div class="help m">@(Minimum is "1 minute")</div>
		</div>
	</div>
</div>
<script>
	var fi_outputs_count;

	ON('open.fi', function(component, options) {
		fi_outputs_count = options.outputs = options.outputs || 1;
	});

	ON('save.fi', function(component, options) {
		if (fi_outputs_count !== options.outputs) {
			component.output = options.outputs || 1;
			setState(MESSAGES.apply);
		}
	});
</script>`;

exports.install = function(instance) {

	var outputs = -1;
	var locked = false;
	var stack = [];
	var free = [];
	var pending = [];

	instance.on('click', function() {

		if (locked)
			return;

		var index = 0;

		while (true) {
			var fifo = pending[index++];
			if (fifo === undefined)
				break;

			if (fifo) {
				fifo.instance.custom.done(fifo.index);
				fifo.instance = null;
			}

			index -= 1;
			pending.splice(index, 1);
			instance.end();
		}

		instance.custom.free();
		instance.custom.status();
	});

	instance.custom.free = function() {
		var options = instance.options;
		free = [];
		for (var i = 0; i < options.outputs; i++)
			free.push(i);
		outputs = free.length;
		stack = [];
	};

	instance.custom.send = function() {

		instance.custom.status();

		if (locked) {
			free.length === outputs && reconfigure();
			return;
		}

		if (!free.length || !stack.length)
			return;

		var data = stack.shift();
		if (data) {
			var index = free.shift();
			var obj = { instance: instance, index: index, ticks: new Date().add(instance.options.timeout).getTime() };
			data.repository.fifo = obj;
			pending.push(obj);
			instance.send2(index, data);
			instance.beg();
		}
	};

	instance.custom.done = function(index) {

		var i = pending.findIndex('index', index);
		if (i !== -1)
			pending.splice(i, 1);

		instance.end();
		free.push(index);
		if (locked && free.length === outputs)
			reconfigure();
		else
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

	instance.on('data', function(data) {
		stack.push(data);
		instance.custom.send();
	});

	var reconfigure = function() {
		var options = instance.options;
		free = [];
		for (var i = 0; i < options.outputs; i++)
			free.push(i);
		outputs = free.length;
		locked = false;
		instance.custom.send();
	};

	instance.on('service', function() {
		var ticks = NOW.getTime();
		var index = 0;
		while (true) {
			var fifo = pending[index++];
			if (fifo === undefined)
				break;

			if (!fifo || fifo.ticks < ticks) {

				if (fifo) {
					free.push(fifo.index);
					fifo.instance.custom.done(fifo.index);
					fifo.instance = null;
				}

				index -= 1;
				pending.splice(index, 1);
			}
		}
	});

	instance.on('options', function(options) {
		if (options.outputs.length === -1) {
			reconfigure();
		} else
			locked = true;
	});

	reconfigure();
};