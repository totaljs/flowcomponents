exports.id = 'monitornetwork';
exports.title = 'Monitoring: Network';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.group = 'Inputs';
exports.color = '#F6BB42';
exports.output = 1;
exports.icon = 'exchange';
exports.options = { interval: 8000, ports: ['80'], interface: 'eth0' };
exports.readme = `# Network monitoring

This component monitors network in Linux systems. It uses \`netstat\` and \`ifconfig\` commands.

__Data Example__:

\`\`\`javascript
{
	download: 474549649408, // in bytes
	upload: 39125245952, // in bytes
	open: 34 // count of open connections
}
\`\`\``;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="interval" data-placeholder="@(10000)" data-increment="true" data-jc-type="number" data-required="true" data-maxlength="10">@(Interval in milliseconds)</div>
		</div>
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="interface" data-placeholder="eth0" data-required="true" data-maxlength="30">@(Network interface)</div>
		</div>
	</div>
	<div data-jc="textboxlist" data-jc-path="ports">Ports</div>
</div>`;

exports.install = function(instance) {

	var current = { download: 0, upload: 0, open: 0 };
	var tproc = null;
	var arg = null;
	var reg_network = /RX bytes:\d+|TX bytes:\d+/g;
	var Exec = require('child_process').exec;

	instance.custom.run = function() {

		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}

		var arr = [];

		arr.push(function(next) {
			Exec('netstat -an | grep {0} | wc -l'.format(arg), function(err, response) {

				if (err)
					instance.error(err);
				else
					current.open = response.trim().parseInt();

				next();
			});
		});

		arr.push(function(next) {
			Exec('ifconfig ' + instance.options.interface, function(err, response) {

				if (err)
					instance.error(err);
				else {
					var match = response.match(reg_network);
					if (match) {
						current.download = match[0].parseInt2();
						current.upload = match[1].parseInt2();
					}
				}

				next();
			});
		});

		arr.async(function() {
			tproc = setTimeout(instance.custom.run, instance.options.interval);
			instance.send(current);
		});
	};

	instance.reconfigure = function() {
		arg = [];
		instance.options.ports.forEach(n => arg.push('-e :' + n));
		arg = arg.join(' ');
	};

	instance.on('close', function() {
		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}
	});

	instance.on('options', instance.reconfigure);

	setTimeout(instance.custom.run, 1000);
	instance.reconfigure();
};