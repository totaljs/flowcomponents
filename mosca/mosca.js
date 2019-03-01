exports.id = 'mqttserver';
exports.title = 'MQTT server(Mosca)';
exports.group = 'MQTT';
exports.color = '#888600';
exports.version = '1.1.0';
exports.icon = 'server';
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
	<div class="row">
		<!--<div class="col-md-4">
			<div data-jc="textbox" data-jc-path="secureport" data-jc-config="placeholder:1883" class="m">Secure port (8443 by default)</div>
		</div>-->
		<div class="col-md-4">
			<div data-jc="textbox" data-jc-path="username" data-jc-config="" class="m">Username</div>
		</div>
		<div class="col-md-4">
			<div data-jc="textbox" data-jc-path="password" data-jc-config="type:password" class="m">Password</div>
		</div>
	</div>
</div>
<script>
	ON('save.mqttserver', function(component, options) {
		!component.name && (component.name = options.host);

		var builder = [];
		builder.push('### @(Configuration)');
		builder.push('');
		builder.push('- @(Host): ' + options.host);
		builder.push('- @(Port): ' + options.port);
		builder.push('- @(Enable WebSockets): ' + options.ws);
		builder.push('- @(WebSockets port): ' + options.portws);
		builder.push('');
		builder.push('**Authorization**');
		builder.push('- @(Username): ' + options.username);
		builder.push('- @(Password): -------');
		component.notes = builder.join('\\n');
		console.log('NOTES', component.notes);
	});
</script>`;

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
			interfaces: [{ type: 'mqtt', port: options.port || 1883 }]
		};

		if (options.ws)
			settings.interfaces.push({
				type: 'http',
				port: options.portws || 1884
			});

		// 	settings.secure = {
		// 		port: options.secureport,
		// 		keyPath: 'key.pem',
		// 		certPath: 'cert.pem',
		// 	};

		var authenticate = function(client, username, password, callback) {
			var authorized = (options.username === username && options.password === password.toString());
			if (authorized) client.user = username;
			callback(null, authorized);
		};

		server = new mosca.Server(settings, function(err){
			if (err)
				instance.throw(err);
		});

		server.on('ready', function() {
			var auth = 'no';
			if (options.username && options.password) {
				server.authenticate = authenticate;
				auth = 'yes';
			}

			var status = 'auth:{0} | mgtt:{1}'.format(auth, options.port);
			if (options.ws)
				status += ' | ws:{0}'.format(options.portws);
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

	instance.custom.reconfigure = function() {
		server && server.close();
		setTimeout(instance.custom.start_server, 100);
	};

	instance.on('close', function(){
		server && server.close();
	});

	instance.on('options', instance.custom.reconfigure);
	instance.custom.reconfigure();
};
