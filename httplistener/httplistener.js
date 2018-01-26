exports.id = 'httplistener';
exports.title = 'HTTP Listener';
exports.group = 'HTTP';
exports.color = '#5D9CEC';
exports.icon = 'exchange';
exports.output = 1;
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.options = { staticfiles: false };
exports.cloning = false;

exports.html = `<div class="padding">
	<div data-jc="checkbox" data-jc-path="staticfiles" class="m">@(Include static files)</div>
</div>`;

exports.readme = `# HTTP Listener

Can capture all received requests.

\`\`\`javascript
response.body;      // Request body (POST/PUT/DELETE)
response.files;     // Uploaded files
response.id;        // Record ID (if exists)
response.ip;        // Current IP
response.method;    // String
response.path;      // Splitted path
response.query;     // Query string arguments
response.session;   // Session instance (if exists)
response.url;       // Current URL
response.user;      // User instance (if exists)
response.file;      // Is a static file?
response.extension; // File extension
\`\`\``;

exports.install = function(instance) {

	instance.custom.eventstaticfiles = function(req) {

		if (!U.isStaticFile(req.uri.pathname))
			return;

		var data = {};
		data.user = null;
		data.session = null;
		data.ip = req.ip;
		data.method = req.method;
		data.query = req.query;
		data.url = req.url;
		data.id = null;
		data.path = req.split;
		data.file = true;
		data.extension = U.getExtension(req.uri.pathname);
		instance.send2(data);
	};

	instance.custom.event = function(controller) {
		var data = {};
		data.user = controller.user;
		data.session = controller.session;
		data.ip = controller.ip;
		data.method = controller.method;
		data.body = controller.body;
		data.files = controller.files;
		data.query = controller.query;
		data.url = controller.url;
		data.id = controller.id;
		data.path = controller.req.split;
		data.file = false;
		data.extension = null;
		instance.send2(data);
	};

	ON('controller', instance.custom.event);

	instance.reconfigure = function() {
		var options = instance.options;
		if (options.staticfiles)
			ON('request', instance.custom.eventstaticfiles);
		else
			OFF('request', instance.custom.eventstaticfiles);
	};

	instance.on('close', function() {
		OFF('request', instance.custom.event);
		OFF('controller', instance.custom.event);
	});

	instance.reconfigure();
};