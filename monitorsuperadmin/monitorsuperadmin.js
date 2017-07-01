exports.id = 'monitorsuperadmin';
exports.title = 'Monitoring: SuperAdmin';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.group = 'Inputs';
exports.color = '#F6BB42';
exports.output = 1;
exports.icon = 'binoculars';
exports.options = { interval: 8000, url: '', token: '' };
exports.readme = `# SuperAdmin monitoring

This component monitors all applications in Toatl.js SuperAdmin. The response is Object Array.

__Data Example__:

\`\`\`javascript
[
	{
		url: "https://www.totaljs.com"
		port: 8000,
		pid: "2571",
		current: {
			interval: 104,
			cluster: 1,
			port: 8003,
			pid: "2571",
			cpu: "0 %",
			memory: 59318272, // in bytes
			time: "1-01:47:29"
		},
		stats: {
			cpu: 0, // in percentage
			memory: 59535360, // in bytes
			openfiles: 26,
			connections: 3,
			errors: null,
			hdd: 20248601 // in bytes
		}
	}
]
\`\`\``;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="url" data-required="true" data-placeholder="https://superadmin.totaljs.com" data-maxlength="200">@(URL address)</div>
		</div>
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="token" data-required="true" data-maxlength="50">@(Token)</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="interval" data-placeholder="@(10000)" data-increment="true" data-jc-type="number" data-required="true" data-maxlength="10">@(Interval in milliseconds)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	var current = [];
	var tproc = null;

	instance.custom.run = function() {

		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}

		RESTBuilder.make(function(builder) {
			builder.url(U.path(instance.options.url) + '/api/apps/');
			builder.header('x-token', instance.options.token);
			builder.exec(function(err, response) {

				if (err) {
					instance.error(err);
					return;
				}

				current = response;
				instance.send(current);
				tproc = setTimeout(instance.custom.run, instance.options.interval);
			});
		});
	};

	instance.on('close', function() {
		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}
	});

	instance.reconfigure = function() {
		if (instance.options.token && instance.options.url) {
			instance.status('');
			setTimeout(instance.custom.run, 1000);
		} else
			instance.status('Not configured', 'red');
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};