exports.id = 'monitorprocess';
exports.title = 'Process';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.group = 'Monitoring';
exports.color = '#F6BB42';
exports.output = 1;
exports.icon = 'exchange';
exports.click = true;
exports.options = { interval: 8000, process: 'total', enabled: true };
exports.readme = `# Process monitoring

This component monitors a process in Linux systems. It uses \`ps\` and \`lsof\` commands.

__Data Example__:

\`\`\`javascript
{
	name: 'total', // name of process
	cpu: 10, // in percentage
	memory: 39125245952, // in bytes
	files: 34, // count of open files
	uptime: '1-12:04:34'
}
\`\`\``;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="interval" data-jc-config="placeholder:10000;increment:true;type:number;required:true;maxlength:10">@(Interval in milliseconds)</div>
		</div>
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="process" data-jc-config="placeholder:total;required:true;maxlength:30">@(Process name)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	var current = { name: '', cpu: 0, memory: 0, files: 0, uptime: 0, count: 0 };
	var pids = null;
	var tproc = null;
	var counter = 0;
	var Exec = require('child_process').exec;
	var reg_empty = /\s{2,}/g;
	var reg_clean = /:-/g;

	instance.custom.reload = function() {
		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}
		tproc = setTimeout(instance.custom.run, instance.options.interval);
	};

	instance.custom.run = function() {

		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}

		if (!instance.options.enabled)
			return;

		counter++;

		if (!pids || counter % 10 === 0) {
			instance.custom.pid(function() {
				setTimeout(instance.custom.run, 1000);
			});
		} else
			instance.custom.info(instance.custom.reload);
	};

	instance.on('close', function() {
		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}
	});

	instance.custom.pid = function(callback) {
		Exec('ps aux | grep "{0}" | grep -v "grep" | awk {\'print $2\'}'.format(instance.options.process), function(err, response) {
			var arr = null;

			if (err) {
				instance.error(err);
				pids = null;
				current.count = 0;
			} else {
				arr = response.trim().split('\n');
				pids = arr.join(',');
				current.count = arr.length;
			}

			callback();
		});
	};

	instance.custom.info = function(callback) {

		if (!pids)
			return callback();

		Exec('ps -p {0} -o %cpu,rss,etime'.format(pids), function(err, response) {

			if (err) {
				instance.error(err);
				return callback();
			}

			var uptime_max = 0;
			current.uptime = null;
			current.memory = 0;
			current.cpu = 0;

			response.split('\n').forEach(function(line, index) {
				if (!index)
					return;
				line = line.trim().replace(reg_empty, ' ');
				if (!line)
					return;
				line = line.split(' ');
				current.cpu += line[0].parseFloat();
				current.memory += line[1].parseInt() * 1024; // kB to bytes
				var tmp = uptime_max;
				uptime_max = Math.max(uptime_max || 0, +line[2].replace(reg_clean));
				if (tmp !== uptime_max)
					current.uptime = line[2];
			});

			Exec('lsof -a -p {0} | wc -l'.format(pids), function(err, response) {

				if (err) {
					instance.error(err);
					instance.files = 0;
				} else
					current.files = response.trim().parseInt2();

				instance.custom.status();
				instance.send2(current);
				callback();
			});
		});
	};

	instance.custom.status = function() {
		if (instance.options.enabled)
			instance.status('{0}% / {1} ({2}x)'.format(current.cpu.floor(1), current.memory.filesize(), current.count));
		else
			instance.status('Disabled', 'red');
	};

	instance.on('click', function() {
		instance.options.enabled = !instance.options.enabled;
		instance.custom.status();
		if (instance.options.enabled) {
			counter = 0;
			instance.custom.run();
		}
	});

	instance.reconfigure = function() {
		counter = 0;
		pids = null;
		current.name = instance.options.process;
		instance.custom.run();
	};

	instance.on('options', instance.reconfigure);
	setTimeout(instance.custom.run, 1000);
	instance.reconfigure();
};