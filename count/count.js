exports.id = 'count';
exports.title = 'Count';
exports.version = '1.0.1';
exports.author = 'John Graves';
exports.color = '#656D78';
exports.icon = 'plus-square';
exports.input = 2;
exports.output = 1;
exports.options = { increment: 1, initialvalue: 1 };
exports.readme = `# Counter

Counter Number of times called.`;

exports.html = `<div class="padding">
<div data-jc="textbox" data-jc-path="initialvalue" data-jc-config="placeholder:1;increment:true;type:number;align:center">@(Initial Value)</div>
<div data-jc="textbox" data-jc-path="increment" data-jc-config="placeholder:1;increment:true;type:number;align:center">@(Increment)</div>
<p><a href="https://youtu.be/NuUbTm1oRE0" target="_blank">Example Video</a></p>
</div>`;

exports.readme = `# Count

This component counts the number of messages received.

__Response:__

Integer value based on the initial value and increment settings.

__Arguments:__
- Initial Value: What number should be output on the receipt of the first message.
- Increment: What should the increment be for each following message received.`;

exports.install = function(instance) {

	var count = 0;
	var initialCall = true;

	instance.on('data', function(flowdata) {
		var index = flowdata.index;
		if (index) {
			instance.debug('Reset Count.');
			count = instance.options.initialvalue;
			initialCall = true;
		} else {
			// If this is the first time, set the value to 'initial value'
			if(initialCall) {
				initialCall = false;
				count = instance.options.initialvalue;
			} else
				count = count+instance.options.increment;
			instance.status('Count:' + count);
			instance.send2(count);
		}
	});

	instance.on('options', function() {
		count = instance.options.initialvalue;
		initialCall = true;
	});

};
