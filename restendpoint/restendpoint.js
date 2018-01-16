exports.id = 'restendpoint';
exports.title = 'Endpoint';
exports.group = 'REST';
exports.color = '#6B5223';
exports.input = false;
exports.output = 1;
exports.author = 'Peter Širka';
exports.icon = 'globe';
exports.version = '1.0.0';
exports.options = { method: 'GET', url: '', auth: false, middleware: [], length: 5, operation: [], output: '' };

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="dropdown" data-jc-path="method" data-jc-config="required:true;items:,GET,POST,PUT,DELETE">@(HTTP method)</div>
		</div>
		<div class="col-md-9 m">
			<div data-jc="textbox" data-jc-path="url" data-jc-config="required:true;placeholder:/api/products/">@(URL address)</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="length" data-jc-config="type:number;maxlength:5;increment:true;align:center">@(Max. size in kB)</div>
			<div class="help"><i class="fa fa-warning"></i>@(For received data)</div>
		</div>
		<div class="col-md-9 m">
			<div data-jc="dropdowncheckbox" data-jc-path="middleware" data-jc-config="datasource:flowrestendpointdata.middleware;cleaner:false;alltext:">@(Middleware)</div>
			<div class="help"><i class="fa fa-warning"></i>@(Order is very important)</div>
		</div>
	</div>
	<div data-jc="checkbox" data-jc-path="auth">@(Enables authorization)</div>
</div>
<hr class="nmt nmb" />
<div class="padding">
	<div data-jc="dropdown" data-jc-path="schema" data-jc-config="required:true;datasource:flowrestendpointdata.schemas;empty:" class="m">@(Schema)</div>
	<div data-jc="dropdowncheckbox" data-jc-path="operation" data-jc-config="required:true;datasource:flowrestendpointdata.operations2;cleaner:false;alltext:">@(Operation)</div>
	<div class="help m"><i class="fa fa-warning"></i>@(Order is very important)</div>
	<div data-jc="dropdown" data-jc-path="output" data-jc-config="datasource:settings.restendpoint.operation;empty:@(All responses)" class="m">@(Response)</div>
</div>
<script>
	var flowrestendpointdata = { schemas: [], operations: [] };

	ON('open.restendpoint', function(instance) {
		TRIGGER('{0}', 'flowrestendpointdata');
	});

	WATCH('flowrestendpointdata.operations', flowrestendpointrebind);
	WATCH('settings.restendpoint.schema', flowrestendpointrebind, true);

	function flowrestendpointrebind() {
		setTimeout2('flowrestendpointrebind', function() {
			var arr = [];
			settings.restendpoint.schema && flowrestendpointdata.operations.forEach(function(item) {
				item.idschema === settings.restendpoint.schema && arr.push(item);
			});
			SET('flowrestendpointdata.operations2', arr, true);
		}, 1000);
	}

	ON('save.restendpoint', function(component, options) {
		!component.name && (component.name = options.method + ' ' + options.url);
	});
</script>`.format(exports.id);

exports.readme = `# REST: Endpoint

This component creates REST endpoint (Total.js route) for receiving data. It handles errors automatically.`;

exports.install = function(instance) {

	var action = null;

	instance.on('close', () => UNINSTALL('route', 'id:' + instance.id));

	instance.reconfigure = function() {

		var options = instance.options;
		var builder = [];
		var output = options.output ? options.operation.indexOf(options.output) : null;

		if (output === -1)
			output = null;

		for (var i = 0; i < options.operation.length; i++) {
			var name = options.operation[i].split('#');
			if (name.length === 1)
				builder.push('$' + name[0] + '()');
			else
				builder.push('$' + name[0] + '(\'{0}\')'.format(name[1]));
		}

		if (action)
			UNINSTALL('route', 'id:' + instance.id);

		// Timeout 5000
		var flags = [5000];

		if (options.method !== 'GET')
			flags.push(options.method.toLowerCase());

		if (options.auth)
			flags.push('authorize');

		if (options.middleware) {
			for (var i = 0; i < options.middleware.length; i++)
				flags.push('#' + options.middleware);
		}

		flags.push('*' + options.schema);
		flags.push('id:' + instance.id);

		var code = 'if (self.body.$async) { self.body.$async(next{0}).{1}; } else { $ASYNC(self.schema,next{0}).{1}; }'.format(output == null ? '' : ',' + output, builder.join('.'));
		action = new Function('self', 'next', code);

		var schema = [];
		for (var i = 0; i < options.operation.length; i++)
			schema.push(options.operation[i] === options.output ? '[{0}]'.format(options.operation[i]) : options.operation[i]);

		instance.status(options.schema + ': ' + schema.join(', '));

		ROUTE(options.url, function() {
			var self = this;
			action(self, function(err, response) {
				if (err)
					self.invalid().push(err);
				else {
					var message = instance.make(err ? err : response);
					message.repository.controller = self;
					instance.send(0, message);
				}
			});
		}, flags, options.size || 5);
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};

// Reads schemas + operations
FLOW.trigger(exports.id, function(next) {

	var output = {};
	output.schemas = [];
	output.operations = [];
	output.middleware = [];

	EACHSCHEMA(function(group, name, schema) {

		var id = group + '/' + name;
		output.schemas.push({ id: id, name: group === 'default' ? name : group + '/' + name });

		var keys = Object.keys(schema.meta);
		for (var i = 0, length = keys.length; i < length; i++) {
			output.operations.push({ id: keys[i], idschema: id, name: keys[i] });
		}

	});

	var keys = Object.keys(F.routes.middleware);
	for (var i = 0, length = keys.length; i < length; i++)
		output.middleware.push(keys[i]);

	output.middleware.quicksort();
	output.operations.quicksort('name');
	output.schemas.quicksort('name');

	next(output);
});

exports.uninstall = function() {
	FLOW.trigger(exports.id, null);
};