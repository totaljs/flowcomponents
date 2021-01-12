exports.id = 'virtualwirein';
exports.title = 'Virtual wire in';
exports.version = '1.0.0';
exports.author = 'Martin Smola';
exports.color = '#303E4D';
exports.icon = 'sign-in';
exports.input = false;
exports.output = 1;
exports.options = {};
exports.readme = `# Virtual wire in

When the wires between the components are mess it's time to use Virtual wire.`;

exports.html = `<div class="padding">
	<div data-jc="textbox" data-jc-path="wirename" data-jc-config="required:true;placeholder:@(some identifier)" class="m">@(Wire name)</div>
	</div>
<script>
	ON('save.virtualwirein', function(component, options) {
		!component.name && (component.name = options.wirename);
	});
	WATCH('settings.virtualwirein.wirename', function(path, value, type){
		if (type === 2)
			SET('settings.virtualwirein.wirename', value.slug());
	});
</script>`;

exports.install = function(instance) {

	instance.custom.reconfigure = function(){
		if (instance.options.wirename) {
			instance.status(instance.options.wirename);
		} else
			instance.status('Not configured', 'red');
	};

	ON('virtualwire', function(wirename, flowdata){
		if (instance.options.wirename && instance.options.wirename === wirename)
			instance.send(flowdata);
	});

	instance.on('options', instance.custom.reconfigure);
	instance.custom.reconfigure();
};
