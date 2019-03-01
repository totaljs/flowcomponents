exports.id = 'twilio';
exports.title = 'Twilio';
exports.group = 'Notifications';
exports.color = '#8CC152';
exports.input = true;
exports.version = '1.0.0';
exports.author = 'Gyula Décsi';
exports.icon = 'commenting-o';

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="key" class="m" data-jc-config="required:true;maxlength:35;type:password">@(Account SID)</div>
		</div>
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="secret" class="m" data-jc-config="required:true;maxlength:35;type:password">@(Auth Token)</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="sender" class="m" data-jc-config="required:true;maxlength:30;placeholder:@(Phone number or Text)">@(From Number)</div>
		</div>
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="target" class="m" data-jc-config="required:true;maxlength:30;placeholder:@(International format)">@(To Number)</div>
		</div>
	</div>
</div>`;

exports.readme = `# SMS sender (Twilio)

The component has to be configured. Sender uses [Twilio API provider](https://www.twilio.com). Raw data will be send as a SMS message.`;

exports.install = function(instance) {

	var can = false;

	instance.on('data', function(response) {
		can && instance.custom.send(response.data);
	});

	instance.custom.send = function(message) {
		RESTBuilder.make(function(builder) {
			builder.url('https://{0}:{1}@api.twilio.com/2010-04-01/Accounts/{0}/Messages'.format(instance.options.key, instance.options.secret));
			builder.urlencoded({ To: instance.options.target, From: instance.options.sender, Body: typeof(message) === 'object' ? JSON.stringify(message) : message.toString() });
			builder.exec(function(err, response) {
				LOGGER('sms', 'response:', JSON.stringify(response), 'error:', err);
			});
		});
	};

	instance.reconfigure = function() {
		can = instance.options.key && instance.options.secret && instance.options.sender && instance.options.target ? true : false;
		instance.status(can ? '' : 'Not configured', can ? undefined : 'red');
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};

