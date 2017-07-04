exports.id = 'monitorconsumption';
exports.title = 'Monitoring: Consumption';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.group = 'Inputs';
exports.color = '#F6BB42';
exports.input = 0;
exports.output = 1;
exports.icon = 'bug';
exports.options = { interval: 5000, enabled: true, monitorconsumption: true, monitorsize: true, monitorconnections: true, monitorfiles: true };
exports.click = true;
exports.readme = `# Consumption monitoring

This component measure CPU and memory consumption, open files and open connections of this application. It uses these Linux commands: \`ps\`, \`lsof\`, \`netstat\` and \`df\`.

__Data Example__:

\`\`\`javascript
{
	cpu: 0, // percentage
	memory: 4096, // in bytes
	size: 34303, // directory size in bytes
	files: 34, // count of open files
	connections: 343, // count of connections
	uptime: '1-12:34:00'
}
\`\`\``;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="interval" data-placeholder="@(5000)" data-increment="true" data-jc-type="number" data-required="true" data-maxlength="10">@(Interval in milliseconds)</div>
		</div>
	</div>
	<hr />
	<div data-jc="checkbox" data-jc-path="monitorconsumption">Monitor: Consumption + uptime</div>
	<div data-jc="checkbox" data-jc-path="monitorfiles">Monitor: Count of open files</div>
	<div data-jc="checkbox" data-jc-path="monitorconnections">Monitor: Count of open connections</div>
	<div data-jc="checkbox" data-jc-path="monitorsize">Monitor: Directory size</div>
</div>`;

exports.install = function(instance) {

	var current = { cpu: 0, memory: 0, files: 0, connections: 0, size: 0, uptime: '', counter: 0 };
	var tproc = null;
	var Exec = require('child_process').exec;
	var reg_empty = /\s{2,}/g;
	var reg_appdisksize = /^[\d\.\,]+/;

	instance.custom.run = function() {

		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}

		var arr = [];

		// Get CPU and Memory consumption
		instance.options.monitorconsumption && arr.push(function(next) {
			Exec('ps -p {0} -o %cpu,rss,etime'.format(process.pid), function(err, response) {

				if (!err) {
					var line = response.split('\n')[1];
					line = line.trim().replace(reg_empty, ' ').split(' ');
					var cpu = line[0].parseFloat();
					current.cpu = cpu.floor(1);
					current.memory = line[1].parseInt2() * 1024; // kB to bytes
					current.uptime = line[2];
				}

				next();
			});
		});

		// Get count of open files
		instance.options.monitorfiles && arr.push(function(next) {
			Exec('lsof -a -p {0} | wc -l'.format(process.pid), function(err, response) {
				!err && (current.files = response.trim().parseInt2());
				next();
			});
		});

		// Get count of opened network connections
		instance.options.monitorconnections && arr.push(function(next) {
			Exec('netstat -an | grep :{0} | wc -l'.format(F.port), function(err, response) {
				if (!err) {
					current.connections = response.trim().parseInt2() - 1;
					if (current.connections < 0)
						current.connections = 0;
				}
				next();
			});
		});

		// Get directory size
		instance.options.monitorsize && current.counter % 5 !== 0 && arr.push(function(next) {
			Exec('du -hsb ' + process.cwd(), function(err, response) {
				if (!err) {
					var match = response.trim().match(reg_appdisksize);
					match && (current.size = match.toString().trim().parseInt2());
				}
				next();
			});
		});

		arr.async(function() {

			tproc && clearTimeout(tproc);

			if (instance.options.enabled) {
				tproc = setTimeout(instance.custom.run, instance.options.interval);
				instance.send(current);
			}

			instance.custom.status();
			current.counter++;
		});
	};

	instance.custom.status = function() {
		if (instance.options.enabled)
			instance.status('{0}% / {1}'.format(current.cpu, current.memory.filesize()));
		else
			instance.status('Disabled');
	};

	instance.on('click', function() {
		instance.options.enabled = !instance.options.enabled;
		instance.custom.status();
		instance.save();

		if (instance.options.enabled) {
			current.counter = 0;
			instance.custom.run();
		}

	});

	instance.on('close', function() {
		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}
	});

	setTimeout(instance.custom.run, 1000);
};