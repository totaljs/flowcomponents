exports.id = 'monitornetwork';
exports.title = 'Network';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.group = 'Monitoring';
exports.color = '#F6BB42';
exports.output = 1;
exports.click = true;
exports.icon = 'exchange';
exports.options = { interval: 8000, ports: ['80'], interface: 'eth0', enabled: true };
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
			<div data-jc="textbox" data-jc-path="interval" data-jc-config="placeholder:10000;increment:true;type:number;required:true;maxlength:10;align:center">@(Interval in milliseconds)</div>
		</div>
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="interface" data-jc-config="placeholder:eth0;required:true;maxlength:30">@(Network interface)</div>
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
			if (instance.options.enabled) {
				tproc = setTimeout(instance.custom.run, instance.options.interval);
				instance.custom.status();
				instance.send2(current);
			}
		});
	};

	instance.custom.status = function() {
		if (instance.options.enabled)
			instance.status('Connections: ' + current.open + 'x');
		else
			instance.status('Disabled', 'red');
	};

	instance.reconfigure = function() {
		arg = [];
		instance.options.ports.forEach(n => arg.push('-e :' + n));
		arg = arg.join(' ');
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

	instance.on('options', instance.reconfigure);
	setTimeout(instance.custom.run, 1000);
	instance.reconfigure();
};