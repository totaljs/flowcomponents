exports.id = 'httproute';
exports.title = 'HTTP Route';
exports.group = 'HTTP';
exports.color = '#5D9CEC';
exports.icon = 'globe';
exports.input = false;
exports.output = 1;
exports.version = '1.0.0';
exports.author = 'Martin Smola';
exports.cloning = false;
exports.readme = `# HTTP route

When a request comes in bellow object is available at \`flowdata.data\`:
\`\`\`javascript
{
	params: { id: '1' },     // params for dynamic routes, e.g. /test/{id}
	query: { msg: 'Hello' }, // parsed query string, e.g. /test/1?msg=Hello
	body: { test: 'OK' },     // object if json requests otherwise string
	session: {},			 // sesion data
	user: {},				 // user
	files: []				 // files
}
\`\`\`

See documentation for flags [here](https://docs.totaljs.com/latest/en.html#api~HttpRouteOptionsFlags~unauthorize)
Method flags are set automatically e.g. \`get, post, put or delete\`

\`id:ROUTE_ID\` flag cannot be used since it's already used by this component internally`;

exports.html = `<div class="padding">
	<section>
		<label>@(Main settings)</label>
		<div class="padding npb">
			<div data-jc="textbox" data-jc-path="url" class="m" data-jc-config="required:true;maxlength:500;placeholder:/api/test">@(URL address)</div>
			<div data-jc="dropdown" data-jc-path="method" data-jc-config="required:true;items:,GET,POST,PUT,DELETE,OPTIONS" class="m">@(HTTP method)</div>

			<div class="row">
				<div class="col-md-8 m">
					<div data-jc="textbox" data-jc-path="flags" data-jc-config="placeholder:json">@(Additional flags)</div>
					<div class="help m">@(Separate flags by comma e.g. <code>json, authorize</code>)</div>
				</div>
				<div class="col-md-4 m">
					<div data-jc="textbox" data-jc-path="size" data-jc-config="placeholder:in kB;increment:true;type:number;maxlength:10;align:center">@(Max. request size)</div>
					<div class="help m">@(In <code>kB</code> kilobytes)</div>
				</div>
			</div>
		</div>
	</section>
	<br />
	<div data-jc="checkbox" data-jc-path="emptyresponse" class="b black">@(Automaticlly respond with 200 OK?)</div>
	<div class="help m">@(If not checked you need to use HTTP response component to respond to the request.)</div>
	<hr />
	<div data-jc="keyvalue" data-jc-path="headers" data-jc-config="placeholderkey:@(Header name);placeholdervalue:@(Header value and press enter)" class="m">@(Custom headers)</div>
	<div data-jc="keyvalue" data-jc-path="cookies" data-jc-config="placeholderkey:@(Cookie name);placeholdervalue:@(Cookie value and press enter)" class="m">@(Cookies)</div>
</div>
<script>
	ON('open.httproute', function(component, options) {
		if (options.flags instanceof Array) {
			options.flags = options.flags.remove(function(item) {
				return item.substring(0, 3) === 'id:';
			}).join(', ');
		}
	});

	ON('save.httproute', function(component, options) {
		!component.name && (component.name = options.method + ' ' + options.url);
	});
</script>`;

exports.install = function(instance) {

	var id, params;

	instance.custom.action = function() {

		var data = {
			query: this.query,
			body: this.body,
			session: this.session,
			user: this.user,
			files: this.files
		};

		if (params.length) {
			data.params = {};
			for (var i = 0, length = arguments.length; i < length; i++)
				data.params[params[i]] = arguments[i];
		}

		data = instance.make(data);

		if (instance.options.emptyresponse) {
			instance.status('200 OK');
			setTimeout(self => self.plain(), 100, this);
		} else
			data.set('controller', this);

		instance.send(data);
	};

	instance.reconfigure = function() {

		var options = instance.options;

		if (!options.url) {
			instance.status('Not configured', 'red');
			return;
		}

		if (typeof(options.flags) === 'string')
			options.flags = options.flags.split(',').trim();

		id && UNINSTALL('route', id);
		id = 'id:' + instance.id;
		params = [];
		options.url.split('/').forEach(param => param[0] === '{' && params.push(param.substring(1, param.length - 1).trim()));

		var flags = options.flags || [];
		flags.push(id);
		flags.push(options.method.toLowerCase());

		F.route(options.url, instance.custom.action, flags, options.size || 5);
		instance.status('Listening', 'green');
	};

	instance.reconfigure();
	instance.on('options', instance.reconfigure);

	instance.on('close', function(){
		id && UNINSTALL('route', id);
	});
};