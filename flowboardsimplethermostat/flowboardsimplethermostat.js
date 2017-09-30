exports.id = 'flowboardsimplethermostat';
exports.title = 'Simple thermostat';
exports.group = 'Flowbard';
exports.color = '#AC92EC';
exports.icon = 'fa-thermometer-half';
exports.click = true;
exports.input = ['green', 'blue', 'yellow', 'black', 'grey'];
exports.output = ['red', 'lightgrey' , 'blue'];
exports.version = '1.0.0';
exports.author = 'Martin Smola';
exports.options = { temp_heating_day: 21, temp_heating_night: 21, temp_heating_away: 21, hysteresis: 0.5, temp_current: 21, heating: false, cooling: false, enabled: true };
exports.readme = `# Flowbard: Simple thermostat

### Inputs
- First input can be used to enable/disable the thermostat. Disabling will also send 'true' to second output.
- Second input is for current temperature.
- Third input is to set Day mode.
- Fourth input is to set Night mode.
- Fifth input is to set Away mode.

### Outputs
- Data are send to first output when the heating should start and second to stop the heating.`;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="property" data-jc-config="placeholder:path.to.value" class="m">Property</div>
		</div>
	</div>	
	<div class="row">
		<div class="col-md-4 m">
			<div data-jc="textbox" data-jc-path="temp_heating_day" data-jc-config="placeholder:22;type:number;increment:true" class="m">Heating: day temperature &#8451;</div>
		</div>
		<div class="col-md-4 m">
			<div data-jc="textbox" data-jc-path="temp_heating_night" data-jc-config="placeholder:21;type:number;increment:true" class="m">Heating: night temperature &#8451;</div>
		</div>
		<div class="col-md-4 m">
			<div data-jc="textbox" data-jc-path="temp_heating_away" data-jc-config="placeholder:20;type:number;increment:true" class="m">Heating: away temperature &#8451;</div>
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
		instance.options = U.extend({ temp_heating_day: 22, temp_heating_night: 21, temp_heating_away: 20, hysteresis: 0.5, temp_current: 21, enabled: false, heating: false, mode: 'away', name: instance.name }, instance.options, true);		
		send();
	};


	instance.custom.status = function() {
		var options = instance.options;	
		instance.status(global.FLOWBOARD ? '{0} | +-{1} | {2} | {3}'.format(options['temp_heating_'+ options.mode] || '??', options.hysteresis, options.enabled ? 'enabled' : 'disabled', options.mode) : 'Flowbard not found.', global.FLOWBOARD ? null : 'red');
		instance.flowboard('options', options);
	};

	// enable/disable
	instance.on('0', function(flowdata) {
		var temp = flowdata.data;
		var options = instance.options;

		if (temp === true || temp === 1 || temp === 'on')
			options.enabled = true;
		else
			options.enabled = false;
	
		send();
	});

	// temperature
	instance.on('1', function(flowdata) {
		var options = instance.options;
		var val = options.temp_current = getVal(flowdata.data, options.property);

		if (!val)
			return;

		if (typeof val !== 'number') {
			val = val.parseFloat();
			if (isNaN(val)){
				instance.error('Error, input value is not a number: ' + val);
				return;
			}
		}	
	
		send();
	});

	// set day mode
	instance.on('2', function(flowdata) {
		var options = instance.options;
		var m = flowdata.data;

		if (!m)
			options.mode = 'day';
		// if data is a string with one of the supported modes then set it as current mode
		else if (m === 'day' || m === 'night' || m === 'away')
			options.mode = m;
		// if data is object with mode property then set it as current mode
		else if (m.mode && (m.mode === 'day' || m.mode === 'night' || m.mode === 'away'))
			options.mode = m.mode;
		else // default mode is 'day'
			options.mode = 'day';

		send();
	});

	// set night mode
	instance.on('3', function(flowdata) {
		instance.options.mode = 'night';
		send();
	});

	// set away mode
	instance.on('4', function(flowdata) {
		instance.options.mode = 'away';
		send();
	});

	function send() {
		var options = instance.options;

		if (!options.enabled) {			
			options.heating = false;
			instance.send(1, true);
		} else {
			if (options.temp_current < (options['temp_heating_' + options.mode] - options.hysteresis)) {
				// start
				options.heating = true;
				instance.send(0, true);
			} else if (options.temp_current > (options['temp_heating_' + options.mode] + options.hysteresis)) {
				// stop
				options.heating = false;
				instance.send(1, true);
			}
		}	

		instance.custom.status();
	};

	function getVal(obj, path) {
		if (path) {
			if (path.indexOf('.') === -1)
				return obj[path];
			else
				return U.get(obj, path);
		}

		return obj;
	};

	instance.on('options', instance.custom.reconfigure);
	setTimeout(instance.custom.reconfigure, 3000);

	instance.on('flowboard', function(type, data) {
		switch (type) {
			case 'setoptions':
				instance.options.temp_heating_day = data.temp_heating_day;
				instance.options.temp_heating_night = data.temp_heating_night;
				instance.options.temp_heating_away = data.temp_heating_away;
				instance.options.hysteresis = data.hysteresis;
				instance.custom.reconfigure();
				// send options to designer
				instance.reconfig();
				break;

			case 'getoptions':
				instance.flowboard('options', options);
				break;
		}
	});

	instance.on('click', function() {
		instance.options.enabled = !instance.options.enabled;
		send();
	});
};