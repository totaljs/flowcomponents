exports.id = 'mqtt';
exports.title = 'MQTT broker';
exports.group = 'MQTT';
exports.color = '#888600';
exports.version = '1.0.1';
exports.icon = 'exchange';
exports.input = true;
exports.output = 0;
exports.author = 'Martin Smola';
exports.variables = true;
exports.options = { host: '127.0.0.1', port: 1883 };
exports.traffic = false;
exports.npm = ['mqtt'];

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="host" data-jc-config="placeholder:test.mosquitto.org;required:true" class="m">Hostname or IP address</div>
		</div>
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="port" data-jc-config="placeholder:1883;required:true" class="m">Port</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="clientid">@(Client id)</div>
			<div class="help m">@(Supports variables, example: \`client_{device-id}\`)</div>
			<div data-jc="checkbox" data-jc-path="secure" class="m">@(Secure (ssl))</div>
		</div>
	</div>
	<hr/>
	<div class="row">
		<div class="col-md-6">		
			<div data-jc="checkbox" data-jc-path="auth" class="m">@(Require Authorization)</div>
		</div>
	</div>
	<div class="row" data-bind="?.auth__show:value">
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="username" class="m">@(Username)</div>		
		</div>
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="password" data-jc-config="type:password" class="m">@(Password)</div>			
		</div>
	</div>
	<hr/>
	<div class="row">
		<div class="col-md-6">
			<div data-jc="checkbox" data-jc-path="lwt" class="m">@(LWT)</div>
		</div>
	</div>
	<div class="row" data-bind="?.lwt__show:value">
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="lwttopic">@(Last will topic)</div>
			<div class="help m">@(Supports variables, example: \`lwt/{device-id}\`)</div>
		</div>
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="lwtmessage">@(Last will message)</div>
			<div class="help m">@(Supports variables, example: \`{device-id} is offline\`)</div>
		</div>
	</div>
</div>
<script>
	ON('save.mqtt', function(component, options) {
		!component.name && (component.name = '{0} @ {1}:{2}'.format(options.username || '', options.host, options.port || '1883'));
	});
</script>`;

exports.readme = `
# MQTT Broker

## Input
Allows to change connection programaticaly
\`\`\`javascipt
{
	host: '1.2.3.4',
	port: '',
	secure: true/false,
	username: 'john',
	password: 'X',
	lwttopic: '',
	lwtmessage: '',
	clientid: ''
}
\`\`\`
`;

var MQTT_BROKERS = [];
var mqtt;

global.MQTT = {};

exports.install = function(instance) {

	var broker;

	mqtt = require('mqtt');

	instance.on('data', function(flowdata){
		var data= flowdata.data;
		var options = instance.options;

		if (data.host && data.port)
			return instance.custom.reconfigure(data, options);

		if (data.close === true)
			instance.close(NOOP);
	});

	instance.custom.reconfigure = function(o, old_options) {

		if (old_options)
			MQTT_BROKERS = MQTT_BROKERS.remove(function(b){
				return b.id === old_options.id;
			});

		var options = instance.options;

		if (!options.host || !options.port) {
			instance.status('Not configured', 'red');
			return;
		}

		options.id = (options.username || '') + '@' + options.host + ':' + options.port;

		if (broker) {
			broker.close();
			EMIT('mqtt.brokers.status', 'reconfigured', old_options.id, options.id);
		}

		instance.custom.createBroker();
	};

	instance.custom.createBroker = function() {

		ON('mqtt.brokers.status', brokerstatus);

		var o = instance.options;
		var opts = {
			host: o.host,
			port: o.port,
			id: o.id,
			secure: o.secure,
			rejectUnauthorized: false,
			reconnectPeriod: 3000,
			resubscribe: false
		};

		if (o.auth) {
			opts.username = o.username;
			opts.password = o.password;
		}

		if (o.lwt) {
			opts.will = {
				topic: instance.arg(o.lwttopic),
				payload: instance.arg(o.lwtmessage)
			}
		}

		if (o.clientid)
			opts.clientId = instance.arg(o.clientid);

		broker = new Broker(opts);
		MQTT_BROKERS.push(broker);

		instance.status('Ready');
	};

	instance.close = function(done) {

		broker && broker.close(function() {
			MQTT_BROKERS = MQTT_BROKERS.remove('id', instance.options.id);
			EMIT('mqtt.brokers.status', 'removed', instance.options.id);
		});

		OFF('mqtt.brokers.status', brokerstatus);

		done();
	};

	function brokerstatus(status, brokerid, err) {
		if (brokerid !== instance.options.id)
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
			case 'error':
				instance.error('MQTT Error, ID: ' + instance.id + '\n  ' + err);
				break;
		}
	}

	instance.on('options', instance.custom.reconfigure);
	instance.custom.reconfigure();
};

FLOW.trigger('mqtt.brokers', function(next) {
	var brokers = [''];
	MQTT_BROKERS.forEach(n => brokers.push(n.id));
	next(brokers);
});

MQTT.add = function(brokerid, componentid) {
	var broker = MQTT_BROKERS.findItem('id', brokerid);

	if (broker)
		broker.add(componentid);
};

MQTT.remove = function(brokerid, componentid) {
	var broker = MQTT_BROKERS.findItem('id', brokerid);
	broker && broker.remove(componentid);
};

MQTT.publish = function(brokerid, topic, data, options) {
	var broker = MQTT_BROKERS.findItem('id', brokerid);
	if (broker)
		broker.publish(topic, data, options);
	else
		EMIT('mqtt.brokers.status', 'error', brokerid, 'No such broker');
};

