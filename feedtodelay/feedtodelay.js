exports.id = 'feedtodelay';
exports.title = 'Feed to delay';
exports.color = '#656D78';
exports.icon = 'clock-o';
exports.group = 'Time';
exports.input = true;
exports.output = 1;
exports.version = '1.0.0';
exports.author = 'Martin Smola';
exports.options = { timeout: 30 };

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3">
			<div data-jc="textbox" data-jc-path="timeout" data-jc-config="placeholder:@(In seconds);type:number;increment:true;align:center">@(Timeout)</div>
		</div>
	</div>
</div>`;

exports.readme = `# Feed to delay
It will only send data if it doesn't recieve anything in past x seconds.
So if it keeps getting new data before the timeout it will never send anything.`;

exports.install = function(instance) {

	var waiting = false;
	var timeout;

	instance.on('data', function(flowdata) {

		if (waiting)
			clearTimeout(timeout);
		else
			waiting = true;
		
		timeout = setTimeout(function(){
			instance.send2(flowdata);
			waiting = false;
		}, instance.options.timeout * 1000);
	});

	instance.on('close', () => timeout && clearTimeout(timeout));
};