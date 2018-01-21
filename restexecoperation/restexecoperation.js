exports.id = 'restexecoperation';
exports.title = 'Exec operation';
exports.group = 'REST';
exports.color = '#666D77';
exports.input = 1;
exports.output = ['red', 'green'];
exports.author = 'Peter Širka';
exports.icon = 'code';
exports.version = '1.0.0';
exports.cloning = false;
exports.options = { name: '', keepmessage: true };

exports.html = `<div class="padding">
	<div data-jc="dropdown" data-jc-path="name" data-jc-config="required:true;datasource:restexecoperationdata.operations;empty:" class="m">@(Operation)</div>
	<div data-jc="checkbox" data-jc-path="keepmessage">@(Keep message instance)</div>
</div>
<script>
	ON('open.restexecoperation', function(instance) {
		TRIGGER('{0}', 'restexecoperationdata');
	});

	ON('save.restexecoperation', function(component, options) {
		!component.name && (component.name = options.name);
	});
</script>`.format(exports.id);

exports.readme = `# REST: Operation

This component evaluates some registered Total.js operation.`;

exports.install = function(instance) {
	instance.on('data', function(data) {
		data.flowinstance = instance;
		instance.options.name && OPERATION(instance.options.name, data.data, function(err, response) {
			data.flowinstance = undefined;
			if (err) {
				if (instance.options.keepmessage)
					data.data = err;
				else
					data = instance.make(err, 0);
				instance.send(0, data);
			} else {
				if (instance.options.keepmessage)
					data.data = response;
				else
					data = instance.make(response, 1);
				instance.send(1, data);
			}
		}, data);
	});
};

// Reads all operations
FLOW.trigger(exports.id, function(next) {
	var output = {};
	output.operations = [];

	EACHOPERATION(function(name) {
		output.operations.push(name);
	});

	output.operations.quicksort('name');
	next(output);
});

exports.uninstall = function() {
	FLOW.trigger(exports.id, null);
};