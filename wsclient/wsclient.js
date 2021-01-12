exports.id = 'wsclient';
exports.title = 'WebSocket Client';
exports.group = 'WebSocket';
exports.color = '#97c5ff';
exports.input = true;
exports.output = true;
exports.author = 'Martin Smola';
exports.icon = 'comment';
exports.version = '1.0.1';
exports.options = {  };

exports.html = `<div class="padding">
	<div class="row m">
		<div class="col-md-3">
			<div data-jc="textbox" data-jc-path="ip" data-jc-config="placeholder:echo.websocket.org;required:true">@(Host or IP address)</div>
			<div class="help m">@()</div>
		</div>
		<div class="col-md-3">
			<div data-jc="textbox" data-jc-path="port" data-jc-config="placeholder:80">@(Port) (@(optional), @(default is 80))</div>
		</div>
		<div class="col-md-3">
			<div data-jc="textbox" data-jc-path="url" data-jc-config="placeholder:/">@(URL) (@(optional), @(default is /))</div>
		</div>
	</div>
	<div class="row m">
		<div class="col-md-3">
			<div data-jc="checkbox" data-jc-path="secure">@(Secure (will use wss://))</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-3">
			<div data-jc="dropdown" data-jc-path="datatype" data-jc-config="items:,JSON|json,Plain text|text" class="m">@(Data type)</div>
			<div class="help m">@(JSON is default, also if JSON is used then bellow parser is ignored)</div>
		</div>
	</div>
	<div data-jc="codemirror" data-jc-path="parser" data-jc-config="type:javascript;height:250;tabs:true;trim:true" class="m">@(Parser)</div>
</div>`;

exports.readme = `# WebSocket Client
## Documentation
https://docs.totaljs.com/latest/en.html#api~WebSocketClient

## Input
Input is used to send message to the server

## Output
All recieved messages are send to the output`;

exports.install = function(instance) {

	var wsclient;

	instance.on('data', function(flowdata) {
		var data = flowdata.data;

		// if (parser)
		// 	data = parser(flowdata.data, instance, flowdata, instance.options, flowdata.repository, require);
		//console.log(wsclient);
		wsclient && wsclient.send(data);
	});

	instance.reconfigure = function() {
		var opt = instance.options;

		instance.status('');

		// try {
		// 	if (opt.parser) {
		// 		var parser = 'var send = function(index, value) { if (options.keepmessage) { flowdata.data = value; instance.send2(index, flowdata); } else instance.send2(index, value);};' + opt.code;
		// 		parser = new Function('value', 'instance', 'flowdata', 'options', 'repository', 'require', parser);
		// 	}
		// } catch (e) {
		// 	parser = null;
		// 	instance.error('Code: ' + e.message);
		// 	instance.status('Config error', 'red');
		// }

		if (!opt.ip)
			return instance.status('Not configured', 'red');

		if (!opt.port)
			opt.port = '80';

		opt.url = opt.url || '/';
		if (opt.url[0] !== '/')
			opt.url = '/' + opt.url;

		connect();
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();

	function connect() {

		if (wsclient && wsclient.socket) {
			wsclient.options.reconnect = false;
			wsclient.close();
			setTimeout(function(){
				wsclient.free();
				wsclient.removeAllListeners();
				wsclient = null;
				connect();
			}, 500);
			return;
		}

		WEBSOCKETCLIENT(function(client) {

			wsclient = client;

			var opt = instance.options;
			var server = (opt.secure ? 'wss://' : 'ws://') + opt.ip + ':' + opt.port + opt.url;

			instance.status('Connecting...');

			client.connect(server);

			client.on('open', function(err) {
				instance.status('Connected');
			});

			client.on('close', function(err) {
				instance.status('Closed');
			});

			client.on('message', function(message) {
				instance.send(message);
			});

			client.on('error', function(err) {
				instance.throw({ server: server, error: err });
				setTimeout(connect, 3000);
				instance.status(err.code);
			});

			// Default options:
			client.options.type = opt.datatype || 'json';
			client.options.reconnect = 3000;
			// client.options.compress = true;
			// client.options.encodedecode = true;

		});
	}

	instance.on('close', function() {
		if (wsclient && wsclient.socket) {
			wsclient.close();
			setTimeout(function(){
				wsclient.free();
				wsclient.removeAllListeners();
				wsclient = null;
			}, 500);
		}
	});
};
