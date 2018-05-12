exports.id = 'wsserver';
exports.title = 'WebSocket Server';
exports.group = 'WebSocket';
exports.color = '#97c5ff';
exports.input = 2;
exports.output = 1;
exports.author = 'Martin Smola';
exports.icon = 'comments';
exports.version = '1.0.0';
exports.options = {  };
exports.cloning = false;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="url" data-jc-config="placeholder:/ws">@(URL) (@(default is) /)</div>
			<div class="help m">@(Optional, only use if you intend to use multiple endpoints)</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-3">
			<div data-jc="dropdown" data-jc-path="datatype" data-jc-config="items:,JSON|json,Plain text|raw" class="m">@(Data type) (@(default is) json)</div>
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
https://docs.totaljs.com/latest/en.html#api~WebSocketClient
`;

exports.install = function(instance) {

	var id = 'id:' + instance.id;
	var ws;

	// broadcast to all clients
	instance.on('0', function(flowdata) {

		ws && ws.send(flowdata.data);

	});

	// send to a specific client by ID
	instance.on('1', function(flowdata) {

		var id = flowdata.data.id;
		var find = flowdata.data.find;
		var data = flowdata.data.data;

		var client  = ws.find(id || find);

		if (client)
			client.send(flowdata.data.data);
		else
			instance.log('Client{0} not found.'.format(' ' + id || '')).debug('Client{0} not found.'.format(' ' + id || ''));

	});

	instance.reconfigure = function() {

		if (ws) {
			ws.destroy(function() {
				ws = null;	
				instance.status('Destroyed');	
			});
		}

		UNINSTALL('websocket', id);

		createws();

	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();

	function createws() {
		instance.status('No client connected');
		F.websocket(instance.options.url || '/', wshandler, [instance.options.datatype || 'json', id]);
	}

	function wshandler() {
		ws = this;

		ws.autodestroy(function() {
			ws = null;	
			instance.status('No client connected');	
		});

		ws.on('open', function(client) {
			instance.status('{0} client(s) connected'.format(ws && ws.online || '0'));
		});

		ws.on('close', function(client) {
			instance.status('{0} client(s) connected'.format(ws && ws.online || '0'));
		});

		ws.on('message', function(client, message) {
			var flowdata = instance.make(message);
			flowdata.repository.client = client;
			instance.send(flowdata);
		});

		ws.on('error', function(err, client) {
			instance.throw(err);
		});
	}

	instance.on('close', function(){
		id && UNINSTALL('websocket', id);
	});
};
