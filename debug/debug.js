exports.id = 'debug';
exports.title = 'Debug';
exports.author = 'Peter Širka';
exports.color = '#967ADC';
exports.click = true;
exports.input = true;
exports.icon = 'bug';
exports.version = '2.0.2';
exports.options = { enabled: true, repository: false, type: 'data' };
exports.readme = `# Debug

Prints data to the debug tab.`;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-12">
			<div data-jc="dropdown" data-jc-path="type" data-jc-config="items:Message data|data,Message repository|repository,Message data + Message repository|both;required:true" class="m">@(Output type)</div>
			<div data-jc="textbox" data-jc-path="property" data-jc-config="placeholder: @(e.g. address.street)" class="m">@(Path to the property (leave empty to show the whole data object))</div>
			<div data-jc="textbox" data-jc-path="group" data-jc-config="placeholder: @(e.g. Temperature)" class="m">@(A group name)</div>
			<div data-jc="checkbox" data-jc-path="enabled">@(Enabled)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	instance.on('data', function(response) {
		if (instance.options.enabled) {

			var opt = instance.options;
			var rep = response.repository;
			var val = response.data;

			switch (instance.options.type){
				case 'both':
					var data = {};
					data.repository = rep;
					data.data = val instanceof Error ? { error: val.message, stack: val.stack } : val;
					instance.debug(safeparse(opt.property ? U.get(data, opt.property) : data), undefined, opt.group);
					break;
				case 'repository':
					instance.debug(safeparse(opt.property ? U.get(rep, opt.property) : rep), undefined, opt.group);
					break;
				case 'data':
				default:
					if (val instanceof Error)
						instance.debug({ error: val.message, stack: val.stack }, undefined, opt.group);
					else
						instance.debug(safeparse(opt.property ? U.get(val, opt.property) : val), undefined, opt.group);
					break;
			}
		}
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

	function safeparse(o) {
		var cache = [];
		var str = JSON.stringify(o, function(key, value) {
			if (typeof value === 'object' && value !== null) {
				if (cache.indexOf(value) !== -1) {
					try {
						return JSON.parse(JSON.stringify(value));
					} catch (error) {
						return;
					}
				}
				cache.push(value);
			}
			return value;
		});
		cache = null;
		return JSON.parse(str);		
	};
};
