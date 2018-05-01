exports.id = 'triggertoggle';
exports.title = 'Toggle Trigger';
exports.group = 'Inputs';
exports.color = '#F6BB42';
exports.click = true;
exports.output =  1;
exports.version = '1.1.0';
exports.author = 'Peter Širka';
exports.icon = 'forward';

exports.html = `<div class="padding">
	<section class="m">
		<label><i class="fa fa-code"></i>@(A)</label>
		<div class="padding">
			<div data-jc="dropdown" data-jc-path="datatypeA" data-jc-config="items:,String|string,Integer|integer,Float|float,Boolean|boolean,Date|date,Object|object,Base64 as Buffer|buffer" class="m">@(Data type (String by default))</div>
			<div data-jc="textbox" data-jc-path="dataA" data-jc-congif="placeholder:@(e.g. Hello world or { hello: 'world'} or ['hello', 'world']))">@(Data)</div>
		</div>
	</section>
	<section>
		<label><i class="fa fa-code"></i>@(B)</label>
		<div class="padding">
			<div data-jc="dropdown" data-jc-path="datatypeB" data-jc-config="items:,String|string,Integer|integer,Float|float,Boolean|boolean,Date|date,Object|object,Base64 as Buffer|buffer" class="m">@(Data type (String by default))</div>
			<div data-jc="textbox" data-jc-path="dataB" data-jc-congif="placeholder:@(e.g. Hello world or { hello: 'world'} or ['hello', 'world']))">@(Data)</div>
		</div>
	</section>
</div>`;

exports.readme = `# Toggle Trigger

- Clicking on the component starts the chain
- Settings allows to set a data-type and a value`;

exports.install = function(instance) {

	var valueA;
	var valueB;
	var toggle = false;

	instance.on('click', function() {
		toggle = !toggle;
		instance.send2(toggle ? valueA : valueB);
	});

	instance.reconfigure = function() {
		var options = instance.options;
		valueA = instance.custom.set(options.datatypeA, options.dataA);
		valueB = instance.custom.set(options.datatypeB, options.dataB);
	};

	instance.custom.set = function(type, value) {
		switch (type) {
			case 'string':
				return '' + value;
			case 'integer':
				return U.parseInt(value);
			case 'float':
				return U.parseFloat(value);
			case 'date':
				var num = U.parseInt(value);
				return num ? new Date(num) : value.parseDate();
			case 'object':
				try {
					return (new Function('return ' + value))();
				} catch (e) {
					instance.error(e);
					return null;
				}
			case 'boolean':
				return value.parseBoolean();
			case 'buffer':
				try {
					return U.createBuffer(value);
				} catch (e) {
					instance.error(e);
					return null;
				}
		}
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};
