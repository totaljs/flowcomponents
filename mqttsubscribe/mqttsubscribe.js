exports.id = 'mqttsubscribe';
exports.title = 'MQTT subscribe';
exports.group = 'MQTT';
exports.color = '#888600';
exports.version = '1.0.0';
exports.icon = 'clock-o';
exports.output = 1;
exports.author = 'Martin Smola';
exports.options = {};

exports.html = `<div class="padding">
	<div data-jc="dropdown" data-jc-path="broker" data-jc-config="datasource:mqttconfig.brokers;required:true" class="m">@(Select a broker)</div>
	<div data-jc="textbox" data-jc-path="topic" data-jc-config="placeholder:hello/world;required:true" class="m">Topic</div>
	<div data-jc="dropdown" data-jc-path="qos" data-jc-config="items:,0,1,2" class="m">@(QoS)</div>
</div>
<script>
	var mqttconfig = { brokers: [] };
	ON('open.mqttsubscribe', function(component, options) {
		TRIGGER('mqtt.brokers', 'mqttconfig.brokers');
	});
	ON('save.mqttsubscribe', function(component, options) {
		!component.name && (component.name = options.broker + ' -> ' + options.topic);
	});
</script>`;

exports.readme = `
# MQTT subscribe
`;

exports.install = function(instance) {

	var added = false;
	var subscribed = false;
	var isWildcard = false;
	var rtopic = ''; // root topic => 'test' for 'test/#'
	var wtopic = ''; // wild topic => 'test/' for 'test/#' 

	instance.custom.reconfigure = function(o, old_options) {

		added = false;
		subscribed = false;

		if (!MQTT.broker(instance.options.broker))
			return instance.status('No broker', 'red');

		if (instance.options.broker && instance.options.topic) {

			isWildcard = instance.options.topic.endsWith('#');
			if (isWildcard) {
				rtopic = instance.options.topic.substring(0, instance.options.topic.length - 2);
				wtopic = instance.options.topic.substring(0, instance.options.topic.length - 1);
			}

			if (!added)
				MQTT.add(instance.options.broker);

			if (!subscribed)
				MQTT.subscribe(instance.options.broker, instance.id, instance.options.topic);

			if (old_options && (instance.options.topic !== old_options.topic || instance.options.qos !== old_options.qos)) {
				MQTT.unsubscribe(instance.options.broker, instance.id, old_options.topic);
				MQTT.subscribe(instance.options.broker, instance.id, instance.options.topic, instance.options.qos);
			}

			added = true;
			subscribed = true;
			return;
		}

		instance.status('Not configured', 'red');
	};

	instance.on('options', instance.custom.reconfigure);

	instance.on('close', function() {
		MQTT.unsubscribe(instance.options.broker, instance.id, instance.options.topic);
		MQTT.remove(instance.options.broker, instance.id);
		OFF('mqtt.brokers.message', message);
		OFF('mqtt.brokers.status', brokerstatus);
	});

	ON('mqtt.brokers.message', message);
	ON('mqtt.brokers.status', brokerstatus);

	function brokerstatus(status, brokerid, msg) {
		if (brokerid !== instance.options.broker)
			return;

		switch (status) {
			case 'connecting':
				instance.status('Connecting', '#a6c3ff');
				break;
			case 'connected':
				// re-subscibe on reconnect
				MQTT.subscribe(instance.options.broker, instance.id, instance.options.topic);
				instance.status('Connected', 'green');
				break;
			case 'disconnected':
				instance.status('Disconnected', 'red');
				break;
			case 'connectionfailed':
				instance.status('Connection failed', 'red');
				break;
			case 'new':
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

	function message(brokerid, topic, message) {
		if (brokerid !== instance.options.broker)
			return;

		if (isWildcard) {
			if (topic !== rtopic && !topic.startsWith(wtopic))
				return;
		} else {
			if (instance.options.topic !== topic)
				return;
		}

		instance.send2({ topic: topic, data: message });
	}

	instance.custom.reconfigure();
};
