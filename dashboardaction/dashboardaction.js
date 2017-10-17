exports.id = 'dashboardaction';
exports.title = 'Action';
exports.version = '1.0.0';
exports.author = 'Martin Smola';
exports.group = 'Dashboard';
exports.color = '#5CB36D';
exports.input = false;
exports.output = 1;
exports.options = {  };
exports.readme = `# Dashboard Action`;

exports.html = `<div class="padding">
	<p>The label you specify above will apear in DashBoard component's settings form.</p>
</div>`;

exports.install = function(instance) {
	instance.on('dashboard', function(type) {
		if (type === 'run') {
			instance.send2();
			instance.dashboard('status', 'ok');
		}
	});
};