exports.id = 'httpredirect';
exports.title = 'HTTP Redirect';
exports.group = 'HTTP';
exports.color = '#5D9CEC';
exports.icon = 'exchange';
exports.input = false;
exports.output = 1;
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.cloning = false;
exports.options = { redirect: {}, permanent: false, path: true };
exports.readme = `# HTTP Redirect

Creates a Total.js redirect for GET requests. __IMPORTANT__: data are sent only while the request is redirected on a relative URL address.

\`\`\`javascript
{
	query: { msg: 'Hello' }, // parsed query string, e.g. /test/1?msg=Hello
	headers: {}, // Header keys
	uri: {}, // Parsed URL,
	url: '' // Relative URL
}
\`\`\``;

exports.html = `<div class="padding">
	<div data-jc="keyvalue" data-jc-path="redirect" data-jc-config="placeholderkey:@(From URL);placeholdervalue:@(To URL and press enter)">@(Redirect to)</div>
	<div class="help m">@(You can type relative or absolute URL address)</div>
	<div data-jc="checkbox" data-jc-path="path">Copy path</div>
	<div data-jc="checkbox" data-jc-path="permanent">Enable permanent redirect (301)</div>
</div>`;

exports.install = function(instance) {

	var old = [];
	var configured = false;

	instance.custom.uninstall = function() {
		for (var i = 0; i < old.length; i++) {
			if (F.routes.redirects[old[i]]) {
				delete F.routes.redirects[old[i]];
				var index = F.owners.findIndex('id', old[i]);
				index !== -1 && F.owners.splice(index, 1);
			}
		}
		UNINSTALL('route', 'id:' + instance.id);
	};

	instance.custom.reconfigure = function() {

		// Remove previous redirects
		configured && instance.custom.uninstall();

		var keys = Object.keys(instance.options.redirect);
		for (var i = 0; i < keys.length; i++) {

			configured = true;

			var a = keys[i];
			var b = instance.options.redirect[keys[i]];

			var p = a.substring(0, 6);
			if (p === 'http:/' || p === 'https:') {
				if (a[a.length - 1] === '/')
					a = a.substring(0, a.length - 1);
				old.push(a);
				F.redirect(a, b, instance.options.path, instance.options.permanent);
			} else {
				if (a[0] !== '/')
					a = '/' + a;
				(function(a, b, instance) {
					ROUTE(a, function() {

						if (instance.hasConnections) {
							var data = {};
							data.query = this.query;
							data.url = this.url;
							data.uri = this.uri;
							data.headers = this.req.headers;
							instance.send2(data);
						}

						if (b.startsWith('http://') || b.startsWith('https://')) {
							this.redirect(b + this.href(), instance.options.permanent);
							return;
						}
						if (b[0] !== '/')
							b = '/' + b;
						this.redirect(b + this.href(), instance.options.permanent);
					}, ['id:' + instance.id]);
				})(a, b, instance);
			}
		}
	};

	instance.custom.reconfigure();
	instance.on('options', instance.custom.reconfigure);
	instance.on('close', () => configured && instance.custom.uninstall());
};