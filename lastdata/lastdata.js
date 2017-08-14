exports.id = 'lastdata';
exports.title = 'Last Data';
exports.group = 'Common';
exports.color = '#656D78';
exports.input = true;
exports.click = true;
exports.output = 1;
exports.options = { count: 10 };
exports.author = 'Peter Širka';
exports.icon = 'list';

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="count" data-jc-config="required:true;placeholder:5;type:number;increment:true;align:center">@(Count)</div>
			<div class="help">@(Count of data)</div>
		</div>
	</div>
</div>`;

exports.readme = `# Last Data

This component keeps last a count of data and still returns \`Array\` of raw data.`;

exports.install = function(instance) {

	var data = [];

	instance.on('data', function(response) {
		data.unshift(response);
		data.length > instance.options.count && data.pop();
		self.send2(data);
	});

	instance.on('click', function() {
		self.send2(data);
	});
};