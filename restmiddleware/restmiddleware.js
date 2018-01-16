exports.id = 'restmiddleware';
exports.title = 'Middleware';
exports.group = 'REST';
exports.color = '#86895A';
exports.input = false;
exports.output = false;
exports.author = 'Peter Širka';
exports.icon = 'code';
exports.version = '1.0.0';
exports.options = { name: '', code: `// Input arguments:

// req {Request}
// res {Response}
// options {Object} optional
// controller {Object} optional
// next {Function}

setTimeout(next, 1000);` };

exports.html = `<div class="padding">
	<section>
		<div class="padding bg-smoke">
			<div data-jc="textbox" data-jc-path="name" data-jc-config="required:true;maxlength:30;placeholder:@(e.g. delay)">@(Middleware name)</div>
			<div class="help">Use a-z characters only.</div>
		</div>
	</section>
	<br />
	<div data-jc="codemirror" data-jc-path="code" data-jc-config="type:javascript;required:true;height:500">@(Middleware declaration)</div>
</div>
<script>
	ON('save.restmiddleware', function(component, options) {
		!component.name && (component.name = options.name);
	});
</script>`.format(exports.id);

exports.readme = `# REST: Middleware

This component creates user-defined Total.js middleware.`;

exports.install = function(instance) {

	var oldname;

	instance.on('close', () => instance.options.name && UNINSTALL('middleware', instance.options.name));

	instance.reconfigure = function() {

		var options = instance.options;

		if (!options.name) {
			instance.status('Not defined', 'red');
			return;
		}

		oldname && UNINSTALL('middleware', oldname);
		oldname = options.name;

		try {
			F.middleware(options.name, new Function('req', 'res', 'next', 'options', 'controller', options.code));
			instance.status(options.name);
		} catch (e) {
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