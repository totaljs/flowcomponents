exports.id = 'dashboardoutput';
exports.title = 'Output';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.group = 'Dashboard';
exports.color = '#5CB36D';
exports.icon = 'font';
exports.input = true;
exports.output = 0;
exports.readme = `# Dashboard Output

This component shows the content as it is in Total.js Dashboard.`;

exports.install = function(instance) {

	var lastdata = null;

	instance.on('data', function(response) {
		instance.lastdata = lastdata = response.data;
		instance.dashboard && instance.dashboard('laststate', lastdata);
	});

	instance.on('dashboard', function(type) {
		switch (type) {
			case 'laststate':
				instance.dashboard && instance.dashboard(type, lastdata);
				break;
		}
	});

};
