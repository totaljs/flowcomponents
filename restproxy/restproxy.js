exports.id = 'restproxy';
exports.title = 'Proxy';
exports.group = 'REST';
exports.color = '#6B9CE6';
exports.input = 0;
exports.output = ['#6BAD57', '#F6BB42', '#666D77'];
exports.author = 'Peter Širka';
exports.icon = 'globe';
exports.version = '1.0.1';
exports.cloning = false;
exports.options = { method: 'GET', url: '', target: '', headersreq: true, headersres: false, nodns: false, auth: false, middleware: [], length: 5, respond: false, timeout: 5, cacheexpire: '5 minutes', cachepolicy: 0, duration: false };

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="dropdown" data-jc-path="method" data-jc-config="required:true;items:,GET,POST,PUT,DELETE">@(HTTP method)</div>
		</div>
		<div class="col-md-9 m">
			<div data-jc="textbox" data-jc-path="url" data-jc-config="required:true;placeholder:/api/products/">@(URL address)</div>
		</div>
	</div>
	<section style="margin-top:10px">
		<div class="padding">
			<div data-jc="textbox" data-jc-path="target" data-jc-config="required:true;placeholder:@(https://www.yourdomain.com/api/products/)" class="m">@(Target address)</div>
			<div data-jc="keyvalue" data-jc-path="headers" data-jc-config="placeholderkey:@(Header name);placeholdervalue:@(Header value and press enter)" class="m">@(Additional headers)</div>
			<div data-jc="keyvalue" data-jc-path="cookies" data-jc-config="placeholderkey:@(Cookie name);placeholdervalue:@(Cookie value and press enter)">@(Additional cookies)</div>
		</div>
	</section>
	<br />
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
			<div data-jc="dropdowncheckbox" data-jc-path="middleware" data-jc-config="datasource:restproxydata.middleware;empty:@(No middleware);alltext:;empty:@(No middleware)">@(Middleware)</div>
			<div class="help"><i class="fa fa-warning"></i>@(Order is very important)</div>
		</div>
	</div>
	<hr />
	<div data-jc="checkbox" data-jc-path="duration" class="b">@(Measure duration)</div>
	<div data-jc="checkbox" data-jc-path="headersreq">@(Copy headers to request)</div>
	<div data-jc="checkbox" data-jc-path="headersres">@(Copy headers from response)</div>
	<div data-jc="checkbox" data-jc-path="auth">@(Enables authorization)</div>
	<div data-jc="checkbox" data-jc-path="respond">@(Automatically respond with JSON + 200 OK?)</div>
	<div data-jc="checkbox" data-jc-path="nodns">@(Disable DNS cache)</div>
</div>
<hr class="nmt nmb" />
<div class="padding">
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

	ON('open.restproxy', function(instance) {
		TRIGGER('{0}', 'restproxydata');
	});

	ON('save.restproxy', function(component, options) {
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
		builder.push('__@(Target):__');
		builder.push(options.target);
		component.notes = builder.join('\\n');
	});

</script>`.format(exports.id);

exports.readme = `# REST: Proxy

This component creates a REST proxy between local endpoint and external API. Proxy supports dynamic arguments between URL addresses via \`{key}\` markup (keys must be same).

__Outputs__:

- first output contains a __response__
- second output contains received data
- third output contains a average time of duration \`Number\``;

