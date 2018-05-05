exports.id = 'ifttthookrequest';
exports.title = 'IFTTT hook request';
exports.group = 'IFTTT';
exports.version = '1.0.0';
exports.author = 'Martin Smola';
exports.icon = 'exchange';
exports.color = '#3f99ff';
exports.input = true;
exports.output = 1;
exports.cloning = false;
exports.options = { url: '', parser: '// value is a flowdata instance, value.data is the data send by previous component\n\nnext({\n\tvalue1: \'\',\n\tvalue2: \'\',\n\tvalue3: \'\'\n});' };
exports.readme = `# IFTTT

Sends a request to [IFTTT Maker Webhooks](https://ifttt.com/maker_webhooks).

### Input

If the object has 'event', 'key' and 'body' then it will be used instead of event and key from Event and Key fields.
Body is optional and it must to be a json-serializable object:

\`\`\`javascript
next({
	event: 'eventname',
	key: 'flgjhflghsfjhoi',
	body :{
		value1: 'string',
		value2: 'string',
		value3: 'string'
	}
});

// alternatively without event and key

next({
	value1: 'string',
	value2: 'string',
	value3: 'string'
});
\`\`\`
`;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="event">@(Event)</div>
			<div data-jc="textbox" data-jc-path="key" data-jc-config="type:password">@(Key)</div>
		</div>
	</div>
	<div data-jc="codemirror" data-jc-path="parser" data-jc-config="type:javascript;height:200;required:true">@(Data)</div>
	<div class="help hidden">@()</div>
	<p><a href="https://ifttt.com/maker_webhooks" target="_blank">IFTTT Maker Webhooks Documentation</a></p>
</div>`;

exports.install = function(instance) {

	var fn = null;

	var url = 'https://maker.ifttt.com/trigger/{0}/with/key/{1}';

	instance.on('data', function(response) {
		if (typeof(response.data) !== 'object')
			return;

		fn && fn(response.data, function(err, data) {
			if (err)
				return;

			post(data);
		}, response);
	});

	function callback(err, data) {
		if (err)
			return;

		post(data);
	};

	instance.custom.reconfigure = function() {

		if (instance.options.parser)
			fn = SCRIPT(instance.options.parser);
		else
			fn = null;
	};

	instance.on('options', instance.custom.reconfigure);
	instance.custom.reconfigure();

	function post(data) {
		var event = instance.options.event;
		var key = instance.options.key;

		if (data.event && data.key && data.body) {
			d = data.body;
			event = data.event;
			key = data.key;
		}
		else 
			d = data;

		if (!event || ! key)
			return instance.status('No config to use', 'red');

		var u = url.format(event, key);

		U.request(u, ['post', 'json'], d || {}, function(err,data,status,headers,host){
			instance.send2(status);
		});
	};
};
