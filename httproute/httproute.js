exports.id = 'httproute';
exports.title = 'HTTP Route';
exports.group = 'HTTP';
exports.color = '#5D9CEC';
exports.icon = 'globe';
exports.input = false;
exports.output = ['#6CAC5A', '#37BC9B'];
exports.version = '1.2.1';
exports.author = 'Martin Smola';
exports.cloning = false;
exports.options = { method: 'GET', url: '', size: 5, cacheexpire: '5 minutes', cachepolicy: 0, timeout: 5 };
exports.readme = `# HTTP route

__Outputs__:
- first output: raw data (cache is empty or is disabled)
- second output: cached data

If one of the outputs is disabled then automatic responce with code "503 service unavailable" is sent.

When a request comes in bellow object is available at \`flowdata.data\`:

\`\`\`javascript
{
	params: { id: '1' },     // params for dynamic routes, e.g. /test/{id}
	query: { msg: 'Hello' }, // parsed query string, e.g. /test/1?msg=Hello
	body: { test: 'OK' },    // object if json requests otherwise string
	headers: {},             // headers data
	session: {},             // session data
	user: {},                // user data
	files: [],               // uploaded files
	url: '/users/',          // a relative URL address
	referrer: '/',           // referrer
	mobile: false,           // determines mobile device
	robot: false,            // determines search robots/crawlsers
	language: 'en'           // determines language
}
\`\`\`

See [documentation for flags](https://docs.totaljs.com/latest/en.html#api~HttpRouteOptionsFlags~unauthorize). These method flags are set automatically e.g. \`get, post, put, patch or delete\`

---

\`id:ROUTE_ID\` flag cannot be used since it's already used by this component internally`;

exports.html = `<div class="padding">
	<section>
		<label>@(Main settings)</label>
		<div class="padding npb">

			<div class="row">
				<div class="col-md-3 m">
					<div data-jc="dropdown" data-jc-path="method" data-jc-config="required:true;items:,GET,POST,PUT,DELETE,PATCH,OPTIONS">@(HTTP method)</div>
				</div>
				<div class="col-md-9 m">
					<div data-jc="textbox" data-jc-path="url" data-jc-config="required:true;maxlength:500;placeholder:/api/test;error:URL already in use">@(URL address)</div>
				</div>
			</div>
			<div class="row">
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="flags" data-jc-config="placeholder:json">@(Additional flags)</div>
					<div class="help m">@(Separate flags by comma e.g. <code>json, authorize</code>)</div>
				</div>
				<div class="col-md-3 m">
					<div data-jc="textbox" data-jc-path="size" data-jc-config="placeholder:@(in kB);increment:true;type:number;maxlength:10;align:center">@(Max. request size)</div>
					<div class="help m">@(In <code>kB</code> kilobytes)</div>
				</div>
				<div class="col-md-3 m">
					<div data-jc="textbox" data-jc-path="timeout" data-jc-config="placeholder:@(in seconds);increment:true;type:number;maxlength:5;align:center">@(Timeout)</div>
					<div class="help m">@(In seconds.)</div>
				</div>
			</div>
		</div>
	</section>
	<br />
	<div data-jc="checkbox" data-jc-path="emptyresponse" class="b black">@(Automatically respond with 200 OK?)</div>
	<div class="help m">@(If not checked you need to use HTTP response component to respond to the request.)</div>
	<hr />
	<div data-jc="keyvalue" data-jc-path="headers" data-jc-config="placeholderkey:@(Header name);placeholdervalue:@(Header value and press enter)" class="m">@(Custom headers)</div>
	<div data-jc="keyvalue" data-jc-path="cookies" data-jc-config="placeholderkey:@(Cookie name);placeholdervalue:@(Cookie value and press enter)">@(Cookies)</div>
	</div>
	<hr class="nmt" />
	<div class="padding npt">
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

	var httproute_currenturl = '';
	var httproute_currentmethod = 'GET';

	ON('open.httproute', function(component, options) {
		if (options.flags instanceof Array) {
			var method = options.method.toLowerCase();
			options.flags = options.flags.remove(function(item) {
				switch (typeof(item)) {
					case 'string':
						return item.substring(0, 3) === 'id:' || item === method;
					case 'number': // timeout
						return true;
				}
			}).join(', ');
		}
		if (component.isnew) {
			options.url = '';
			options.name = '';
		} else {
			httproute_currenturl = options.url;
			httproute_currentmethod = options.method;
		}
	});

	WATCH('settings.httproute.url', httproutecheckurl);
	WATCH('settings.httproute.method', httproutecheckurl);

	function httproutecheckurl() {
		if (httproute_currenturl !== settings.httproute.url || httproute_currentmethod !== settings.httproute.method) {
			TRIGGER('httproutecheckurl', { url: settings.httproute.url, method: settings.httproute.method }, function(e) {
				var p = 'settings.httproute.url';
				if (e) {
					// invalid
					INVALID(p);
				} else {
					if (!CAN(p))
						RESET(p);
				}
			});
		}
	};

	ON('save.httproute', function(component, options) {
		!component.name && (component.name = options.method + ' ' + options.url);

		var builder = [];
		builder.push('### @(Configuration)');
		builder.push('');
		builder.push('- __' + options.method + ' ' + options.url + '__');
		builder.push('- @(flags): ' + options.flags);
		builder.push('- @(maximum request data length): __' + options.size + ' kB__');
		builder.push('- @(empty response): __' + options.emptyresponse + '__');

		if (options.headers) {
			var headers = [];
			Object.keys(options.headers).forEach(function(key){
				headers.push(key + ': ' + options.headers[key]);
			});
			headers.length && builder.push('- @(headers):\\n\`\`\`' + headers.join('\\n') + '\`\`\`');
		};

		var cp =  '@(no cache)';
		if (options.cachepolicy === 1)
			cp = '@(URL)';
		if (options.cachepolicy === 2)
			cp = '@(URL + query string)';

		if (options.cachepolicy === 3)
			cp = '@(URL + query string + user instance)';

		builder.push('- @(cache policy): __' + cp + '__');

		options.cacheexpire && builder.push('- @(cache expire): __' + options.cacheexpire + '__');

		component.notes = builder.join('\\n');
	});
</script>`;

