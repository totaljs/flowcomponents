exports.version = '0.0.1';				// the component version
exports.dateupdated = '2019-05-12';		// the version date (format: 'yyyy-MM-dd HH:mm')
exports.id = 'smsgatewaymesmssend';		// the component id
exports.title = 'SMS Send';				// the human readable block
exports.color = '#1ba58b';				// the color of the block
exports.click = true;					//
exports.input = ['green', 'blue'];		// color of inputs, will be 2 inputs
exports.output = ['green'];				// color of outputs, will have 1 output
exports.group = 'SMSGatewayME';			// The group name
exports.author = 'Thecoolpeople';		// The author
exports.icon = 'commenting-o';			// The visible icon
exports.status = '';					// the status text
exports.npm = [];						// npm dependencies

exports.cloning = false;				// Disables data cloning
exports.traffic = false;				// hides stats under component box in designer UI
exports.options = { };					// pre defined options

exports.install = function(component) {

	var tel_send;
	var message;

	component.on('data', function(response) {
		var apikey = component.options.apikey;
		var phoneid = component.options.phoneid;

		if (response.index == 0)
			tel_send = response.data;

		if (response.index == 1)
			message = response.data;

		if (component.options.message)
			message = component.options.message;

		if (message && tel_send && apikey && phoneid) {
			//request status of phone
			var jsondata = '[{"phone_number": "'+tel_send+'", "message": "'+message+'", "device_id": '+phoneid+'}]';
			var https = require('https');
			var options = {
				host: 'smsgateway.me',
				port: 443,
				path: '/api/v4/message/send',
				method: 'POST',
				headers: { 'Authorization': apikey, 'Content-Length': jsondata.length}
			};
			var req = https.request(options, function(res) {
				res.on('data', function(d) {
					var response = d.toString('utf8');
					component.send2(0, response);
				});
			});
			req.write(jsondata);
			req.end();

			message = '';
			tel_send = '';
		}
	});
};

exports.html = `
<div class="padding">
	<div data-jc="textbox" data-jc-path="phoneid" data-jc-config="type:number;required:true;validation:value > 0;increment:true;maxlength:8">@(ID of the phone)</div>
	<div data-jc="textbox" data-jc-path="apikey" data-jc-config="type:string;required:true">@(API Key)</div>
	<div data-jc="textbox" data-jc-path="message" data-jc-config="type:string">@(Message; additional)</div>
</div>`;
