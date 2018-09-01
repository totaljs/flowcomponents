exports.id = 'restcors';
exports.title = 'CORS';
exports.group = 'REST';
exports.color = '#6B9CE6';
exports.input = false;
exports.output = false;
exports.traffic = false;
exports.author = 'Peter Širka';
exports.icon = 'globe';
exports.version = '1.1.0';

exports.options = {
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	url: '/api/*',
	credentials: true
};

exports.html = `<div class="padding">
	<div data-jc="textbox" data-jc-path="url" data-jc-config="required:true;placeholder:/api/*">@(URL address)</div>
	<div class="help m">@(URL address can contain <code>*</code> as wildcard routing.)</div>
	<div data-jc="dropdowncheckbox" data-jc-path="methods" data-jc-config="items:GET,POST,PUT,PATCH,DELETE;cleaner:false;alltext:">@(Allowed methods)</div>
	<hr />
	<div data-jc="checkbox" data-jc-path="credentials">@(Enable credentials)</div>
</div>
<script>
	ON('save.restcors', function(component, options) {
		!component.name && (component.name = options.url);
	});
</script>`.format(exports.id);

exports.readme = `# REST: CORS

Enables CORS for 3rd party client-side applications. __Our recommendation:__ is to use wildcard for the entire API.`;

exports.install = function(instance) {

	var old;

	instance.on('close', () => old && UNINSTALL('cors', 'id:' + instance.id));
	instance.reconfigure = function() {
		var options = instance.options;
		old && UNINSTALL('cors', 'id:' + instance.id);
		old = true;
		var flags = options.methods.slice(0);
		flags.push('id:' + instance.id);
		CORS(options.url, flags, options.credentials);
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};
