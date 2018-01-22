exports.id = 'restoperation';
exports.title = 'Operation';
exports.group = 'REST';
exports.color = '#53B04A';
exports.input = false;
exports.output = false;
exports.author = 'Peter Širka';
exports.icon = 'id-card-o';
exports.version = '1.0.0';
exports.options = { name: '', code: `// Properties:
// $.value; {Object} received data
// $.error; {ErrorBuilder} instance
// $.options; {FlowData} object
// $.options.flowinstance {Flow component instance} object

// Methods
// $.callback([value]);
// $.success([value]);
// $.invalid(err, [message]);

$.success();` };

exports.html = `<div class="padding">
	<section>
		<div class="padding bg-smoke">
			<div data-jc="textbox" data-jc-path="name" data-jc-config="required:true;maxlength:30;placeholder:@(e.g. importproducts)">@(Operation name)</div>
			<div class="help">@(Use a-z characters only.)</div>
		</div>
	</section>
	<br />
	<div data-jc="codemirror" data-jc-path="code" data-jc-config="type:javascript;required:true;height:500;tabs:true;trim:true">@(Declaration)</div>
	<div class="help"><a href="https://docs.totaljs.com/latest/en.html#api~Operations" target="_blank"><i class="fa fa-book"></i>@(Documentation)</a></div>
</div>
<script>
	ON('save.restschema', function(component, options) {
		!component.name && (component.name = options.name);
	});
</script>`.format(exports.id);

exports.readme = `# REST: Operation

This component creates user-defined Total.js operation.`;

exports.install = function(instance) {

	var oldname;

	instance.on('close', () => instance.options.name && UNINSTALL('operation', instance.options.name));

	instance.reconfigure = function() {

		var options = instance.options;

		if (!options.name) {
			instance.status('Not defined', 'red');
			return;
		}

		oldname && UNINSTALL('operation', oldname);
		oldname = options.name;

		try {
			NEWOPERATION(oldname, new Function('$', options.code));
			instance.status(options.name);
		} catch (e) {
			UNINSTALL('operation', options.name);
			instance.error(e);
			instance.status('Syntax error', 'red');
		}
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};

exports.uninstall = function() {
	FLOW.trigger(exports.id, null);
};