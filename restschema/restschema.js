exports.id = 'restschema';
exports.title = 'Schema';
exports.group = 'REST';
exports.color = '#53B04A';
exports.input = false;
exports.output = false;
exports.author = 'Peter Širka';
exports.icon = 'code-branch';
exports.version = '1.0.1';
exports.options = { name: '', code: `schema.define('name', 'String(30)', true);

schema.setQuery(function($) {
	$.success();
});

schema.setGet(function($) {
	$.success();
});

schema.setSave(function($) {
	$.success();
});

schema.addWorkflow('email', function($) {
	$.success();
});` };

exports.html = `<div class="padding">
	<section>
		<div class="padding bg-smoke">
			<div data-jc="textbox" data-jc-path="name" data-jc-config="required:true;maxlength:30;placeholder:@(e.g. Product)">@(Schema name)</div>
			<div class="help">@(Use a-z characters only.)</div>
		</div>
	</section>
	<br />
	<div data-jc="codemirror" data-jc-path="code" data-jc-config="type:javascript;required:true;height:500;trim:true;tabs:true">@(Schema declaration)</div>
	<div class="help"><a href="https://docs.totaljs.com/latest/en.html#api~SchemaBuilder" target="_blank"><i class="fa fa-book"></i>@(Documentation)</a></div>
</div>
<script>
	ON('save.restschema', function(component, options) {
		!component.name && (component.name = options.name);
	});
</script>`.format(exports.id);

exports.readme = `# REST: Schema

This component creates user-defined Total.js schema.`;

exports.install = function(instance) {

	var oldname, schema;

	instance.on('close', function() {
		if (instance.options.name) {
			if (F.is4)
				NEWSCHEMA(instance.options.name, null);
			else
				UNINSTALL('schema', instance.options.name);
		}
	});

	instance.reconfigure = function() {

		var options = instance.options;

		if (!options.name) {
			instance.status('Not defined', 'red');
			return;
		}

		if (oldname) {
			if (F.is4)
				NEWSCHEMA(oldname, null);
			else
				UNINSTALL('schema', oldname);
		}

		oldname = options.name;
		var name = options.name.split('/');
		var group = name.length === 1 ? 'default' : name[0];

		name = name.length === 1 ? name[0] : name[1];

		try {
			schema = F.is4 ? NEWSCHEMA(group + '/' + name) : NEWSCHEMA(group, name);
			(new Function('schema', options.code))(schema);
			instance.status(options.name);
		} catch (e) {

			if (F.is4)
				NEWSCHEMA(options.name, null);
			else
				UNINSTALL('schema', options.name);

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