exports.id = 'monitordisk';
exports.title = 'Monitoring: Disk';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.group = 'Inputs';
exports.color = '#F6BB42';
exports.output = 1;
exports.icon = 'hdd-o';
exports.options = { interval: 8000, path: '/' };
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
			<div data-jc="textbox" data-jc-path="interval" data-placeholder="@(10000)" data-increment="true" data-jc-type="number" data-required="true" data-maxlength="10">@(Interval in milliseconds)</div>
		</div>
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="path" data-placeholder="/" data-required="true">@(Path)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	var fields = ['1B-blocks', 'Used', 'Available'];
	var current = { total: 0, used: 0, free: 0 };
	var tproc = null;

	instance.custom.run = function() {

		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}

		require('child_process').exec('df -hTB1 ' + instance.options.path, function(err, response) {

			tproc = setTimeout(instance.custom.run, instance.options.interval);

			if (err) {
				instance.error(err);
				return;
			}

			response.parseTerminal(fields, function(line) {
				current.total = line[0].parseInt();
				current.free = line[2].parseInt();
				current.used = line[1].parseInt();
				instance.send(current);
			});
		});
	};

	instance.on('close', function() {
		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}
	});

	setTimeout(instance.custom.run, 1000);
};