exports.id = 'trigger';
exports.title = 'Trigger';
exports.group = 'Inputs';
exports.color = '#F6BB42';
exports.click = true;
exports.output =  1;
exports.version = '1.1.0';
exports.author = 'Martin Smola';
exports.icon = 'play';

exports.html = `<div class="padding">
	<div data-jc="dropdown" data-jc-path="datatype" data-jc-config="items:,String|string,Integer|integer,Float|float,Boolean|boolean,Date|date,Object|object,Base64 as Buffer|buffer" class="m">@(Data type (String by default))</div>
	<div data-jc="textbox" data-jc-path="data" data-jc-config="placeholder:@(e.g. Hello world or { hello: 'world'} or ['hello', 'world']))">@(Data)</div>
</div>`;

exports.readme = `# Trigger

- Clicking on the component starts the chain
- Settings allows to set a data-type and a value`;

exports.install = function(instance) {

	var value;

	instance.on('click', () => instance.send2(value));

	instance.reconfigure = function() {
		var options = instance.options;
		value = null;
		switch (options.datatype) {
			case 'string':
				value = '' + (options.data || '');
				break;
			case 'integer':
				value = options.data.parseInt2('error');
				value = value === 'error' ? NaN : value;
				break;
			case 'float':
				value = options.data.parseFloat2('error');
				value = value === 'error' ? NaN : value;
				break;
			case 'date':
				options.data = options.data.toString();
				var num = options.data.parseInt('error');
				num === 'error' && (num = options.data.parseDate('error'));
				num === 'error' && (num = null);
				value = num ? new Date(num).toUTCString() : num;
				break;
			case 'object':
				try {
					value = (new Function('return ' + options.data))();
				} catch (e) {
					instance.error(e);
				}
				break;
			case 'boolean':
				value = options.data.parseBoolean();
				break;
			case 'buffer':
				try {
					value = U.createBuffer(options.data);
				} catch (e) {
					instance.error(e);
				}
				break;
		}
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};
