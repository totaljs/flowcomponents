exports.id = 'monitorcpu';
exports.title = 'CPU';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.group = 'Monitoring';
exports.color = '#F6BB42';
exports.output = 1;
exports.icon = 'microchip';
exports.options = { enabled: true };
exports.click = true;
exports.readme = `# CPU monitoring

This component monitors CPU \`% percentage\` consumption in Linux systems. It uses \`mpstat\` command.

__Data Example__:

\`\`\`javascript
{
	cpu: 30, // percentage
	cores: [4, 60, 0], // percentage
	count: 3 // count of cores
}
\`\`\``;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3 m">
			<div data---="textbox__interval__placeholder:10000;increment:true;type:number;required:true;maxlength:10;align:center">@(Interval in milliseconds)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	var fields = ['CPU', '%idle'];
	var current = { cores: [], cpu: 0, count: 0 };
	var proc = null;
	var tproc = null;

	instance.custom.kill = function() {
		if (proc) {
			proc.kill('SIGKILL');
			proc = null;
		}
	};

	instance.custom.run = function() {

		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}

		instance.custom.kill();
		proc = require('child_process').spawn('mpstat', ['-P', 'ALL', 10]);
		proc.stdout.on('data', U.streamer('\n\n', instance.custom.process));
		proc.stdout.on('error', function(e) {
			instance.error(e);
			instance.custom.kill();
			tproc = setTimeout(instance.custom.run, instance.options.interval || 5000);
		});
	};

	instance.custom.process = function(chunk) {
		current.cpu = 0;
		chunk.toString('utf8').parseTerminal(fields, instance.custom.parse);
		current.count = current.cores.length;
		if (current.count) {
			instance.send2(current);
			instance.custom.status();
		}
	};

	instance.custom.parse = function(values) {
		var val = 100 - values[1].parseFloat2();
		if (values[0] === 'all')
			current.cpu = val;
		else
			current.cores[+values[0]] = val;
	};

	instance.custom.status = function() {
		if (instance.options.enabled)
			instance.status(current.cpu.floor(1) + '%');
		else
			instance.status('Disabled', 'red');
	};

	instance.on('click', function() {
		instance.options.enabled = !instance.options.enabled;
		instance.custom.status();
		if (instance.options.enabled)
			instance.custom.run();
		else
			instance.custom.kill();
	});

	instance.on('close', function() {
		instance.custom.kill();
		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}
	});

	setTimeout(instance.custom.run, 1000);
};