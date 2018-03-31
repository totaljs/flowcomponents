exports.id = 'dashboardflowboardbutton';
exports.title = 'Button';
exports.version = '1.0.0';
exports.author = 'Martin Smola';
exports.group = 'Dashboard/Flowboard';
exports.dashboard = true;
exports.flowboard = true;
exports.color = '#5CB36D';
exports.input = 1;
exports.output = 1;
exports.click = true;;
exports.options = { default: 'off', type: 'togglebutton' };
exports.readme = `# Button for Dashboard and Flowboard
### input
Bellow data will toggle on and anything else off
- true
- 1
- 'on'

### Output
- toggled on -> 1
- toggled off -> 0
`;

exports.html = `<div class="padding">
	<p>The label you specify above will apear in DashBoard/Flowboard component's settings form.</p>
	<div class="row m">
		<div class="col-md-4">
			<div data-jc="dropdown" data-jc-path="type" data-jc-config="items:Toggle switch|togglebutton,Push button|pushbutton">Type of switch</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-4">
			<div data-jc="dropdown" data-jc-path="default" data-jc-config="items:On - will send 1|on,Off - will send 0|off">Default value (only for Toggle switch)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	var toggled = 0;
	var onoff = ['Off', 'On'];

	function toggle() {		
		toggled = toggled ? 0 : 1;
		var type = instance.options.type;

		var val = type === 'togglebutton' ? toggled : 1;
		instance.send2(val);
		instance.dashboard('status', { toggled: toggled, type: type, name: instance.name });
		instance.flowboard('status', { toggled: toggled, type: type, name: instance.name });
		instance.status(type === 'togglebutton' ? 'Toggle:' + onoff[val] : 'PushButton');
	}


	function reconfigure(init) {
		if (init === true)
			if (instance.options.default === 'on')
				toggled = 1;
			else
				toggled = 0;

		var type = instance.options.type;
		instance.status(type === 'togglebutton' ? 'Toggle:' + onoff[type === 'togglebutton' ? toggled : 1] : 'PushButton');
		instance.dashboard('status', { toggled: toggled, type: type, name: instance.name });
	}

	instance.on('dashboard', dashboardflowboard);

	function dashboardflowboard(type) {
		if (type === 'toggle')
			toggle();

		if (type === 'status')
			instance.dashboard('status', { toggled: toggled, type: instance.options.type, name: instance.name });
			instance.flowboard('status', { toggled: toggled, type: instance.options.type, name: instance.name });
	};

	instance.on('data', function(flowdata) {
		var d = flowdata.data;
		toggled = (d === 1 || d === true || d === 'on') ? 1 : 0;
		toggle();
	});

	instance.on('click', toggle);

	instance.on('options', reconfigure);

	reconfigure(true);
};
