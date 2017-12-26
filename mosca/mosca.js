exports.id = 'mqttserver';
exports.title = 'MQTT server (Mosca)';
exports.group = 'MQTT';
exports.color = '#656D78';
exports.version = '1.0.0';
exports.icon = 'clock-o';
exports.input = false;
exports.output = ['green', 'red', 'white'];
exports.author = 'Martin Smola';
exports.options = {};
exports.traffic = false;
exports.npm = ['mosca'];

exports.html = `<div class="padding">
	<section>
		<label><i class="fa fa-exchange"></i>@(MQTT server (Mosca))</label>
		<div class="padding npb">
			<div class="row">
				<!--<div class="col-md-6">
					<div data-jc="textbox" data-jc-path="host" data-jc-config="placeholder:127.0.0.1" class="m">Hostname or IP address</div>
				</div>-->
				<div class="col-md-6">
					<div data-jc="textbox" data-jc-path="port" data-jc-config="placeholder:1883" class="m">Port (1883 by default)</div>
				</div>
			</div>
		</div>
		<div class="padding npb">
			<div class="row">
				<div class="col-md-6">
					<div data-jc="checkbox" data-jc-path="ws" data-jc-config="placeholder:127.0.0.1" class="m">Enable mqqt over websockets?</div>
				</div>
				<div class="col-md-6">
					<div data-jc="textbox" data-jc-path="portws" data-jc-config="placeholder:1884" class="m">Port (1884 by default)</div>
				</div>
			</div>
		</div>
	</section>
</div>`;

exports.readme = `
# MQTT Broker

Uses Mosca https://github.com/mcollina/mosca
`;

var mosca;

exports.install = function(instance) {
	mosca = require('mosca');
	var server;

	instance.custom.reconfigure = function(options, old_options) {

		if (server && options !== old_options)
			server.close(() => instance.custom.start_server());
		else
			instance.custom.start_server();
	};

	instance.on('close', server.close);
	instance.on('options', instance.custom.reconfigure);

	instance.custom.reconfigure();

	instance.custom.start_server = function(){
		var options = instance.options;

		var settings = { port: options.port || 1883, persistence: mosca.persistence.Memory };
		if (options.ws)
			settings.http = {
				http: {
    				port: options.portws || 1884,
    				bundle: true
    			}
			};
		var server = new mosca.Server(settings);

		server.on('ready', function() {
			instance.status('Running...');
		});

		server.on('clientConnected', function(client) {
			instance.send2(1, client);
		});

		server.on('clientDisconnected', function(client) {
			instance.send2(2, client);
		});

		// fired when a message is received
		server.on('published', function(packet, client) {
			instance.send2(3, packet, client);
		});
	};
};
