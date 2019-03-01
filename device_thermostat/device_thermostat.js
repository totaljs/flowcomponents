exports.id = 'device_thermostat';
exports.title = 'Thermostat';
exports.group = 'Devices';
exports.dashboard = true;
exports.flowboard = true;
exports.color = '#ff4242';
exports.icon = 'thermometer-2';
exports.input = ['blue', 'green', 'grey'];
exports.output = ['red', 'blue' , 'darkgrey', 'orange'];
exports.version = '1.1.0';
exports.author = 'Martin Smola';
exports.options = {
	setpoint: {
		day: 21,
		night: 21,
		away: 21
	},
	hysteresis: 0.5,
	time: {
		day: {
			hours: '06',
			minutes: '00'
		},
		night: {
			hours: '22',
			minutes: '00'
		}
	},
	timeout: 30
};
exports.readme = `# Device - Thermostat

### Inputs
- First  -> current temperature
- Second -> set mode [ heat, cool, off, on ]
- Third  -> set daymode [ day, night, away, home] // home --> restores last mode

### Outputs
The data sent to output is last temperature recieved from second input
- First  -> start heating
- Second -> start cooling (NOT IMPLEMENTED YET)
- Third  -> stop heating or cooling
- Fourth -> Error reporting, no temperature data
`;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="property" data-jc-config="placeholder:path.to.value" class="m">Property (path to a temperature value in object)</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-4 m">
			<div data-jc="textbox" data-jc-path="setpoint.day" data-jc-config="placeholder:22;type:number;increment:true" class="m">Heating: day temperature &#8451;</div>
		</div>
		<div class="col-md-4 m">
			<div data-jc="textbox" data-jc-path="setpoint.night" data-jc-config="placeholder:21;type:number;increment:true" class="m">Heating: night temperature &#8451;</div>
		</div>
		<div class="col-md-4 m">
			<div data-jc="textbox" data-jc-path="setpoint.away" data-jc-config="placeholder:20;type:number;increment:true" class="m">Heating: away temperature &#8451;</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-4 m">
			<div class="ui-label" style="width:100%;">Day starts at X o'clock:</div>
			<div style="width:62px;float:left" data-jc="dropdown" data-jc-path="time.day.hours" data-jc-config="items:00,01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23"></div>
			<div style="width:6px;float:left;font-size: 21px;margin: 0 3px;">:</div><div style="width:62px;float:left" data-jc="dropdown" data-jc-path="time.day.minutes" data-jc-config="items:00,05,10,15,20,25,30,35,40,45,50,55"></div>
		</div>
		<div class="col-md-4 m">
			<div class="ui-label" style="width:100%;">Night starts at X o'clock:</div>
			<div style="width:62px;float:left" data-jc="dropdown" data-jc-path="time.night.hours" data-jc-config="items:00,01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23"></div>
			<div style="width:6px;float:left;font-size: 21px;margin: 0 3px;">:</div><div style="width:62px;float:left" data-jc="dropdown" data-jc-path="time.night.minutes" data-jc-config="items:00,05,10,15,20,25,30,35,40,45,50,55"></div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="hysteresis" data-jc-config="placeholder:0.5;type:number">Hysteresis &#8451;</div>
			<div class="help m">@(If desired temperature is 21&#8451; and hysteresis 0.5&#8451; then heatings starts at 20.5&#8451; and stops at 21.5&#8451;)</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="timeout" data-jc-config="placeholder:0;type:number">Timeout (in minutes, default 0 = disabled)</div>
			<div class="help m">@(Timeout for reporting error if no temperature data is coming in.)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	var modes = [ 'on', 'off', 'cool', 'heat' ];
	var daymodes = [ 'day', 'night', 'away', 'home' ];

	var device = {
		name: 'Thermostat',
		type: 'THERMOSTAT',
		mode: 'off',  // on, off, cool, heat - on means idle
		temperature: 21,
		daymode: 'day', // day, night, away
		options: {}
	};

	function setMode(m) {
		device.mode = m;
		lastdaymode = m;
		saveModes();
	}

	var lastdaymode = 'day';

	function setDaymode(m) {
		if (m === 'home')
			m = lastdaymode;

		device.daymode = m;

		if (m !== 'away')
			lastdaymode = m;
		send();
		saveModes();
	}

	function saveModes() {
		instance.set('modes', {
			mode: device.mode,
			daymode: device.daymode,
			lastdaymode: lastdaymode
		});
	}

	instance.custom.reconfigure = function(init) {
		var opts = { setpoint: { day: 21, night: 21, away: 21 }, hysteresis: 0.5 };
		device.options = instance.options = U.extend(opts, instance.options, true);
		device.name = instance.name;
		if (init === true) {
			var modes = U.extend({ mode: 'off', daymode: 'day', lastdaymode: 'day' }, instance.get('modes'), true);
			device.mode = modes.mode;
			device.daymode = modes.daymode;
			lastdaymode = modes.lastdaymode;
		}
		send();
	};

	instance.custom.status = function() {
		var options = instance.options;
		instance.status('C:{0} | S:{1} | +-{2} | {3} | M:{4}'.format(device.temperature, options.setpoint[device.daymode] || '??', options.hysteresis, device.daymode, device.mode));
		instance.dashboard('status', device);
		instance.flowboard('status', device);
	};

	// temperature
	instance.on('0', function(flowdata) {
		var options = instance.options;
		var val = getVal(flowdata.data, options.property);

		if (!val)
			return;

		if (typeof val !== 'number') {
			val = val.parseFloat();
			if (isNaN(val))
				return instance.error('Error, input value is not a number: ' + val);
		}

		device.temperature = Math.floor(val * 10) / 10;

		send();
		delayError();
	});

	// set mode [ heat, cool, off, on ]
	instance.on('1', function(flowdata) {
		var m = flowdata.data;

		if (modes.includes(m)) {
			setMode(m);
			send();
		}
	});

	// set daymode [ day, night, away ]
	instance.on('2', function(flowdata) {
		var m = flowdata.data;

		if (daymodes.includes(m)) {
			setDaymode(m);
		}
	});

	function send() {
		if (!device.temperature)
			return;

		var options = instance.options;

		if (device.mode === 'off') {

			instance.send(2, device); // 3rd output

		} else {

			if (device.temperature < (options.setpoint[device.daymode] - options.hysteresis)) {
				// start
				device.mode = 'heat';
				instance.send(0, device);
			} else if (device.temperature > (options.setpoint[device.daymode] + options.hysteresis)) {
				// stop
				device.mode = 'on';
				instance.send(2, device);
			}
		}

		instance.custom.status();
	}

	function getVal(obj, path) {
		if (path) {
			if (path.indexOf('.') === -1)
				return obj[path];
			else
				return U.get(obj, path);
		}

		return obj;
	}

	instance.on('options', instance.custom.reconfigure);
	setTimeout(() => instance.custom.reconfigure(true), 3000);

	instance.on('dashboard', dashboardflowboard);
	instance.on('flowboard', dashboardflowboard);

	function dashboardflowboard(type, data) {
		switch (type) {
			case 'setpoint':
				instance.options.setpoint = data;
				instance.custom.reconfigure();
				instance.reconfig(); // send options to designer
				break;

			case 'status':
				instance.custom.status();
				break;
		}
	}

	instance.on('click', function() {

		send();
	});

	instance.on('service', function() {

		var options = instance.options;
		var dt = new Date();
		var hours = ('0' + dt.getHours()).slice(-2);
		var minutes = ('0' + dt.getMinutes()).slice(-2);

		if (hours === options.time.day.hours && minutes === options.time.day.minutes) {
			if (device.daymode !== 'day')
				setDaymode('day');
			else
				lastdaymode = 'day';
			return;
		}

		if (hours === options.time.night.hours && minutes === options.time.night.minutes) {
			if (device.daymode !== 'night')
				setDaymode('night');
			else
				lastdaymode = 'night';
		}
	});

	// error reporting
	// if no temp data recieved within given timeout then send error to output 4
	var waiting = false;
	var timeout;

	function delayError(){
		// 0 === disabled
		if (instance.options.timeout === 0)
			return clearTimeout(timeout);

		if (waiting)
			clearTimeout(timeout);
		else
			waiting = true;

		timeout = setTimeout(function(){
			instance.send2(3, {
				error: 'No temperature data recieved for {0} minutes.'.format(instance.options.timeout),
				device: device
			});
			waiting = false;
		}, instance.options.timeout * 60 * 1000);
	}

	instance.on('close', () => timeout && clearTimeout(timeout));
};
