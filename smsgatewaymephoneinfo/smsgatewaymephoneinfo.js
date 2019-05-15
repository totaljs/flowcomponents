exports.version = '0.0.1';				//the component version
exports.dateupdated = '2019-05-12';		//the version date (format: 'yyyy-MM-dd HH:mm')
exports.id = 'smsgatewayme_phone_info';	//the component id
exports.title = 'SMS Phone Info';		//the human readable block
exports.color = '#1ba58b';				//the color of the block
exports.click = true;					//
exports.input = ['green'];				//color of inputs		//will be 1 input
exports.output = ['green'];				//color of outputs		//will have 1 output
exports.group = 'SMSGatewayME';			//The group name
exports.author = 'Thecoolpeople';		//The author
exports.icon = 'commenting-o';					//The visible icon
exports.status = '';					//the status text
exports.npm = [];						//npm dependencies

exports.cloning = false;				//Disables data cloning
exports.traffic = false;				//hides stats under component box in designer UI
exports.options = {  };					//pre defined options

exports.install = function(component) {	
	var error = function(err) {
		component.throw(err);
	};
	
	component.on('data', function(response) {
		var apikey = component.options.apikey;
		var phoneid = component.options.phoneid;
		
		if(response.index == 0 && apikey && phoneid){
			//request status of phone			
			var https = require('https');
			var options = {
				host: 'smsgateway.me',
				port: 443,
				path: '/api/v4/device/'+phoneid,
				method: 'GET',
				headers: { 'Authorization': apikey }
			};
			var req = https.request(options, function(res) {
				res.on('data', function(d) {
					var response = d.toString('utf8');
					component.send2(0, response);
				});
			});

			req.end();
		}
	});

	component.on('signal', function(data, parent) {
		// optional
		// Captured signal
		// @data {Object} - optional, can be "null", or "undefined"
		// @parent {Component} - a component which created this signal
		component.send2(0, "Hello");
	});

	component.on('service', function(counter) {
		// optional
		// Service called each 1 minute
	});
	
}

exports.html = `
<div class="padding">
	<div data-jc="textbox" data-jc-path="phoneid" data-jc-config="type:number;required:true;validation:value > 0;increment:true;maxlength:8">@(ID of the phone)</div>
	<div data-jc="textbox" data-jc-path="apikey" data-jc-config="type:string;required:true; > 0;">@(API Key)</div>
</div>`;
