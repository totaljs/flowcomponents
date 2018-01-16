exports.id = 'restschema';
exports.title = 'Schema';
exports.group = 'REST';
exports.color = '#6B5223';
exports.input = false;
exports.output = false;
exports.author = 'Peter Širka';
exports.icon = 'id-card-o';
exports.version = '1.0.0';
exports.options = {  };

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3">
			<div data-jc="textbox" data-jc-path="outputs" data-jc-config="type:number;validation:value > 0;increment:true;maxlength:3">@(Number of outputs)</div>
			<div class="help m">@(Minimum is 1)</div>
		</div>
	</div>
	<div data-jc="codemirror" data-jc-path="code" data-jc-config="type:javascript;required:true;height:500" class="m">@(Code)</div>
	<div data-jc="checkbox" data-jc-path="keepmessage">@(Keep message instance)</div>
</div>`;

exports.readme = `# REST: Schema

This component creates user-defined Total.js schema.`;

exports.install = function(instance) {

	instance.reconfigure = function() {

	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};