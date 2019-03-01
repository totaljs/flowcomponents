exports.id = 'device_switch';
exports.title = 'Switch';
exports.version = '1.0.0';
exports.author = 'Martin Smola';
exports.group = 'Devices';
exports.icon = 'toggle-on';
exports.dashboard = true;
exports.flowboard = true;
exports.color = '#5CB36D';
exports.input = 1;
exports.output = 1;
exports.click = true;
exports.options = { default: false, type: 'toggle' };
exports.readme = `# Switch for Dashboard and Flowboard
### input
Bellow data will toggle on and anything else off
- true
- 1
- 'on'
- { on: <any of above> }

### Output

{
	name: 'Switch',
	id: 'component id',
	type: 'switch',
	subtype: '', // toggle or push
	on: false, // toggle: true/false | push: true
}
`;

exports.html = `<div class="padding">
	<p>The label you specify above will apear in DashBoard/Flowboard component's settings form.</p>
	<div class="row m">
		<div class="col-md-4">
			<div data-jc="dropdown" data-jc-path="type" data-jc-config="items:Toggle switch|toggle,Push button|push">Type of switch</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-4">
			<div data-jc="dropdown" data-jc-path="default" data-jc-config="items:On|true,Off|false">Default value (only for Toggle switch)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	var onVals = [true, 1, 'on'];
	var device = {
		name: 'Switch',
		id: '',
		type: 'switch',
		subtype: '', // toggle or push
		on: false,
	};

	function toggle() {
		device.on = device.subtype === 'toggle' ? !device.on : true;
		instance.send2(device);
		status();
	}

	function reconfigure(init) {
		if (init === true)
			device.on = instance.options.default;

		device.subtype = instance.options.type;
		device.name = instance.name;
		device.id = instance.id;

		status();
	}

	instance.on('dashboard', dashboardflowboard);

	function dashboardflowboard(type) {
		if (type === 'click')
			toggle();

		if (type === 'status')
			status();
	}

	function status() {
		instance.status(device.subtype === 'toggle' ? 'Toggle switch:' + (device.on ? 'on' : 'off') : 'Push button');
		instance.dashboard('status', device);
		instance.flowboard('status', device);
	}

	instance.on('data', function(flowdata) {
		var d = flowdata.data;
		device.on = onVals.includes(d) || (d.on && onVals.includes(d.on));
		instance.send2(device);
		status();
	});

	instance.on('click', toggle);
	instance.on('options', reconfigure);
	reconfigure(true);
};
