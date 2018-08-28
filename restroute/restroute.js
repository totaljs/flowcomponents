exports.id = 'restroute';
exports.title = 'Route';
exports.group = 'REST';
exports.color = '#6B9CE6';
exports.input = 0;
exports.output = ['#6BAD57', '#F6BB42', '#666D77'];
exports.author = 'Peter Širka';
exports.icon = 'globe';
exports.version = '1.1.0';
exports.cloning = false;

exports.options = {
	method: 'GET',
	url: '',
	duration: false,
	auth: false,
	middleware: [],
	length: 5,
	operation: [],
	output: '',
	respond: false,
	timeout: 5,
	cacheexpire: '5 minutes',
	cachepolicy: 0
};

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="dropdown" data-jc-path="method" data-jc-config="required:true;items:,GET,POST,PUT,DELETE,PATCH">@(HTTP method)</div>
		</div>
		<div class="col-md-9 m">
			<div data-jc="textbox" data-jc-path="url" data-jc-config="required:true;placeholder:/api/products/;error:URL already in use or no URL entered">@(URL address)</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="length" data-jc-config="type:number;maxlength:5;increment:true;align:center">@(Max. size in kB)</div>
			<div class="help"><i class="fa fa-warning"></i>@(For received data)</div>
		</div>
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="timeout" data-jc-config="type:number;maxlength:5;increment:true;align:center">@(Timeout)</div>
			<div class="help"><i class="fa fa-clock-o"></i>@(In seconds)</div>
		</div>
		<div class="col-md-6 m">
			<div data-jc="dropdowncheckbox" data-jc-path="middleware" data-jc-config="datasource:restroutedata.middleware;alltext:;empty:@(No middleware)">@(Middleware)</div>
			<div class="help"><i class="fa fa-warning"></i>@(Order is very important)</div>
		</div>
	</div>
	<hr />
	<div data-jc="checkbox" data-jc-path="duration" class="b">@(Measure duration)</div>
	<div data-jc="checkbox" data-jc-path="auth">@(Enables authorization)</div>
	<div data-jc="checkbox" data-jc-path="respond">@(Automatically respond with JSON + 200 OK?)</div>
</div>
<hr class="nmt nmb" />
<div class="padding">
	<div data-jc="dropdown" data-jc-path="schema" data-jc-config="required:true;datasource:restroutedata.schemas;empty:" class="m">@(Schema)</div>
	<div data-jc="dropdowncheckbox" data-jc-path="operation" data-jc-config="required:true;datasource:restroutedata.operations2;alltext:;empty:@(No operations)">@(Operation)</div>
	<div class="help m"><i class="fa fa-warning"></i>@(Order is very important)</div>
	<div data-jc="dropdown" data-jc-path="output" data-jc-config="datasource:settings.restroute.operation;empty:@(All responses)" class="m">@(Response)</div>
	<div class="row">
		<div class="col-md-9 m">
			<div data-jc="dropdown" data-jc-path="cachepolicy" data-jc-config="type:number;items:@(no cache)|0,@(URL)|1,@(URL + query string)|2,@(URL + query string + user instance)|3">@(Cache policy)</div>
			<div class="help">@(User instance must contain <code>id</code> property.)</div>
		</div>
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="cacheexpire" data-jc-config="maxlength:20;align:center">@(Expiration)</div>
			<div class="help">@(E.g. <code>5 minutes</code>)</div>
		</div>
	</div>
</div>
<script>
	var restroute_currenturl = '';
	var restroute_currentmethod = 'GET';

	ON('open.restroute', function(com, options) {
		TRIGGER('{0}', 'restroutedata');
		if (com.isnew) {
			options.url = '';
			options.name = '';
		} else {
			restroute_currenturl = options.url;
			restroute_currentmethod = options.method;
		}
	});

	WATCH('restroutedata.operations', restrouterebind);
	WATCH('settings.restroute.method', restroutecheckurl);
	WATCH('settings.restroute.schema', restrouterebind, true);
	WATCH('settings.restroute.url', restroutecheckurl);

	function restrouterebind() {
		setTimeout2('restrouterebind', function() {
			var arr = [];
			settings.restroute.schema && restroutedata.operations.forEach(function(item) {
				item.idschema === settings.restroute.schema && arr.push(item);
			});
			SET('restroutedata.operations2', arr, true);
		}, 1000);
	};

	function restroutecheckurl() {
		if (restroute_currenturl === settings.restroute.url && restroute_currentmethod === settings.restroute.method)
			return;
		TRIGGER('restroutecheckurl', { url: settings.restroute.url, method: settings.restroute.method }, function(exists){
			(exists ? INVALID : RESET)('settings.restroute.url');
		});
	};

	ON('save.restroute', function(component, options) {
		!component.name && (component.name = options.method + ' ' + options.url);
		var builder = [];
		builder.push('### @(Configuration)');
		builder.push('');
		builder.push('- __' + options.method + ' ' + options.url + '__');
		options.middleware.length && builder.push('- middleware: __' + options.middleware.join(', ') + '__');
		builder.push('- @(authorization): __' + options.auth.toString() + '__');
		builder.push('- @(auto-responding): __' + options.respond.toString() + '__');
		builder.push('- @(maximum request data length): __' + options.length + ' kB__');
		builder.push('- @(timeout for response): __' + options.timeout + ' @(seconds)__');
		builder.push('- @(cache): __' + (options.cachepolicy ? options.cacheexpire : '@(no cache)') + '__');
		builder.push('---');
		builder.push('- @(schema): __' + options.schema + '__');
		builder.push('- @(operation): __' + options.operation.join(', ') + '__');
		builder.push('- @(response): __' + (options.output ? options.output : '@(All responses)') + '__');
		component.notes = builder.join('\\n');
	});

