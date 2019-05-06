exports.id = 'monitordisk';
exports.title = 'Disk';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.group = 'Monitoring';
exports.color = '#F6BB42';
exports.output = 1;
exports.icon = 'hdd-o';
exports.click = true;
exports.options = { interval: 8000, path: '/', enabled: true };
exports.readme = `# Disk monitoring

This component monitors disk \`bytes\` consumption in Linux systems. It uses \`df\` command.

__Data Example__:

\`\`\`javascript
{
	total: 474549649408,
	used: 39125245952,
	free: 411294994432
}
\`\`\``;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3 m">
			<div data---="textbox__interval__placeholder:10000;increment:true;type:number;required:true;maxlength:10;align:center">@(Interval in milliseconds)</div>
		</div>
		<div class="col-md-3 m">
			<div data---="textbox__path__placeholder:/;required:true">@(Path)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	var current = { total: 0, used: 0, free: 0, path: '', type: '', percentUsed: 0 };
	var tproc = null;

	instance.custom.run = function() {

		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}

		if (!instance.options.enabled)
			return;

		require('child_process').exec('df -hTB1 ' + instance.options.path, function(err, response) {

			tproc = setTimeout(instance.custom.run, instance.options.interval);

			if (err) {
				instance.error(err);
				return;
			}

			response.parseTerminal(function(line) {
				if (line[0][0] !== '/')
					return;
				current.total = line[2].parseInt();
				current.free = line[4].parseInt();
				current.used = line[3].parseInt();
				current.path = instance.options.path || '/';
				current.type = line[1];
				current.percentUsed = line[5];
				instance.custom.status();
				instance.send2(current);
			});
		});
	};

	instance.custom.status = function() {
		if (instance.options.enabled)
			instance.status(current.free.filesize() + ' / ' + current.total.filesize());
		else
			instance.status('Disabled', 'red');
	};

	instance.on('click', function() {
		instance.options.enabled = !instance.options.enabled;
		instance.custom.status();
		instance.options.enabled && instance.custom.run();
	});

	instance.on('close', function() {
		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}
	});

	setTimeout(instance.custom.run, 1000);
};