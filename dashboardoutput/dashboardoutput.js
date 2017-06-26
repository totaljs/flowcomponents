exports.id = 'dashboardoutput';
exports.title = 'Output';
exports.group = 'Dashboard';
exports.color = '#5CB36D';
exports.icon = 'fa-commenting';
exports.input = true;
exports.output = 0;
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.readme = `# Dashboard: Output

This component shows data as they are. Output can be __HTML__ and can contain __Font-Awesome icons__, colors, etc..`;

exports.install = function(instance) {

	instance.custom.reconfigure = function() {
		instance.status(global.DASHBOARD ? '' : 'Dashboard not found.', global.DASHBOARD ? null : 'red');
	};

	instance.on('data', function(response) {
		instance.set('state', response.data);
		instance.dashboard(response.data);
	});

	instance.custom.reconfigure();

	instance.dashboard_laststate = function() {
		return instance.get('state');
	};
};