exports.id = 'virtualwireout';
exports.title = 'Virtual wire out';
exports.version = '1.0.0';
exports.author = 'Martin Smola';
exports.color = '#303E4D';
exports.icon = 'sign-out';
exports.input = true;
exports.options = {};
exports.readme = `# Virtual wire out

When the wires between the components are mess it's time to use Virtual wire.`;

exports.html = `<div class="padding">
	<div data-jc="textbox" data-jc-path="wirename" class="m" data-jc-config="required:true;placeholder:@(some identifier)">@(Wire name)</div>
</div>
<script>
	ON('save.virtualwireout', function(component, options) {
		!component.name && (component.name = options.wirename);
	});
	WATCH('settings.virtualwireout.wirename', function(path, value, type){
		if (type === 2)
			SET('settings.virtualwireout.wirename', value.slug());
	});
</script>`;

exports.install = function(instance) {

	instance.custom.reconfigure = function(){
		if (instance.options.wirename) {
			instance.status(instance.options.wirename);
		} else
			instance.status('Not configured', 'red');
	};

	instance.on('data', function(flowdata) {
		EMIT('virtualwire', instance.options.wirename, flowdata);
	});

	instance.on('options', instance.custom.reconfigure);
	instance.custom.reconfigure();
};
