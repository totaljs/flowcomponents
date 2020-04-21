exports.id = 'ftpuploadfolder';
exports.version = '1.0.0';
exports.title = 'FTP Upload Folder';
exports.group = 'FTP';
exports.color = '#34ace1';
exports.input = 0;
exports.output = 1;
exports.author = 'Total Avengers s.r.o.';
exports.icon = 'file-upload';
exports.options = { url: '' };
exports.readme = `# FTP Upload Folder

This component uploads a folder to FTP or SFTP server. __IMPORTANT__: this component uses terminal \`lftp\` command.
`;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-12">
			<div class="m" data---="textbox__url__required:1;maxlength:500;placeholder:@(E.g. [ftp,sftp]\\://user\\:password@hostname[\\:port][remote path])">@(FTP/SFTP address)</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6">
			<div class="m" data---="textbox__path__required:1;placeholder:/www/upload">@(Local path)</div>
		</div>
		<div class="col-md-6">
			<div class="m" data---="textbox__interval__required:1;type:number__5000">@(Interval in ms)</div>
		</div>
	</div>
	<div data---="checkbox__isenabled">@(Enable upload)</div>
</div>`;

exports.install = function(instance) {

	const Exec = require('child_process').exec;
	const Url = require('url');

	var can = false;
	var isrunning = false;
	var interval;

	instance.custom.create = function() {
		interval = setInterval(function() {
			(!isrunning) && instance.custom.upload();
		}, instance.options.interval);
	};

	instance.custom.upload = function() {

		isrunning = true;

		var opt = instance.options;
		var uri = Url.parse(opt.url);

		var builder = [];
		var localpath = opt.path.substr(-1) === '/' ? opt.path + '*' : opt.path + '/*';

		builder.push('lftp');

		if (uri.auth) {
			uri.auth = uri.auth.split(':');
			builder.push('-u {0},{1}'.format(uri.auth[0], uri.auth[1]));
		}

		if (uri.port)
			builder.push('-p ' + uri.port);

		builder.push('{0}//{1}{2}'.format(uri.protocol, uri.hostname));

		if (uri.path)
			builder.push('-e \'mkdir -p {0};cd {0};mput {1};exit\''.format(uri.path, localpath));
		else
			builder.push('-e \'mput /www/upload/*;exit\'');

		Exec(builder.join(' '), function(err) {
			isrunning = false;
			if (err)
				instance.throw(err);
			else
				instance.send2(SUCCESS(true));
		});
	};

	instance.custom.preparessh = function() {

		var uri = Url.parse(instance.options.url);

		Exec('ssh-keygen -F ' + uri.hostname, function(err) {
			if (err)
				instance.custom.generateknownhost();
			else
				instance.custom.create();
		});
	};

	instance.custom.generateknownhost = function() {

		var uri = Url.parse(instance.options.url);

		Exec('ssh-keyscan -H {hostname} >> ~/.ssh/known_hosts'.arg(uri), function(err) {
			if (err)
				instance.throw(err);
			else
				instance.custom.create();
		});
	};

	instance.close = function() {
		isrunning = false;
		clearInterval(interval);
    };

	instance.reconfigure = function() {
		can = instance.options.url && instance.options.path && instance.options.interval && instance.options.isenabled ? true : false;
		instance.status(can ? '' : 'Not configured', can ? undefined : 'red');

		if (!can)
			return;

		if (instance.options.url.indexOf('sftp') !== -1)
			instance.custom.preparessh();
		else
			instance.custom.create();
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};