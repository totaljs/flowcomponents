exports.id = 'monitormemory';
exports.title = 'Memory';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.group = 'Monitoring';
exports.color = '#F6BB42';
exports.output = 1;
exports.click = true;
exports.icon = 'microchip';
exports.options = { interval: 8000, enabled: true };
exports.readme = `# Memory monitoring

This component monitors memory \`bytes\` consumption in Linux systems. It uses \`free\` command.

__Data Example__:

\`\`\`javascript
{
	total: 33558769664,
	used: 1998868480,
	free: 2653708288
}
\`\`\``;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="interval" data-jc-config="placeholder:10000;increment:true;type:number;required:true;maxlength:10;align:center">@(Interval in milliseconds)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	var current = { total: 0, used: 0, free: 0 };
	var tproc = null;

	instance.custom.run = function() {

		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}

		if (!instance.options.enabled)
			return;

		require('child_process').exec('free -b -t', function(err, response) {

			tproc = setTimeout(instance.custom.run, instance.options.interval);

			if (err) {
				instance.error(err);
				return;
			}

			var memory = response.split('\n')[1].match(/\d+/g);
			current.total = memory[0].parseInt();
			current.used = memory[1].parseInt() - memory[3].parseInt();
			current.free = current.total - current.used;
			instance.custom.status();
			instance.send2(current);
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