MQTT.subscribe = function(brokerid, componentid, topic, qos) {
	var broker = MQTT_BROKERS.findItem('id', brokerid);

	if (!broker)
		return;

	broker.add(componentid);
	broker.subscribe(componentid, topic, qos);
};

MQTT.unsubscribe = function(brokerid, componentid, topic, qos) {
	var broker = MQTT_BROKERS.findItem('id', brokerid);
	if (!broker)
		return;

	broker.unsubscribe(componentid, topic);
	broker.remove(componentid);
};

MQTT.broker = function(brokerid) {
	return MQTT_BROKERS.findItem('id', brokerid);
};

/*

	https://github.com/mqttjs/MQTT.js/blob/master/examples/client/secure-client.js

*/

/*
	TODO

	- add `birth` and `last will and testament` messages
	- add options to self.client.connect(broker [,options]); - credentials, certificate etc.


*/

function Broker(options) {
	var self = this;

	if (!options.host || !options.port)
		return false;

	self.connecting = false;
	self.connected = false;
	self.closing = false;
	self.components = [];
	self.subscribtions = {};
	self.id = options.id;
	self.options = options;
	setTimeout(function() {
		EMIT('mqtt.brokers.status', 'new', self.id);
	}, 500);
	return self;
}

Broker.prototype.connect = function() {

	var self = this;
	if (self.connected || self.connecting)
		return EMIT('mqtt.brokers.status', self.connected ? 'connected' : 'connecting', self.id);

	self.connecting = true;
	var broker = self.options.secure ? 'mqtts://' : 'mqtt://' + self.options.host + ':' + self.options.port;

	EMIT('mqtt.brokers.status', 'connecting', self.id);

	self.client = mqtt.connect(broker, self.options);

	self.client.on('connect', function() {
		self.connecting = false;
		self.connected = true;
		if (self.reconnecting) {
			EMIT('mqtt.brokers.status', 'reconnected', self.id);
			self.reconnecting = false;
			self.resubscribe();
		}
		EMIT('mqtt.brokers.status', 'connected', self.id);
	});

	self.client.on('reconnect', function() {
		self.connecting = true;
		self.connected = false;
		self.reconnecting = true;
		EMIT('mqtt.brokers.status', 'connecting', self.id);
	});

	self.client.on('message', function(topic, message) {
		message = message.toString();
		if (message[0] === '{') {
			TRY(function() {
				message = JSON.parse(message);
			}, () => FLOW.debug('MQTT: Error parsing data', message));
		}
		EMIT('mqtt.brokers.message', self.id, topic, message);
	});

	self.client.on('close', function(err) {
		if (err && err.toString().indexOf('Error')) {
			self.connecting = false;
			self.connected = false;
			EMIT('mqtt.brokers.status', 'error', self.id, err.code);
		}

		if (self.connected || !self.connecting) {
			self.connected = false;
			EMIT('mqtt.brokers.status', 'disconnected', self.id);
		} else if (self.connecting) {
			self.connecting = false;
			EMIT('mqtt.brokers.status', 'connectionfailed', self.id);
		}
	});

	self.client.on('error', function(err) {

		if (self.connecting) {
			self.client.end();
			self.connecting = false;
			EMIT('mqtt.brokers.status', 'error', self.id, err);
		}
	});

};

Broker.prototype.disconnect = function(reconnect) {
	var self = this;
	if (!self.closing)
		self.close(function(){
			reconnect && self.connect();
		});
};

Broker.prototype.close = function(callback) {
	var self = this;
	self.closing = true;

	if ((self.connected || self.connecting) && self.client && self.client.end)
		self.client.end(true, cb);
	else
		cb();

	function cb() {
		EMIT('mqtt.brokers.status', 'disconnected', self.id);
		self.client && self.client.removeAllListeners();
		self.components = [];
		self.client = null;
		callback && callback();
	}
};

Broker.prototype.subscribe = function(componentid, topic) {
	var self = this;
	self.subscribtions[topic] = self.subscribtions[topic] || [];
	if (self.subscribtions[topic].indexOf(componentid) > -1)
		return;
	self.client.subscribe(topic);
	self.subscribtions[topic].push(componentid);
};

Broker.prototype.resubscribe = function() {
	var self = this;
	var topics = Object.keys(self.subscribtions);
	for (var i = 0; i < topics.length; i++)
	    self.client.subscribe(topics[i]);
};

Broker.prototype.unsubscribe = function(componentid, topic) {
	var self = this;
	var sub = self.subscribtions[topic];
	if (sub) {
		self.subscribtions[topic] = sub.remove(componentid);
		self.client.connected && !self.subscribtions[topic].length && self.client.unsubscribe(topic);
	}
};

Broker.prototype.publish = function(topic, data, options) {
	var self = this;
	if (!self.connected)
		return;

	if (typeof(data) === 'object') {
		options.qos = parseInt(data.qos || options.qos);
		options.retain = data.retain || options.retain;
		topic = data.topic || topic;
		data.payload && (data = typeof(data.payload) === 'string' ? data.payload : JSON.stringify(data.payload));
	}

	if (options.qos !== 0 || options.qos !== 1 || options.qos !== 2)
		options.qos = null;

	if (typeof(data) !== 'string')
		data = JSON.stringify(data);

	self.client.publish(topic, data || '', options);
};

Broker.prototype.add = function(componentid) {
	var self = this;
	self.components.indexOf(componentid) === -1 && self.components.push(componentid);
	self.connect();
};

Broker.prototype.remove = function(componentid) {
	var self = this;
	self.components = self.components.remove(componentid);
	!self.components.length && self.disconnect();
};
