exports.id = 'merge';
exports.title = 'Merge';
exports.group = 'Common';
exports.color = '#656D78';
exports.input = true;
exports.click = true;
exports.output = 1;
exports.options = { count: 5, id: false, timeout: 0, props: [] };
exports.author = 'Peter Širka';
exports.icon = 'compress';

exports.html = `<div class="padding">
	<div data-jc="checkbox" data-jc-path="toobject">@(Merge data into object)</div>
	<br>
	<div data-jc="visible" data-jc-path="toobject" data-if="value ===false">
		<div class="row">
			<div class="col-md-3 m">
				<div data-jc="textbox" data-jc-path="count" data-required="true" data-placeholder="5" data-jc-type="number" data-increment="true" data-align="center">@(Count)</div>
				<div class="help">@(Count of messages per queue)</div>
			</div>
			<div class="col-md-3 m">
				<div data-jc="textbox" data-jc-path="timeout" data-placeholder="5" data-jc-type="number" data-increment="true" data-align="center">@(Timeout in ms)</div>
				<div class="help">@(0 means "timeout is disabled")</div>
			</div>
		</div>
		<div data-jc="checkbox" data-jc-path="id" class="m">@(Merge data by same FlowData id)</div>
	</div>
	<div data-jc="visible" data-jc-path="toobject" class="hidden">
		<div data-jc="textboxlist" data-jc-path="props" data-maxlength="50" data-placeholder="property name" data-icon="fa-list">Properties</div>
		<div class="help">@(Data comming to each of the inputs will be assign to a property from top to bottom. The first input to the first property.)</div>
	</div>
	<script>
		ON('save.merge', function(component, options) {
			if (options.toobject)
		    	if (options.props && options.props.length)
		    		component.input = options.props.length;
		    	else
		    		component.input = 0;
		    else
		    	component.input !== 1 && (component.input = 1);
		});
	</script>
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
			instance.send(msg);
			delete data[id];
		} else {
			instance.send(arr);
			data[id] = [];
		}

		status && instance.custom.status();
	};

	instance.on('data', function(response) {

		var id = instance.options.id ? response.id : 1;

		if (instance.options.toobject) {

			data[id] = data[id] || {};

			var prop = instance.options.props[response.index];
			if (!prop)
				instance.debug('No property name for current input:', response.index);
			else
				data[id][prop] = response.data;	

			instance.status(Object.keys(data[id]).join(', '), 'red');
			if (Object.keys(data[id]).length === instance.options.props.length) {
				response.data = data[id];
				instance.send(response);
				setTimeout2(instance.id, () => instance.status(''), 500, 10);
				data[id] = {};
			}

			return;
		}

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

		if (instance.options.toobject) {
			data = {};
			return;
		} else {
			var keys = Object.keys(data);
			for (var i = 0, length = keys.length; i < length; i++) {
				var id = keys[i];
				instance.custom.flush(id);
				if (instance.options.timeout && timeouts[id]) {
					clearTimeout(timeouts[id]);
					delete timeouts[id];
				}
			}			
		}

		setTimeout2(instance.id, () => instance.status(''), 500);
	});
};