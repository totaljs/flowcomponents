exports.id = 'httprequest';
exports.title = 'HTTP Request';
exports.group = 'HTTP';
exports.color = '#5D9CEC';
exports.input = true;
exports.version = '2.0.3';
exports.output = 1;
exports.author = 'Peter Širka';
exports.icon = 'cloud-upload';

exports.html = `<div class="padding">
	<div data-jc="textbox" data-jc-path="url" class="m" data-jc-config="required:true;maxlength:500;placeholder:@(E.g. https\\://www.totaljs.com)">@(URL address)</div>
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="dropdown" data-jc-path="method" data-jc-config="required:true;items:,GET,POST,PUT,DELETE">@(HTTP method)</div>
		</div>
		<div class="col-md-6 m">
			<div data-jc="dropdown" data-jc-path="stringify" data-jc-config="required:true;items:,URL encoded|encoded,JSON|json,RAW|raw,None|none">@(Serialization)</div>
		</div>
	</div>
	<div data-jc="checkbox" data-jc-path="chunks">@(Download the content <b>in chunks</b>)</div>
	<div data-jc="checkbox" data-jc-path="persistentcookies">@(Keep persistent cookies)</div>
	<div data-jc="checkbox" data-jc-path="nodns">@(Disable DNS cache)</div>
	<div data-jc="checkbox" data-jc-path="keepalive">@(Keep alive connection)</div>
</div>
<hr class="nmt nmb" />
<div class="padding">
	<div data-jc="keyvalue" data-jc-path="headers" data-jc-config="placeholderkey:@(Header name);placeholdervalue:@(Header value and press enter)" class="m">@(Custom headers)</div>
	<div data-jc="keyvalue" data-jc-path="cookies" data-jc-config="placeholderkey:@(Cookie name);placeholdervalue:@(Cookie value and press enter)">@(Cookies)</div>
</div>
<div class="padding bg-smoke">
	<section>
		<label><i class="fa fa-lock"></i>@(HTTP basic access authentication)</label>
		<div class="padding npb">
			<div class="row">
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="username">@(User)</div>
				</div>
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="userpassword">@(Password)</div>
				</div>
			</div>
		</div>
	</section>
</div>`;

exports.readme = `# Request

This component creates a request with received data.

__Response:__
\`\`\`javascript
{
	data: String,
	headers: Object,
	status: Number,
	host: String
}
\`\`\`

__Dynamic arguments__:
Are performed via FlowData repository and can be used for URL address or for custom headers/cookies/auth. Use \`repository\` component for creating of dynamic arguments. Dynamic values are replaced in the form \`{key}\`:

- url address e.g. \`https://.../{key}/\`
- headers values e.g. \`{token}\`
- cookies values e.g. \`{token}\``;

exports.install = function(instance) {

	var can = false;
	var flags = null;
	var cookies2 = null;

	instance.on('data', function(response) {
		can && instance.custom.send(response);
	});

	instance.custom.send = function(response) {
		var options = instance.options;

		var headers = null;
		var cookies = null;

		if (options.headers) {
			for (var key in options.headers) {
				!headers && (headers = {});
				headers[key] = response.arg(options.headers[key]);
			}
		}

		if (options.username && options.userpassword) {
			!headers && (headers = {});
			headers.Authorization = 'Basic ' + U.createBuffer(response.arg(options.username + ':' + options.userpassword)).toString('base64');
		}

		if (options.cookies) {
			for (var key in options.cookies) {
				!cookies && (cookies = {});
				cookies[key] = response.arg(options.cookies[key]);
			}
		}

		if (F.is4) {

			if (options.chunks) {
				options.custom = true;
				options.callback = function(err, response) {
					if (err)
						instance.error(err);
					else if (response && response.stream)
						response.stream.on('data', (chunks) => instance.send2(chunks));
				};
			} else {
				options.callback = function(err, response) {
					if (response && !err) {
						var msg = { data: response.body, status: response.status, headers: response.headers, host: response.host, cookies: response.cookies };
						instance.send2(msg);
					} else if (err)
						instance.error(err, response);
				};
			}

			switch (options.stringify) {
				case 'json':
					options.body = JSON.stringify(response.data);
					options.type = 'json';
					break;
				case 'raw':
					options.body = response.data instanceof Buffer ? response.data : Buffer.from(response.data);
					options.type = 'raw';
					break;
				case 'encoded':
					options.body = U.toURLEncode(response.data);
					options.type = 'urlencoded';
					break;
			}

			REQUEST(options);

		} else {
			if (options.chunks) {
				U.download(response.arg(options.url), flags, options.stringify === 'none' ? null : response.data, function(err, response) {
					response.on('data', (chunks) => instance.send2(chunks));
				}, cookies || cookies2, headers);
			} else {
				U.request(response.arg(options.url), flags, options.stringify === 'none' ? null : response.data, function(err, data, status, headers, host) {
					if (response && !err) {
						response.data = { data: data, status: status, headers: headers, host: host };
						instance.send2(response);
					} else if (err)
						instance.error(err, response);
				}, cookies || cookies2, headers);
			}
		}
	};

	instance.reconfigure = function() {
		var options = instance.options;
		can = options.url && options.url && options.method && options.stringify ? true : false;
		instance.status(can ? '' : 'Not configured', can ? undefined : 'red');

		if (!can)
			return;

		if (F.is4) {

			flags = {};
			flags.method = options.method.toUpperCase();

			if (!options.nodns)
				flags.resolve = true;

			flags.keepalive = options.keepalive;

			if (options.stringify && options.stringify !== 'none')
				options.type = options.stringify;

			if (options.persistentcookies) {
				flags.cook = true;
				cookies2 = {};
			} else
				cookies2 = null;

		} else {
			flags = [];
			flags.push(options.method.toLowerCase());
			options.stringify === 'json' && flags.push('json');
			options.stringify === 'raw' && flags.push('raw');
			options.keepalive && flags.push('keepalive');
			!options.nodns && flags.push('dnscache');
			if (options.persistentcookies) {
				flags.push('cookies');
				cookies2 = {};
			} else
				cookies2 = null;
		}
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};