exports.install = function(instance) {

	var action = null;
	var Qs = require('querystring');
	var durcount = 0;
	var dursum = 0;
	var params = false;
	var PARAMS = /\{[a-z0-9,-._]+\}/gi;

	instance.on('close', () => UNINSTALL('route', 'id:' + instance.id));

	instance.reconfigure = function() {

		var options = instance.options;

		if (!options.url) {
			instance.status('Not configured', 'red');
			return;
		}

		params = options.url.indexOf('{') !== -1;

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

		flags.push('id:' + instance.id);

		ROUTE(options.url, function(id) {

			var self = this;
			var key, beg;

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
				data.headers = self.headers;
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
					key = 'rp' + instance.id + self.url.hash();
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
					key = 'rp' + instance.id + key.hash();
					break;
			}

			if (key && F.cache.get2(key)) {

				var response = F.cache.get2(key);
				self.status = response.status;

				if (instance.options.headersres && response.headers) {
					var headers = Object.keys(response.headers);
					for (var i = 0; i < headers.length; i++)
						self.header(headers[i], response.headers[headers[i]]);
				}

				if (instance.options.duration) {
					durcount++;
					dursum += ((new Date() - beg) / 1000).floor(2);
					setTimeout2(instance.id, instance.custom.duration, 500, 10);
				}

				instance.options.respond && self.json(response.data);

				if (instance.hasConnection(0)) {
					var message = instance.make(response.data);
					message.repository.controller = self;
					message.repository.cache = true;
					instance.send(0, message);
				}

				return;
			}

			RESTBuilder.make(function(builder) {
				var query = self.req.uri.search ? '?' + Qs.stringify(self.query) : '';
				if (params)
					builder.url(instance.options.target.replace(PARAMS, text => self.params[text.substring(1, text.length - 1).trim()] || text) + query);
				else
					builder.url(instance.options.target + query);

				builder.method(instance.options.method.toLowerCase());
				instance.options.method !== 'GET' && builder.json(self.body);
				instance.options.nodns && builder.noDnsCache();

				var headers;

				if (instance.options.headersreq) {
					headers = self.req.headers;
					var tmp = Object.keys(headers);
					for (var i = 0; i < tmp.length; i++) {
						var hk = tmp[i].toLowerCase();
						if (hk !== 'accept' && hk !== 'connection' && hk !== 'accept-encoding' && hk !== 'host')
							builder.header(hk, headers[tmp[i]]);
					}
				}

				headers = instance.options.headers;
				if (headers) {
					var tmp = Object.keys(headers);
					for (var i = 0; i < tmp.length; i++)
						builder.header(tmp[i].toLowerCase(), headers[tmp[i]]);
				}

				var cookies = instance.options.cookies;
				if (cookies) {
					var tmp = Object.keys(cookies);
					for (var i = 0; i < tmp.length; i++)
						builder.cookie(tmp[i], cookies[tmp[i]]);
				}

				builder.timeout(instance.options.timeout * 1000);
				builder.exec(function(err, response, output) {

					if (instance.options.headersres) {
						var headers = Object.keys(output.headers);
						for (var i = 0; i < headers.length; i++)
							self.header(headers[i], output.headers[headers[i]]);
					}

					if (instance.options.duration) {
						durcount++;
						dursum += ((new Date() - beg) / 1000).floor(2);
						setTimeout2(instance.id, instance.custom.duration, 500, 10);
					}

					if (err) {
						self.status = output.status > 399 && output.status < 505 ? output.status : 200;
						self.content(output.response, output['content-type']);
						return;
					}

					self.status = output.status;
					key && instance.options.cacheexpire && F.cache.set(key, { data: response, status: output.status, headers: output.headers }, instance.options.cacheexpire);
					instance.options.respond && self.json(response);

					if (instance.hasConnection(0)) {
						var message = instance.make(response);
						message.repository.controller = self;
						instance.send(0, message);
					}
				});
			});
		}, flags, options.size || 5);

		instance.status('');
	};

	instance.on('service', function() {
		dursum = 0;
		durcount = 0;
	});

	instance.custom.duration = function() {
		var avg = (dursum / durcount).floor(2);
		instance.status(avg + ' sec.');
		instance.send2(2, avg);
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};

// Reads schemas + operations
FLOW.trigger(exports.id, function(next) {
	var output = {};
	output.middleware = [];
	var keys = Object.keys(F.routes.middleware);
	for (var i = 0, length = keys.length; i < length; i++)
		output.middleware.push(keys[i]);
	output.middleware.quicksort();
	next(output);
});

exports.uninstall = function() {
	FLOW.trigger(exports.id, null);
};