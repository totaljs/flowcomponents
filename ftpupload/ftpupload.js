exports.id = 'ftpupload';
exports.version = '1.0.2';
exports.title = 'FTP Upload';
exports.group = 'FTP';
exports.color = '#1f74d0';
exports.input = 1;
exports.output = 1;
exports.author = 'Peter Širka';
exports.icon = 'copy';
exports.options = { url: '' };
exports.readme = `# FTP Upload

This component uploads a file to FTP server. __IMPORTANT__: this component uses terminal \`ftp\` command.

__INPUT__:

\`\`\`javascript
{
	// Optional, default is FTP used in configuration
	url: 'FTP address with credentials',

	// SINGLE UPLOAD
	filename: 'filename to upload (absoute path)',
	target: 'FTP path',

	// OR MULTIPLE UPLOAD
	files: [
		{
			filename: '',
			target: ''
		}
	]
}
\`\`\`

__OUTPUT__:

\`\`\`javascript
{ success: true }
\`\`\``;


exports.html = `<div class="padding">
	<div data-jc="textbox__url__maxlength:500;placeholder:@(E.g. ftp\\://user\\:password@hostname)" class="m">@(FTP address)</div>
</div>`;


exports.install = function(instance) {

	const Exec = require('child_process').exec;
	const Url = require('url');

	instance.on('data', function(data) {

		var msg = data.data;
		var uri = Url.parse(msg.url || instance.options.url);
		var builder = [];

		builder.push('ftp -p -inv << EOF');
		builder.push('\topen ' + uri.hostname);

		if (uri.auth) {
			uri.auth = uri.auth.split(':');
			builder.push('\tuser ' + uri.auth[0] + ' ' + uri.auth[1]);
		}

		if (msg.files) {
			for (var i = 0; i < msg.files.length; i++) {
				var file = msg.files[i];
				builder.push('\tput "{0}" "{1}"'.format(file.filename, file.target));
			}
		} else
			builder.push('\tput "{0}" "{1}"'.format(msg.filename, msg.target));

		builder.push('\tbye');
		builder.push('EOF');

		Exec(builder.join('\n'), function(err, response) {

			if (err) {
				data.data = err;
				instance.throw(data);
			} else if (response && response.indexOf('226') === -1) {
				data.data = response;
				instance.throw(data);
			} else {
				data.data = SUCCESS(true);
				instance.send(data);
			}
		});

	});
};