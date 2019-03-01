exports.id = 'lastdata';
exports.title = 'Last Data';
exports.group = 'Common';
exports.color = '#656D78';
exports.version = '1.0.0';
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

This component keeps last a count of data and still returns \`Array\` of raw data. Nullable data won't be added.`;

exports.install = function(instance) {

	var data = [];

	instance.on('data', function(response) {
		var is = false;
		if (response.data instanceof Array) {
			for (var i = 0, length = response.data.length; i < length; i++) {
				var item = response.data[i];
				if (item != null) {
					data.unshift(item);
					data.length > instance.options.count && data.pop();
					is = true;
				}
			}
		} else if (response.data != null) {
			data.unshift(response.data);
			data.length > instance.options.count && data.pop();
			is = true;
		}
		is && instance.send2(data);
	});

	instance.on('click', function() {
		data && data.length && instance.send2(data);
	});
};