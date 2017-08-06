exports.id = 'httprequest';
exports.title = 'HTTP Request';
exports.group = 'HTTP';
exports.color = '#5D9CEC';
exports.input = true;
exports.output = 1;
exports.author = 'Peter Širka';
exports.icon = 'cloud-upload';

exports.html = `<div class="padding">
	<div data-jc="textbox" data-jc-path="url" class="m" data-jc-config="required:true;maxlength:500;type:url;placeholder:@(E.g. https\\://www.totaljs.com)">@(URL address)</div>
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="dropdown" data-jc-path="method" data-jc-config="required:true;items:,GET,POST,PUT,DELETE">@(HTTP method)</div>
		</div>
		<div class="col-md-6 m">
			<div data-jc="dropdown" data-jc-path="stringify" data-jc-config="required:true;items:,URL encoded|encoded,JSON|json,RAW|raw">@(Serialization)</div>
		</div>
	</div>
	<div data-jc="checkbox" data-jc-path="chunks">@(Download the content <b>in chunks</b>)</div>
	<br />
	<section>
		<label><i class="fa fa-lock"></i>@(HTTP basic access authentication)</label>
		<div class="padding npb">
			<div class="row">
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="username">@(User)</div>
				</div>
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="userpassword" data-jc-config="type:password">@(Password)</div>
				</div>
			</div>
		</div>
	</section>
	<br />
	<div data-jc="keyvalue" data-jc-path="headers" data-jc-config="placeholderkey:@(Header name);placeholdervalue:@(Header value and press enter)" class="m">@(Custom headers)</div>
	<div data-jc="keyvalue" data-jc-path="cookies" data-jc-config="placeholderkey:@(Cookie name);placeholdervalue:@(Cookie value and press enter)" class="m">@(Cookies)</div>
</div>`;

exports.readme = `# Request

This component creates a request with received data.

__Response:__
\`{ data: 'STRING', headers: Object, status: Number, host: String }\``;

exports.install = function(instance) {

	var can = false;
	var flags = null;
	var headers = null;
	var cookies = null;

	instance.on('data', function(response) {
		can && instance.custom.send2(response);
	});

	instance.custom.send = function(response) {
		var options = instance.options;

		if (options.chunks) {
			U.download(options.url, flags, response.data, function(err, response) {
				response.on('data', (chunks) => instance.send2(chunks));
			}, cookies, headers);
		} else {
			U.request(options.url, flags, response.data, function(err, data, status, headers, host) {
				if (response && !err) {
					response.data = { data: data, status: status, headers: headers, host: host };
					instance.send2(response);
				} else if (err)
					instance.error(err, response);
			}, cookies, headers);
		}
	};

	instance.reconfigure = function() {
		var options = instance.options;
		can = options.url && options.url.isURL() && options.method && options.stringify ? true : false;
		instance.status(can ? '' : 'Not configured', can ? undefined : 'red');

		if (!can)
			return;

		flags = ['dnscache'];
		flags.push(options.method.toLowerCase());
		options.stringify === 'json' && flags.push('json');
		options.stringify === 'raw' && flags.push('raw');
		headers = null;
		cookies = null;

		options.headers && Object.keys(options.headers).forEach(function(key) {
			!headers && (headers = {});
			headers[key] = options.headers[key];
		});

		options.cookies && Object.keys(options.cookies).forEach(function(key) {
			!cookies && (cookies = {});
			cookies[key] = options.cookies[key];
		});

		if (options.username && options.userpassword) {
			!headers && (headers = {});
			headers['Authorization'] = 'Basic ' + U.createBuffer(options.username + ':' + options.userpassword).toString('base64');
		}
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};