</script>`.format(exports.id);

exports.readme = `# REST: Route

This component creates a REST endpoint/route (Total.js route) for receiving data. It handles errors automatically.

__Outputs__:

- first output contains a __response__ - disabling this output will cause automatic response with code "503 service unavailable"
- second output contains received data
- third output contains a average time of duration \`Number\``;

exports.install = function(instance) {

	var action = null;
	var dursum = 0;
	var durcount = 0;

	instance.on('close', () => UNINSTALL('route', 'id:' + instance.id));

	instance.reconfigure = function() {

		var options = instance.options;

		if (!options.url) {
			instance.status('Not configured', 'red');
			return;
		}

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
		var flags = [options.timeout * 1000];

		if (options.method !== 'GET')
			flags.push(options.method.toLowerCase());

		if (options.auth)
			flags.push('authorize');

		if (options.middleware) {
			for (var i = 0; i < options.middleware.length; i++)
				flags.push('#' + options.middleware[i]);
		}

		flags.push('*' + options.schema);
		flags.push('id:' + instance.id);

		var code = 'if (self.body.$async) { self.body.$async(next{0}).{1}; } else { $ASYNC(self.schema,next{0},self).{1}; }'.format(output == null ? ',undefined' : ',' + output, builder.join('.'));
		action = new Function('self', 'next', code);

		var schema = [];
		for (var i = 0; i < options.operation.length; i++)
			schema.push(options.operation[i] === options.output ? '[{0}]'.format(options.operation[i]) : options.operation[i]);

		instance.status(options.schema.replace(/^default\//, '') + ': ' + schema.join(', '));

		ROUTE(options.url, function(id) {

			// is flow paused or first output disabled?
			if (instance.paused || (instance.isDisabled && instance.isDisabled('output', 0))) {
				this.status = '503';
				this.json();
				return;
			}

			var self = this;
			var key;
			var beg;

			if (instance.options.duration)
				beg = new Date();

			self.id = id;
			self.flowinstance = instance;

			if (instance.hasConnection(1)) {
				var data = {};
				data.query = self.query;
				data.user = self.user;
				data.session = self.session;
				data.body = self.body;
				data.params = self.params;
				data.headers = self.req.headers;
				data.url = self.url;
				data.mobile = self.mobile;
				data.robot = self.robot;
				data.referrer = self.referrer;
				data.language = self.language;
				var msg = instance.make(data, 1);
				msg.repository.controller = self;
				instance.send(1, msg);
			}

			switch (instance.options.cachepolicy) {

				case 1: // URL
					key = 'rr' + instance.id + self.url.hash();
					break;
				case 2: // URL + query
				case 3: // URL + query + user
					key = self.url;
					var keys = Object.keys(self.query);
					keys.sort();
					for (var i = 0, length = keys.length; i < length; i++)
						key += keys[i] + self.query[keys[i]] + '&';
					if (instance.options.cachepolicy === 3 && self.user)
						key += 'iduser' + self.user.id;
					key = 'rr' + instance.id + key.hash();
					break;
			}

			if (key && F.cache.get2(key)) {
				var response = F.cache.get2(key);
				instance.options.respond && self.json(response);

				if (instance.options.duration) {
					durcount++;
					dursum += ((new Date() - beg) / 1000).floor(2);
					setTimeout2(instance.id, instance.custom.duration, 500, 10);
				}

				if (instance.hasConnection(0)) {
					var message = instance.make(response);
					message.repository.controller = self;
					message.repository.cache = true;
					instance.send(0, message);
				}
				return;
			}

			action(self, function(err, response) {

				if (instance.options.duration) {
					durcount++;
					dursum += ((new Date() - beg) / 1000).floor(2);
					setTimeout2(instance.id, instance.custom.duration, 500, 10);
				}

				if (err)
					self.invalid().push(err);
				else {
					key && instance.options.cacheexpire && F.cache.set(key, response, instance.options.cacheexpire);
					instance.options.respond && self.json(response);
					if (instance.hasConnection(0)) {
						var message = instance.make(response);
						message.repository.controller = self;
						instance.send(0, message);
					}
				}
			});
		}, flags, options.size || 5);
	};

	instance.custom.duration = function() {
		var avg = (dursum / durcount).floor(2);
		instance.status(avg + ' sec.');
		instance.send2(2, avg);
	};

	instance.on('service', function() {
		dursum = 0;
		durcount = 0;
	});

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
		for (var i = 0, length = keys.length; i < length; i++)
			output.operations.push({ id: keys[i], idschema: id, name: keys[i] });
	});

	var keys = Object.keys(F.routes.middleware);

	for (var i = 0, length = keys.length; i < length; i++)
		output.middleware.push(keys[i]);

	output.middleware.quicksort();
	output.operations.quicksort('name');
	output.schemas.quicksort('name');

	next(output);
});

// check url exists
FLOW.trigger('restroutecheckurl', function(next, data) {
	var url = data.url;
	var method = data.method;
	var exists = false;

	if (url[url.length - 1] !== '/')
		url += '/';

	for (var i = 0; i < F.routes.web.length; i++) {
		var r = F.routes.web[i];
		if (r.urlraw === url && r.method === method) {
			exists = true;
			break;
		}
	}

	next(exists);
});

exports.uninstall = function() {
	FLOW.trigger(exports.id, null);
};
