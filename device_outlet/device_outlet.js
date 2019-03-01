exports.id = 'device_outlet';
exports.title = 'Outlet';
exports.version = '1.0.0';
exports.author = 'Martin Smola';
exports.group = 'Devices';
exports.icon = 'plug';
exports.dashboard = true;
exports.flowboard = true;
exports.color = '#5CB36D';
exports.input = 1;
exports.output = 1;
exports.click = true;
exports.options = { default: false };
exports.readme = `# Device - Outlet
### input
Bellow data will toggle on and anything else off
- true
- 1
- 'on'

### Output
\`\`\`javascript
{
	name: 'Outlet name',
	id: 'xxxxxxx',
	type: 'OUTLET',
	on: true // or false
}
\`\`\`
`;

exports.html = `<div class="padding">
	<p>The label you specify above will apear in DashBoard component's settings form.</p>
	<div class="row">
		<div class="col-md-4">
			<div data-jc="dropdown" data-jc-path="default" data-jc-config="items:On|true,Off|false">Default value</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	var onVals = [true, 1, 'on'];

	var device = {
		name: 'Outlet',
		id: '',
		type: 'OUTLET',
		on: false
	};

	var status = () => {
		instance.status('Outlet is: ' + (device.on ? 'On' : 'Off'));
		instance.dashboard('status', device);
		instance.flowboard('status', device);
	};

	function toggle() {
		device.on = !device.on;
		send();
	}

	function send(){
		instance.send2(device);
		status();
	}

	function reconfigure(init) {
		if (init === true)
			device.on = instance.options.default;

		device.name = instance.name;
		device.id = instance.id;
		status();
	}

	instance.on('dashboard', dashboardflowboard);
	instance.on('flowboard', dashboardflowboard);

	function dashboardflowboard(type) {
		type === 'click' && toggle();
		type === 'status' && status();
	}

	instance.on('data', function(flowdata) {
		device.on = onVals.includes(flowdata.data);
		send();
	});

	instance.on('click', toggle);
	instance.on('options', reconfigure);

	reconfigure(true);
};
