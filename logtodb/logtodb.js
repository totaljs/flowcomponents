exports.id = 'logtodb';
exports.title = 'Log to DB';
exports.group = 'Databases';
exports.color = '#B0C4DE';
exports.author = 'Martin Smola';
exports.icon = 'database';
exports.version = '1.0.0';
exports.input = true;
exports.output = true;
exports.options = { dbname: '', template: ''};
exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3">
			<div data-jc="textbox" data-jc-path="dbname" data-jc-config="">@(DB name)</div>
		</div>
		<div class="col-md-9">
			<div data-jc="textbox" data-jc-path="template" data-jc-config="">@(Template)</div>
		</div>
	</div>
</div>`;
exports.readme = `# Log to DB

Logs a string into a DB (NoSQL embedded).
Time stamp is added automaticaly.

Incoming data are passed to output.

Template uses Total.js framework view syntax.

Incomming object is available as \`@{model}\`

\`@{repository.time}\` inserts \`new Date().getTime()\`

## Template example
Data:
\`\`\`javascript
{
	name: 'some process',
	exec: 'restart'
}
\`\`\`
Template:
\`A process "@{model.propname}" executed "@{model.exec}" \`
Output:
*A process "some process" executed "restart"*`;

exports.install = function(instance) {

	instance.custom.reconfigure = function() {
		if (!instance.options.dbname || !instance.options.template)
			return instance.status('Not configured', 'red');
		instance.status('');
	};

	instance.on('data', function(flowdata) {
		instance.send(flowdata);
		if (!instance.options.dbname || !instance.options.template)
			return;
		var str = F.viewCompile(instance.options.template, flowdata.data, '', { time: new Date().getTime() });
		NOSQL(instance.options.dbname).insert({ dt: new Date().getTime(), body: str });
	});

	instance.on('options', instance.custom.reconfigure);
	instance.custom.reconfigure();
};
