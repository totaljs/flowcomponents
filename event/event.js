exports.id = 'event';
exports.version = '1.0.0';
exports.title = 'Event';
exports.group = 'Inputs';
exports.color = '#F6BB42';
exports.input = false;
exports.output = 1;
exports.author = 'Peter Širka';
exports.icon = 'bullhorn';
exports.options = { fn: `function(a, b) {
	// your code
	// this === component instance
	// this.send(data);
}` };

exports.html = `<div class="padding">
	<div data-jc="textbox__name__required:true;maxlength:50" class="m">@(Event name)</div>
	<div data-jc="codemirror__fn__type:javascript;required:true;height:300">@(Event function)</div>
</div>`;

exports.readme = `# Event capturing

This component can capture Total.js framework event.`;

exports.install = function(instance) {

	var e = { name: '', fn: null };

	instance.reconfigure = function() {

		var options = instance.options;

		e.name && OFF(e.name, e.process);

		if (options.name && options.fn) {
			e.name = options.name;
			try {
				e.fn = eval('(' + options.fn + ')');
			} catch (e) {
				e.fn = null;
			}
		} else {
			e.fn = null;
			e.process = null;
			e.name = '';
		}

		if (e.fn) {

			e.process = function(a, b, c, d) {
				e.fn.call(instance, a, b, c, d);
			};

			ON(e.name, e.process);
			instance.status('');
		}
		else
			instance.status('Not configured', 'red');
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};