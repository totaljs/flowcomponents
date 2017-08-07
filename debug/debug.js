exports.id = 'debug';
exports.title = 'Debug';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.color = '#967ADC';
exports.click = true;
exports.input = true;
exports.options = { enabled: true };
exports.readme = `# Debug

Writes data to the debug tab.`;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-12">
			<div data-jc="textbox" data-jc-path="property" data-jc-config="placeholder: @(e.g. data.user.name)" class="m">Path to the property (leave empty to show whole data object)</div>
			<div data-jc="textbox" data-jc-path="group" data-jc-config="placeholder: @(e.g. Temperature)" class="m">A group name</div>
			<div data-jc="checkbox" data-jc-path="enabled">@(Enabled)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	instance.on('data', function(response) {
		instance.options.enabled && instance.debug(instance.options.property ? U.get(response.data, instance.options.property) : response, undefined, instance.options.group);
	});

	instance.on('click', function() {
		instance.options.enabled = !instance.options.enabled;
		instance.custom.status();
		instance.save();
	});

	instance.on('options', function() {
		instance.custom.status();
	});

	instance.custom.status = function() {
		instance.status(instance.options.enabled ? 'Enabled' : 'Disabled');
	};

	instance.custom.status();
};