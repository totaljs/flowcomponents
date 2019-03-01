exports.id = 'mergetoobject';
exports.title = 'Merge to object';
exports.group = 'Common';
exports.color = '#656D78';
exports.version = '1.0.0';
exports.input = 2;
exports.click = true;
exports.output = 1;
exports.options = { props: [], id: true };
exports.author = 'Martin Smola';
exports.icon = 'compress';

exports.html = `<div class="padding">
	<div data-jc="textboxlist" data-jc-path="props" data-jc-config="maxlength:50;placeholder:@(Type a property name and press enter);icon:list">@(Properties)</div>
	<div class="help">@(Data comming to each of the inputs will be assign to a property from top to bottom. The first input to the first property.)</div>
	<hr />
	<div data-jc="checkbox" data-jc-path="id" class="m">@(Merge data by same FlowData identificator)</div>
	<script>
		ON('save.mergetoobject', function(component, options) {
			if (options.props && options.props.length)
				component.input = options.props.length;
			else
				component.input = 0;
		});
	</script>
</div>`;

exports.readme = `# Merge to object
This component merges all received data into a \`Object\`. Clicking on the button will remove any previously recieved data.`;

exports.install = function(instance) {

	var data = {};

	instance.on('data', function(response) {

		var id = instance.options.id ? response.id : '$';

		!data[id] && (data[id] = {});

		var prop = instance.options.props[response.index];
		if (prop)
			data[id][prop] = response.data;
		else
			instance.debug('No property name for current input:', response.index);

		instance.status(Object.keys(data[id]).join(', '), 'red');

		if (Object.keys(data[id]).length === instance.options.props.length) {

			if (instance.options.id) {
				response.data = data[id];
				instance.send2(response);
			} else
				instance.send2(data[id]);

			setTimeout2(instance.id, () => instance.status(''), 500, 10);
			data[id] = null;
		}
	});

	instance.on('click', function() {
		data = {};
	});

	instance.on('options', function() {
		if (instance.options.props && instance.options.props.length)
			instance.status('');
		else
			instance.status('Not configured', 'red');
	});

	instance.status(instance.options.props && instance.options.props.length ? '' : 'Not configured', 'red');
};