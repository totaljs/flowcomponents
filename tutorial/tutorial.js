exports.id = 'tutorial';               // must be unique and in lower-case
exports.version = '1.0.0';             // version
exports.title = 'Tutorial';            // readable name
exports.group = 'Common';              // optional, a group for the component (you can group multiple components)
exports.color = '#F6BB42';             // optional, color
exports.click = true;                  // enables a small button on the component in the Flow designer
exports.output = 1;                    // enables one output
exports.input = 1;                     // enables one input
exports.author = 'Peter Širka';        // author of the component
exports.icon = 'play';                 // font-awesome free icon without (https://fontawesome.com/icons?m=free)
exports.optoins = { delay: 1000 };     // a custom options

exports.html = `<div class="padding">
	<div data---="textbox__delay__type:number" class="m">Delay</div>
</div>`;

exports.readme = `# Tutorial

This is my first component.`;

exports.install = function(instance) {

	// instance.options {Object}
	// instance.send([output_index], message);

	// '<input-index>' event is triggered if something sends a message to this component
	instance.on('0', function(message) {

		// @message {Message}

		var data = message.data;

		console.log('---> Received data:', data);

		setTimeout(function() {

			// Sends message next to 0 (zero) output
			instance.send(0, message);

		}, instance.options.delay);

	});

	// exports.click = true; {Boolean} shows a small button on the component in the Flow designer
	// 'click' event is triggered if the user clicks on the button
	instance.on('click', function() {

		// The method below sends a message to 0 (zero) output
		instance.send(0, 'Hello world!');

	});

	// 'options' event is triggered if someone changes component's options
	instance.on('options', function() {

		// instance.options {Object}

	});

};
