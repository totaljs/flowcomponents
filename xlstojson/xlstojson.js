exports.id = 'xlstojson';
exports.title = 'XLS to JSON';
exports.group = 'Parsers';
exports.color = '#37BC9B';
exports.input = true;
exports.output = 1;
exports.author = 'Martin Smola';
exports.icon = 'random';
exports.options = {  };
exports.npm = ['xlsx'];

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-4">
			<div data-jc="textbox" data-jc-path="filename" data-jc-config="placeholder:/path/to/file/name.xls">@(Filename) (@(optional))</div>
			<div class="help">@(Ignored if a 'buffer' property is in the incomming object.)</div>
		</div>
	</div>
</div>`;

exports.readme = `# XLS to JSON

This component tries to transform \`Excell spreadsheet\` to \`json\`.

If there's a buffer property in an incomming data then filename option is ignored.

## options
- filename relative to the application root`;

const XLSX = require('xlsx');
const Fs = require('fs');

exports.install = function(instance) {
	
	instance.custom.process = function(err, buf) {

		var wb = XLSX.read(buf, {type:'buffer'});
		var ws = wb.Sheets[wb.SheetNames[0]];

		var arr = XLSX.utils.sheet_to_json(ws);

		instance.send2(arr);

	};

	instance.on('data', function(flowdata) {

		if (flowdata.data.buffer) {
			instance.custom.process(null, flowdata.data.buffer);
		} else if (instance.options.filename) {
			Fs.readFile(F.path.root(instance.options.filename), instance.custom.process);			
		}

	});
};
