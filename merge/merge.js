exports.id = 'merge';
exports.title = 'Merge';
exports.group = 'Common';
exports.color = '#656D78';
exports.input = true;
exports.click = true;
exports.output = 1;
exports.version = '1.0.0';
exports.options = { count: 5, id: false, timeout: 0 };
exports.author = 'Peter Širka';
exports.icon = 'compress';

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="count" data-jc-config="required:true;placeholder:5;type:number;increment:true;align:center">@(Count)</div>
			<div class="help">@(Count of messages per queue)</div>
		</div>
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="timeout" data-jc-config="placeholder:5;type:number;increment:true;align:center">@(Timeout in ms)</div>
			<div class="help">@(0 means "timeout is disabled")</div>
		</div>
	</div>
	<div data-jc="checkbox" data-jc-path="id">@(Merge data by same FlowData identificator)</div>
</div>`;

exports.readme = `# Merge

This component merges all received data into the \`Array\`. Clicking on the button will empty the queue.`;

exports.install = function(instance) {

	var data = {};
	var timeouts = {};
	var pending = 0;

	instance.custom.flush = function(id, status) {

		if (instance.options.timeout && timeouts[id]) {
			clearTimeout(timeouts[id]);
			delete timeouts[id];
		}

		var arr = data[id];
		if (!arr || !arr.length)
			return;

		pending -= arr.length;

		if (instance.options.id) {
			var msg = instance.make(arr);
			msg.id = id;
			instance.send2(msg);
			delete data[id];
		} else {
			instance.send2(arr);
			data[id] = [];
		}

		status && instance.custom.status();
	};

	instance.on('data', function(response) {

		var id = instance.options.id ? response.id : 1;

		if (data[id])
			data[id].push(response.data);
		else
			data[id] = [response.data];

		pending++;

		if (data[id].length >= instance.options.count) {
			instance.custom.flush(id);
		} else if (instance.options.timeout) {
			clearTimeout(timeouts[id]);
			timeouts[id] = setTimeout(instance.custom.flush, instance.options.timeout, id, true);
		}

		instance.custom.status();
	});

	instance.custom.status = function() {
		setTimeout2(instance.id, () => pending ? instance.status(pending + 'x pending', 'red') : instance.status(''), 500, 10);
	};

	instance.on('click', function() {

		var keys = Object.keys(data);
		for (var i = 0, length = keys.length; i < length; i++) {
			var id = keys[i];
			instance.custom.flush(id);
			if (instance.options.timeout && timeouts[id]) {
				clearTimeout(timeouts[id]);
				delete timeouts[id];
			}
		}

		setTimeout2(instance.id, () => instance.status(''), 500);
	});
};