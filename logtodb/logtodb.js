exports.id = 'logtodb';
exports.title = 'Log to DB';
exports.group = 'Databases';
exports.color = '#B0C4DE';
exports.author = 'Martin Smola';
exports.icon = 'log';
exports.readme = `# Log to DB

Logs a string into a DB (NoSQL embedded).

Incoming data are passed to output.

Template uses Total.js framework view syntax.

\`@{repository.time}\` inserts \`new Date().getTime()\`
`;

exports.install = function(instance) {

	instance.custom.reconfigure = function() {
		if (!instance.options.filename || !instance.options.template)
			return instance.status('Not configured', 'red');

		instance.status('');
	};

	instance.on('data', function(flowdata) {
		instance.send(flowdata);	

		if (!instance.options.filename || !instance.options.template)
			return;

		var str = F.viewCompile(instance.options.template, flowdata.data, '', { time: new Date().getTime() });

		NOSQL(instance.options.filename).insert({ dt: new Date().getTime(), body: str });

	});

	instance.on('options', instance.custom.reconfigure);

	instance.custom.reconfigure();
};