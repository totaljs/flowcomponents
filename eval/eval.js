exports.id = 'eval';
exports.title = 'Eval';
exports.group = 'Common';
exports.color = '#656D78';
exports.input = false;
exports.output = false;
exports.author = 'Peter Širka';
exports.icon = 'code';
exports.version = '1.0.0';
exports.options = { code: '// NOSQLSTORAGE(\'database\').mapreduce(\'count\', (doc, R) => { R.count = (R.count || 0) + 1; });' };

exports.html = `<div class="padding">
	<div data-jc="codemirror" data-jc-path="code" data-jc-config="type:javascript;required:true;height:500;tabs:true;trim:true" class="m">@(Code)</div>
</div>`;

exports.readme = `# Eval

This component executes custom JavaScript code as it is when you change a code or after Flow is restarted.`;

exports.install = function(instance) {
	instance.reconfigure = function() {
		try {
			instance.options.code && (new Function(instance.options.code)());
		} catch (e) {
			instance.error('Code: ' + e.message);
		}
	};
	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};