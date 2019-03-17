exports.id = 'filereader';
exports.title = 'File Reader';
exports.color = '#656D78';
exports.icon = 'file-text-o';
exports.input = 1;
exports.output = 1;
exports.version = '1.0.1';
exports.author = 'Martin Smola';
exports.options = { filename: '', append: true, delimiter: '\\n' };

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="filename" data-jc-config="placeholder:@(/public/robots.txt)">@(Filename)</div>
			<div class="help m">@(Filename relative to the application root.)</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6">
			<div data-jc="dropdown" data-jc-path="type" data-jc-config="items:Buffer|buffer,Text|text">@(Read as)</div>
		</div>
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="encoding" data-jc-config="placeholder:utf8">@(Encoding) (@(default 'utf8'))</div>
			<div class="help m">@(Only for 'Read as text')</div>
		</div>
	</div>
</div>`;

exports.readme = `# File Reader

This component reads a file from file system.

## Input
If incomming object has a path property then filename option is ignored.

Example of incomming object
\`\`\`javascript
{
	path: '/public/robots.txt',
	type: 'text', // optional, default text
	encoding: 'utf8' // optional, default utf8
}
\`\`\`
`;

const Fs = require('fs');

exports.install = function(instance) {

	instance.on('data', function(flowdata) {

		var data = flowdata.data;
		var options = instance.options;
		var path;
		var enc;
		var type;

		if (!data || !data.path) {

			if (!options.filename)
				return;

			path = options.filename;
			enc = options.encoding || 'utf8';
			type = options.type || 'buffer';

		} else {

			path = data.path;
			enc = data.encoding || 'utf8';
			type = data.type || 'buffer';

		}

		path = F.path.root(path);

		if (type === 'buffer')
			Fs.readFile(path, function(err, buf){
				if (err)
					instance.throw(err);
				else
					instance.send2({ buffer: buf });
			});
		else
			Fs.readFile(path, enc, function(err, data){
				if (err)
					instance.throw(err);
				else
					instance.send2({ data: data });
			});
	});
};
