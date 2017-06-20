exports.id = 'virtualwirein';
exports.title = 'Virtual wire in';
exports.version = '1.0.0';
exports.author = 'Martin Smola';
exports.color = '#303E4D';
exports.input = false;
exports.output = 1;
exports.options = {};
exports.readme = `# Virtual wire in

After creating \`Virtual wire out\` make sure to hit Apply button otherwise it will not appear in setting of this component.

`;

exports.html = `<div class="padding">
	<div data-jc="dropdown" data-jc-path="wire" data-source="virtualwiresout_source" data-required="true" data-empty="Select a Virtual wire out component" class="m">@(Select a wire)</div>
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

var VIRTUAL_WIRES = [];

exports.install = function(instance) {	

	instance.custom.reconfigure = function(options, old_options){
		if (old_options && old_options.wire && options.wire !== old_options.wire)
			OFF('virtualwireout', handler);

		if (instance.options.wire) {
			ON('virtualwireout', handler);
			instance.status('');
		} else {
			instance.status('Not configured');
		}
	};

	instance.on('options', instance.custom.reconfigure);

	instance.custom.reconfigure();

	function handler(id, flowdata){
		if (instance.options.wire === id)
			instance.send(flowdata);
	};
};