exports.id = 'wsserver';
exports.title = 'WebSocket Server';
exports.group = 'WebSocket';
exports.color = '#97c5ff';
exports.input = 2;
exports.output = 1;
exports.author = 'Martin Smola';
exports.icon = 'comments';
exports.version = '1.0.3';
exports.options = {  };
exports.cloning = false;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-6">
			<div data---="textbox__url__placeholder:/ws">@(URL) (@(default is) /)</div>
			<div class="help m">@(Optional, only use if you intend to use multiple endpoints)</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-3">
			<div data---="dropdown__datatype__items:,JSON|json,Plain text|raw" class="m">@(Data type) (@(default is) json)</div>
		</div>
	</div>
</div>`;

exports.readme = `# WebSocket Server
## Input

- #1 > broadcast a message to all clients
- #2 > send a message to a specific client by ID (use id or find method \`{ id: <some-id>, find: function..., data: <data-to-send> }\`)

## Output

All recieved messages are send to the output

## Documentation

- https://docs.totaljs.com/total4/5a794001yw51c/`;

exports.install = function(instance) {

	var id = 'id:' + instance.id;
	var route;
	var ws;

	// broadcast to all clients
	instance.on('0', function(flowdata) {
		ws && ws.send(flowdata.data);
	});

	// send to a specific client by ID
	instance.on('1', function(flowdata) {

		var id = flowdata.data.id;
		var find = flowdata.data.find;

		var client  = ws.find(id || find);
		if (client)
			client.send(flowdata.data.data);
		else
			instance.log('Client{0} not found.'.format(' ' + id || '')).debug('Client{0} not found.'.format(' ' + id || ''));

	});

	instance.reconfigure = function() {

		ws && ws.destroy(function() {
			ws = null;
			instance.status('Destroyed');
		});

		if (F.is4) {
			route && route.remove();
			route = null;
		} else
			UNINSTALL('websocket', id);

		createws();
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();

	function createws() {

		instance.status('No client connected');

		if (F.is4)
			route = ROUTE('SOCKET ' + instance.options.url || '/', [instance.options.datatype || 'json']);
		else
			F.websocket(instance.options.url || '/', wshandler, [instance.options.datatype || 'json', id]);
	}

	function wshandler() {
		ws = this;

		ws.autodestroy(function() {
			ws = null;
			instance.status('No client connected');
		});

		ws.on('open', function() {
			instance.status('{0} client(s) connected'.format(ws && ws.online || '0'));
		});

		ws.on('close', function() {
			instance.status('{0} client(s) connected'.format(ws && ws.online || '0'));
		});

		ws.on('message', function(client, message) {
			var flowdata = instance.make(message);
			flowdata.repository.client = client;
			instance.send(flowdata);
		});

		ws.on('error', function(err) {
			instance.throw(err);
		});
	}

	instance.on('close', function() {
		if (F.is4) {
			route && route.remove();
			route = null;
		} else if (id)
			UNINSTALL('websocket', id);
	});
};
