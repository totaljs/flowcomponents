exports.id = 'restmiddleware';
exports.title = 'Middleware';
exports.group = 'REST';
exports.color = '#86895A';
exports.input = false;
exports.output = ['#666D77'];
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
			<div class="help">@(Use a-z characters only.)</div>
		</div>
	</section>
	<br />
	<div data-jc="codemirror" data-jc-path="code" data-jc-config="type:javascript;required:true;height:500;tabs:true;trim:true" class="m">@(Middleware declaration)</div>
	<div data-jc="checkbox" data-jc-path="duration">@(Measure duration)</div>
</div>
<script>
	ON('save.restmiddleware', function(component, options) {
		!component.name && (component.name = options.name);
	});
</script>`.format(exports.id);

exports.readme = `# REST: Middleware

This component creates user-defined Total.js middleware.

- output is a duration \`Number\` in seconds`;

exports.install = function(instance) {

	var oldname;
	var durcount = 0;
	var dursum = 0;

	instance.on('close', () => instance.custom.clear());

	instance.custom.clear = function(name) {
		if (!name)
			name = instance.options.name;
		if (name && F.routes.middleware[name])
			delete F.routes.middleware[name];
	};

	instance.reconfigure = function() {

		var options = instance.options;

		if (!options.name) {
			instance.status('Not defined', 'red');
			return;
		}

		oldname && options.name !== oldname && instance.custom.clear(oldname);
		oldname = options.name;

		try {

			if (options.duration) {
				var fn = new Function('req', 'res', 'next', 'options', 'controller', options.code);
				F.middleware(options.name, function(req, res, next, options, controller) {
					var beg = new Date();
					fn(req, res, function() {
						durcount++;
						dursum += ((new Date() - beg) / 1000).floor(2);
						setTimeout2(instance.id, instance.custom.duration, 500, 10);
						next();
					}, options, controller);
				});
			} else
				F.middleware(options.name, new Function('req', 'res', 'next', 'options', 'controller', options.code));

			instance.status('');
		} catch (e) {
			instance.error(e);
			instance.status('Syntax error', 'red');
		}
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();

	instance.custom.duration = function() {
		var avg = (dursum / durcount).floor(2);
		instance.status(avg + ' sec.');
		instance.send2(0, avg);
	};

	instance.on('service', function(counter) {
		dursum = 0;
		durcount = 0;
	});
};

exports.uninstall = function() {
	FLOW.trigger(exports.id, null);
};