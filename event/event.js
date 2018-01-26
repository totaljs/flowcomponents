exports.id = 'event';
exports.title = 'Event';
exports.group = 'Inputs';
exports.color = '#F6BB42';
exports.input = false;
exports.output = 1;
exports.author = 'Peter Širka';
exports.icon = 'bullhorn';
exports.options = { fn: `function(a, b) {
	// your code
}` };

exports.html = `<div class="padding">
	<div data-jc="textbox" data-jc-path="name" data-jc-config="required:true;maxlength:50" class="m">@(Event name)</div>
	<div data-jc="codemirror" data-jc-path="fn" data-jc-config="type:javascript;required:true;height:300">@(Event function)</div>
</div>`;

exports.readme = `# Event capturing

The component needs to be configured.`;

exports.install = function(instance) {

	var e = { name: '', fn: null };

	instance.reconfigure = function() {

		var options = instance.options;

		e.name && OFF(e.name, e.fn);

		if (options.name && options.fn) {
			e.name = options.name;
			try {
				e.fn = eval('(' + options.fn + ')');
			} catch (e) {
				e.fn = null;
			}
		} else {
			e.fn = null;
			e.name = '';
		}

		if (e.fn) {
			ON(e.name, e.fn);
			instance.status('');
		}
		else
			instance.status('Not configured', 'red');
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};