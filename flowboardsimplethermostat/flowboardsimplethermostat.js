exports.id = 'flowboardsimplethermostat';
exports.title = 'Simple thermostat';
exports.group = 'Flowbard';
exports.color = '#AC92EC';
exports.icon = 'fa-thermometer-half';
exports.input = 2;
exports.output = ['red', 'blue'];
exports.version = '1.0.0';
exports.author = 'Martin Smola';
exports.options = { temp_required: 21, hysteresis: 0.5, temp_current: 21, heating: false, enabled: true };
exports.readme = `# Flowbard: Simple thermostat

### Inputs
- First input can be used to enable/disable the thermostat. Disabling will also send 'true' to second output.
- Second input is default input for data.

### Outputs
- Data are send to first output when the heating should start and second to stop the heating.`;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="property" data-jc-config="placeholder:path.to.value" class="m">Property</div>
		</div>
	</div>	
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="temp_required" data-jc-config="placeholder:21;type:number;increment:true" class="m">Required temperature &#8451;</div>
		</div>
	</div>	
	<div class="row">
		<div class="col-md-6 m">	
			<div data-jc="textbox" data-jc-path="hysteresis" data-jc-config="placeholder:0.5">Hysteresis &#8451;</div>
			<div class="help m">@(If desired temperature is 21&#8451; and hysteresis 0.5&#8451; then heatings starts at 20.5&#8451; and stops at 21.5&#8451;)</div>
		</div>
	</div>	
</div>`;

exports.install = function(instance) {


	instance.custom.reconfigure = function() {
		var options = instance.options;

		instance.options = U.extend({ temp_required: 21, hysteresis: 0.5, temp_current: 21, enabled: true }, instance.options, true);		
		send(instance.options);
		instance.custom.status();
	};


	instance.custom.status = function() {
		var options = instance.options;
		instance.status(global.FLOWBOARD ? '{0} +-{1} {2}'.format(options.temp_required, options.hysteresis, instance.options.enabled ? 'Enabled' : 'Disabled') : 'Flowbard not found.', global.FLOWBOARD ? null : 'red');
		instance.flowboard('options', instance.options);
	};

	instance.on('0', function(flowdata) {
		var temp = flowdata.data;
		var options = instance.options;

		if (temp === true || temp === 1 || temp === 'on')
			options.enabled = true;
		else
			options.enabled = false;

		instance.custom.status();
	});

	instance.on('1', function(flowdata) {
		var val;
		var options = instance.options;

		if (options.property) {
			if (options.property.indexOf('.') === -1)
				options.temp_current = flowdata.data[options.property];
			else
				options.temp_current = U.get(flowdata.data, options.property);
		} else {
			options.temp_current = flowdata.data;
		}

		val = options.temp_current;

		if (!val)
			return;

		if (typeof val !== 'number') {
			val = val.parseFloat();
			if (isNaN(val)){
				instance.error('Error, input value is not a number: ' + val);
				return;
			}
		}

		send(options);
	});

	function send(options) {
		if (!options.enabled) {			
			options.heating = false;
			instance.send(1, true);
			return;
		}

		if (options.temp_current < (options.temp_required - options.hysteresis)) {
			// start
			options.heating = true;
			instance.send(0, true);
		} else if (options.temp_current > (options.temp_required + options.hysteresis)) {
			// stop
			options.heating = false;
			instance.send(1, true);
		}
		
		instance.flowboard('options', options);			
	};

	instance.on('options', instance.custom.reconfigure);
	instance.custom.reconfigure();

	instance.on('flowboard', function(type, data) {
		switch (type) {
			case 'setoptions':
				instance.options.temp_required = data.temp_required;
				instance.options.hysteresis = data.hysteresis;
				instance.custom.reconfigure();
				// send options to designer
				instance.reconfig();
				break;

			case 'getoptions':
				instance.flowboard('options', instance.options);
				break;
		}
	});

	instance.on('click', function() {
		instance.options.enabled = !instance.options.enabled;
		instance.custom.status();
	});
};