exports.install = function(instance) {

	instance.custom.emptyresponse = function(self) {
		self.plain();
	};

	instance.reconfigure = function() {

		var options = instance.options;

		if (!options.url) {
			instance.status('Not configured', 'red');
			return;
		}

		if (typeof(options.flags) === 'string')
			options.flags = options.flags.split(',').trim();

		UNINSTALL('route', 'id:' + instance.id);

		var flags = options.flags || [];
		flags.push('id:' + instance.id);
		flags.push(options.method.toLowerCase());
		options.timeout && flags.push(options.timeout * 1000);

		F.route(options.url, function() {

			if (instance.paused || (instance.isDisabled && (instance.isDisabled('output', 0) || instance.isDisabled('output', 1)))) {
				this.status = 503;
				this.json();
				return;
			}

			var key;
			var self = this;

			if (instance.options.emptyresponse) {
				instance.status('200 OK');
				setTimeout(instance.custom.emptyresponse, 100, self);

				if (instance.hasConnection(0)) {
					var data = instance.make({
						query: self.query,
						body: self.body,
						session: self.session,
						user: self.user,
						files: self.files,
						headers: self.req.headers,
						url: self.url,
						params: self.params
					});
					instance.send2(0, data);
				}

				return;
			}

			switch (instance.options.cachepolicy) {
				case 1: // URL
					key = 'rro' + instance.id + self.url.hash();
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
					key = 'rro' + instance.id + key.hash();
					break;
			}

			if (key && F.cache.get2(key)) {
				var data = instance.make(F.cache.get2(key));
				data.repository.controller = self;
				instance.send2(1, data);
			} else {

				var data = instance.make({
					query: self.query,
					body: self.body,
					session: self.session,
					user: self.user,
					files: self.files,
					headers: self.req.headers,
					url: self.url,
					params: self.params,
					mobile: self.mobile,
					robot: self.robot,
					referrer: self.referrer,
					language: self.language
				});

				data.repository.controller = self;
				instance.send2(0, data);
				key && FINISHED(self.res, () => F.cache.set(key, self.$flowdata.data, instance.options.cacheexpire));
			}

		}, flags, options.size || 5);

		instance.status('Listening', 'green');
	};

	instance.reconfigure();
	instance.on('options', instance.reconfigure);

	instance.on('close', function(){
		UNINSTALL('route', 'id:' + instance.id);
	});
};

// check url exists
FLOW.trigger('httproutecheckurl', function(next, data) {
	var url = data.url;
	var method = data.method;
	if (url[url.length - 1] !== '/')
		url += '/';
	var exists = F.routes.web.findItem(r => r.urlraw === url && r.method === method);
	next(exists != null);
});

exports.uninstall = function() {
	FLOW.trigger('httproutecheckurl', null);
};
