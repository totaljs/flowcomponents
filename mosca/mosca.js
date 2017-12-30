exports.id = 'mqttserver';
exports.title = 'MQTT server (Mosca)';
exports.group = 'MQTT';
exports.color = '#888600';
exports.version = '1.0.0';
exports.icon = 'clock-o';
exports.input = false;
exports.output = ['green', 'red', 'white'];
exports.author = 'Martin Smola';
exports.options = { host: '127.0.0.1', port: 1883, ws: false, portws: 1884 };
exports.traffic = false;
exports.npm = ['mosca'];

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="host" data-jc-config="placeholder:127.0.0.1" class="m">Hostname or IP address (default 127.0.0.1)</div>
		</div>
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="port" data-jc-config="placeholder:1883" class="m">Port (1883 by default)</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6">
			<div data-jc="checkbox" data-jc-path="ws" data-jc-config="placeholder:127.0.0.1" class="m">Enable mqqt over websockets?</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="portws" data-jc-config="placeholder:1884" class="m">Websocket port (1884 by default)</div>
		</div>
	</div>
</div>`;

exports.readme = `
# MQTT Broker

Uses Mosca https://github.com/mcollina/mosca

## Outputs
- (green) new client connected --> (object) client
- (red) client disconnected    --> (object) client
- (white) new message          --> (object) { packet, client }
`;

exports.install = function(instance) {
	var mosca = require('mosca');
	var server;

	instance.custom.start_server = function(){
		var options = instance.options;

		var settings = { 
			host: options.host,
			port: options.port || 1883, 
			interfaces: [{
					type: 'mqtt',
					port: options.port || 1883
				}]
		};

		if (options.ws)
			settings.interfaces.push({
				type: 'http',
				port: options.portws || 1884
			});

		var server = new mosca.Server(settings);

		server.on('ready', function() {
			var status = 'mgtt {0}:{1}'.format(options.host, options.port);
			if (options.ws)
				status += ' | ws port {0}'.format(options.portws);
			instance.status(status);
		});

		server.on('clientConnected', function(client) {
			instance.send2(0, {
				id: client.id
			});
		});

		server.on('clientDisconnected', function(client) {
			instance.send2(1, {
				id: client.id
			});
		});

		// fired when a message is received
		server.on('published', function(packet) {
			packet.payload = packet.payload.toString();

			if (packet.payload[0] === '{') {
				TRY(function() {
					packet.payload = JSON.parse(packet.payload);
				});
			}

			instance.send2(2, packet);
		});
	};

	instance.custom.reconfigure = function(options, old_options) {

		if (server && options !== old_options)
			server.close(() => setTimeout(instance.custom.start_server, 100));
		else
			instance.custom.start_server();
	};

	instance.on('close', function(){
		server && server.close();
	});

	instance.on('options', instance.custom.reconfigure);

	instance.custom.reconfigure();
};
