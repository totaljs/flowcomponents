exports.id = 'mqttpublish';
exports.title = 'MQTT publish';
exports.group = 'MQTT';
exports.color = '#888600';
exports.version = '1.1.0';
exports.icon = 'sign-out';
exports.input = true;
exports.output = 1;
exports.author = 'Martin Smola';
exports.options = {};

exports.html = `<div class="padding">
	<div data-jc="dropdown" data-jc-path="broker" data-jc-config="datasource:mqttconfig.brokers;required:true" class="m">@(Brokers)</div>
	<div data-jc="textbox" data-jc-path="topic" data-jc-config="placeholder:hello/world">Topic</div>
	<div class="help m">@(Supports variables, example: \`device/{device-id}\`)</div>
	<div data-jc="textbox" data-jc-path="staticmessage" data-jc-config="placeholder:123">Static message(string)</div>
	<div class="help m">@(Supports variables), @(If specified then incoming data are ignored and this message is sent instead. Topic is required if static message is defined.)</div>
	<div data-jc="dropdown" data-jc-path="qos" data-jc-config="items:,0,1,2" class="m">@(QoS)</div>
	<div data-jc="checkbox" data-jc-path="retain" class="m">@(Retain)</div>
</div>
<script>
	var mqttconfig = { brokers: [] };
	ON('open.mqttpublish', function(component, options) {
		TRIGGER('mqtt.brokers', 'mqttconfig.brokers');
	});
	ON('save.mqttpublish', function(component, options) {
		!component.name && (component.name = options.broker + (options.topic ? ' -> ' + options.topic : ''));
	});
</script>`;

exports.readme = `# MQTT publish

If the topic field is left empty and the data object does not have a 'topic' property then nothing is send.
Also if data object has a valid topic property it is assumed the object also have data property which is send as a payload;
Example:
\`\`\`javacsript
{
	topic: '/topic',
	data: {
		hello: 'world'
	}
}
// in above case only { hello: 'world' } is published
\`\`\`

If the topic field is not empty then the entire incomming data object is passed to the output.`;


exports.install = function(instance) {

	var PUBLISH_OPTIONS = {};

	var ready = false;

	instance.custom.reconfigure = function() {

		ready = false;

		if (!MQTT.broker(instance.options.broker))
			return instance.status('No broker', 'red');

		if (instance.options.broker) {

			MQTT.add(instance.options.broker, instance.id);
			ready = true;
			PUBLISH_OPTIONS.retain = instance.options.retain || false;
			PUBLISH_OPTIONS.qos = parseInt(instance.options.qos || 0);
			return;
		}

		instance.status('Not configured', 'red');
	};

	instance.on('options', instance.custom.reconfigure);

	instance.on('data', function(flowdata) {
		if (!ready)
			return;
		var msg = instance.options.staticmessage ? instance.arg(instance.options.staticmessage) : flowdata.data;
		var topic = instance.arg(instance.options.topic || msg.topic);
		if (topic) {
			if (msg.topic)
				msg = msg.data;
			MQTT.publish(instance.options.broker, topic, msg, PUBLISH_OPTIONS);
		} else
			instance.debug('MQTT publish no topic');

		instance.send(flowdata);
	});

	instance.on('close', function() {
		MQTT.remove(instance.options.broker, instance.id);
		OFF('mqtt.brokers.status', instance.custom.brokerstatus);
	});


	instance.custom.brokerstatus = function(status, brokerid, msg) {
		if (brokerid !== instance.options.broker)
			return;

		switch (status) {
			case 'connecting':
				instance.status('Connecting', '#a6c3ff');
				break;
			case 'connected':
				instance.status('Connected', 'green');
				break;
			case 'disconnected':
				instance.status('Disconnected', 'red');
				break;
			case 'connectionfailed':
				instance.status('Connection failed', 'red');
				break;
			case 'new':
				!ready && instance.custom.reconfigure();
				break;
			case 'removed':
				instance.custom.reconfigure();
				break;
			case 'error':
				instance.status(msg, 'red');
				break;
			case 'reconfigured':
				instance.options.broker = msg;
				instance.reconfig();
				instance.custom.reconfigure();
				break;
		}
	}

	ON('mqtt.brokers.status', instance.custom.brokerstatus);
	
	instance.custom.reconfigure();
};
