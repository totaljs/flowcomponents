exports.id = 'monitorsuperadmin';
exports.title = 'SuperAdmin';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.group = 'Monitoring';
exports.color = '#F6BB42';
exports.output = 1;
exports.icon = 'binoculars';
exports.options = { interval: 8000, url: '', token: '', enabled: true };
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
			<div data-jc="textbox" data-jc-path="url" data-jc-config="required:true;placeholder:https\\://superadmin.totaljs.com;maxlength:200">@(URL address)</div>
		</div>
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="token" data-jc-config="required:true;maxlength:50">@(Token)</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="interval" data-jc-config="placeholder:10000;increment:true;type:number;required:true;maxlength:10;align:center">@(Interval in milliseconds)</div>
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

		if (!instance.options.enabled)
			return;

		RESTBuilder.make(function(builder) {
			builder.url(U.path(instance.options.url) + '/api/apps/');
			builder.header('x-token', instance.options.token);
			builder.exec(function(err, response) {

				if (err) {
					instance.error(err);
					return;
				}

				current = response;
				instance.custom.status();
				instance.send2(current);
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

	instance.custom.status = function() {
		if (instance.options.enabled)
			instance.status('Applications: ' + current.length + 'x');
		else if (instance.options.token && instance.options.url)
			instance.status('Disabled', 'red');
		else
			instance.status('Not configured', 'red');
	};

	instance.on('click', function() {
		instance.options.enabled = !instance.options.enabled;
		instance.custom.status();
		instance.options.enabled && instance.custom.run();
	});

	instance.reconfigure = function() {
		instance.options.token && instance.options.url && setTimeout(instance.custom.run, 1000);
		instance.custom.status();
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};