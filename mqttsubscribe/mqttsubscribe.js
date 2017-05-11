exports.id = 'mqttsubscribe';
exports.title = 'MQTT subscribe';
exports.group = 'MQTT';
exports.color = '#656D78';
exports.version = '1.0.0';
exports.icon = 'clock-o';
exports.output = 1;
exports.author = 'Martin Smola';
exports.options = {};

exports.html = `
	<div class="padding">
		<div data-jc="dropdown" data-jc-path="broker" data-source="mqttconfig.brokers" class="m" data-required="true">@(Select a broker)</div>		
		<div data-jc="textbox" data-jc-path="topic" data-placeholder="hello/world" data-required="true" class="m">Topic</div>
		<div data-jc="dropdown" data-jc-path="qos" data-options=";0;1;2" class="m">@(QoS)</div>
	</div>
	<script>
		ON('open.mqttsubscribe', function(component, options) {
			TRIGGER('mqtt.brokers', 'mqttconfig.brokers');
		});
	</script>
`;

exports.readme = `
# MQTT subscribe


`;

exports.install = function(instance) {

	var added = false;
	var subscribed = false;
	var isWildcard = false;

	var MESSAGE = {
		topic: ''
	};
	instance.custom.reconfigure = function(o, old_options) {

		added = false;
		subscribed = false;

		if (!MQTT.broker(instance.options.broker)) {
			return instance.status('No broker', 'red');
		}

		if (instance.options.broker && instance.options.topic) {

			isWildcard = instance.options.topic.endsWith('#');

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
		};


	};

	function message(brokerid, topic, message) {
		if (brokerid !== instance.options.broker)
			return;

		if (isWildcard) {
			if (!topic.startsWith(instance.options.topic.substring(0, instance.options.topic.length - 1)))
				return;
		} else {
			if (instance.options.topic !== topic)
				return;
		}
		MESSAGE.topic = topic;
		MESSAGE.data = message;
		instance.send(MESSAGE);
	};

	instance.custom.reconfigure();
};
