exports.id = 'httpresponse';
exports.title = 'HTTP Response';
exports.group = 'HTTP';
exports.color = '#5D9CEC';
exports.icon = 'arrow-right';
exports.input = true;
exports.output = ['#666D76'];
exports.version = '2.0.0';
exports.author = 'Martin Smola';
exports.readme = `# HTTP response

HTTP response will respond with data recieved using data-type set in Settings form or plain text if not set. Output is the message duration \`Number\` in seconds.`;

exports.html = `<div class="padding">
	<div data-jc="dropdown" data-jc-path="datatype" data-jc-config="required:true;items:,Empty response|emptyresponse,JSON|json,HTML|html,Plain text|plain,XML|xml">@(Response data-type)</div>
	<div class="help"><code>JSON</code> is by default.</div>
</div>`;

exports.install = function(instance) {

	var dursum = 0;
	var durcount = 0;

	instance.on('data', function(flowdata) {

		var ctrl = flowdata.repository.controller;
		var data = flowdata.data;

		if (!ctrl) {
			instance.throw('No controller to use for response!');
			return;
		}

		durcount++;
		dursum += ((new Date() - flowdata.begin) / 1000).floor(2);
		setTimeout2(instance.id, instance.custom.duration, 500, 10);

		ctrl.$flowdata = flowdata;

		var datatype = instance.options.datatype || 'json';
		if (datatype === 'emptyresponse')
			return ctrl.plain('');

		if (datatype !== 'json' && typeof(data) !== 'string') {
			instance.throw('Incorect type of data, expected string, got ' + typeof(data));
			ctrl.plain(data == null ? '' : data.toString());
			return;
		}

		switch(datatype) {
			case 'html':
				ctrl.content(data, 'text/html');
				break;
			case 'plain':
				ctrl.plain(data);
				break;
			case 'xml':
				ctrl.content(data, 'text/xml');
				break;
			default:
				ctrl.json(data);
				break;
		}
	});

	instance.on('service', function() {
		dursum = 0;
		durcount = 0;
	});

	instance.custom.duration = function() {
		var avg = (dursum / durcount).floor(2);
		instance.status(avg + ' sec.');
		instance.send2(0, avg);
	};
};
