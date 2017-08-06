exports.id = 'virtualwirein';
exports.title = 'Virtual wire in';
exports.version = '1.0.0';
exports.author = 'Martin Smola';
exports.color = '#303E4D';
exports.input = false;
exports.output = 1;
exports.options = {};
exports.readme = `# Virtual wire in

After creating \`Virtual wire out\` make sure to hit Apply button otherwise it will not appear in setting of this component.`;

exports.html = `<div class="padding">
	<div data-jc="dropdown" data-jc-path="wire" data-jc-config="source:virtualwiresout_source;required:true;empty:@(Select a Virtual wire out component)" class="m">@(Select a wire)</div>
	<div class="help m">@(Make sure to create 'Virtual wire out' first to see it in dropdown.)</div>
</div>
<script>
	ON('open.virtualwirein', function(){
		TRIGGER('virtualwiresout', 'virtualwiresout_source');
	});
	ON('save.virtualwirein', function(component, options) {
		!component.name && (component.name = 'From ' + virtualwiresout_source.findItem('id', options.wire).name);
	});
</script>`;

exports.install = function(instance) {

	instance.custom.reconfigure = function(options, old_options){
		if (old_options && old_options.wire && options.wire !== old_options.wire)
			OFF('virtualwireout', instance.handler);

		if (instance.options.wire) {
			ON('virtualwireout', instance.handler);
			instance.status('');
		} else {
			instance.status('Not configured');
		}
	};

	instance.handler = function(id, flowdata) {
		if (instance.options.wire === id)
			instance.send2(flowdata);
	};

	instance.on('options', instance.custom.reconfigure);
	instance.custom.reconfigure();
};