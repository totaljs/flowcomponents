exports.id = 'ftpuploadfolder';
exports.version = '1.0.3';
exports.title = 'FTP Upload Folder';
exports.group = 'FTP';
exports.color = '#34ace1';
exports.input = 0;
exports.output = 1;
exports.author = 'Total Avengers s.r.o.';
exports.icon = 'file-upload';
exports.options = { type: 'ftp', port: 21, interval: 30000 };
exports.readme = `# FTP Upload Folder

This component uploads a folder to FTP or SFTP server. __IMPORTANT__: this component uses terminal \`lftp\` command.
`;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-6">
			<div data---="dropdown__type__items:FTP|ftp,SFTP|sftp;required:true;__'ftp'" class="m">@(Type)</div>
		</div>
		<div class="col-md-6">
			<div data---="textbox__port__type:number;required:true;placeholder:21" class="m">Port</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6">
			<div data---="textbox__hostname__required:true;placeholder:100.100.5.3" class="m">@(Hostname)</div>
		</div>
		<div class="col-md-6">
			<div data---="textbox__interval__required:true;type:number" class="m">@(Interval in ms)</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6">
			<div class="m" data---="textbox__user__required:true">@(User)</div>
		</div>
		<div class="col-md-6">
			<div class="m" data---="textbox__password__required:true;type:password;placeholder:@(Type a password...)">@(Password)</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6">
			<div class="m" data---="textbox__remotepath__placeholder:/">@(Remote path)</div>
		</div>
		<div class="col-md-6">
			<div class="m" data---="textbox__localpath__required:true;placeholder:/www/upload">@(Local path)</div>
		</div>
	</div>
	<div data---="checkbox__isenabled">@(Enable upload)</div>
</div>
<script>
	WATCH('settings.ftpuploadfolder.type', function(path, value, type) {
		if (type === 1)
			return;
		SET('settings.ftpuploadfolder.port', value === 'ftp' ? 21 : 22);
	});
</script>`;

exports.install = function(instance) {

	const Exec = require('child_process').exec;

	var can = false;
	var isrunning = false;
	var interval;

	instance.custom.create = function() {
		instance.custom.test(function(working) {
			if (!working)
				return;
			if (!instance.options.isenabled) {
				instance.status('Disabled', 'orange');
				return;
			}
			interval = setInterval(function() {
				(!isrunning) && instance.custom.upload();
			}, instance.options.interval);
		});
	};

	instance.custom.test = function(callback) {

		if (isrunning) {
			callback(false, 'Test of connection is already in progress.');
			return;
		}

		isrunning = true;

		Exec('mkdir -p {localpath} && touch {localpath}testfile.txt'.arg(instance.options), function(err) {

			if (err) {
				instance.throw(err);
				return;
			}

			Exec(instance.custom.geturl(true), function(err) {
				isrunning = false;
				if (err) {
					instance.status('Disconnected', 'red');
					callback && callback(false, 'Login failed! Please check your settings!');
					instance.throw(err);
				} else {
					if (instance.options.isenabled)
						instance.status('Connected', 'green');
					else
						instance.status('Disabled', 'orange');
					callback && callback(true, 'Test processed successfully!');
					instance.send2(SUCCESS(true, 'Test processed successfully!'));
				}
			});
		});
	};

	instance.custom.upload = function() {

		isrunning = true;

		U.ls(instance.options.localpath, function(files) {

			if (!files.length) {
				isrunning = false;
				return;
			}

			Exec(instance.custom.geturl(), function(err) {
				isrunning = false;
				if (err) {
					instance.throw(err);
					instance.status('Disconnected', 'red');
				} else {
					instance.send2(SUCCESS(true));
					instance.status('Connected', 'green');
				}
			});
		});
	};

	instance.custom.geturl = function(istest) {
		var opt = instance.options;
		var builder = [];
		builder.push('lftp');
		builder.push('-u {user},{password}'.arg(opt));
		builder.push('-p ' + opt.port);
		builder.push('{type}://{hostname}'.arg(opt));
		if (istest)
			builder.push('-e \'set net:max-retries 1;set net:reconnect-interval-base 1;set net:reconnect-interval-multiplier 1;mkdir -p {remotepath};put -c -E -O {remotepath} {localpath}testfile.txt;exit\''.arg(opt));
		else
			builder.push('-e \'set net:max-retries 1;set net:reconnect-interval-base 1;set net:reconnect-interval-multiplier 1;mkdir -p {remotepath};mput -c -E -O {remotepath} {localpath}*;exit\''.arg(opt));
		return builder.join(' ');
	};

	instance.custom.preparessh = function() {
		Exec('ssh-keygen -F ' + instance.options.hostname, function(err) {
			if (err)
				instance.custom.generateknownhost();
			else
				instance.custom.create();
		});
	};

	instance.custom.generateknownhost = function() {
		Exec('mkdir -p ~/.ssh/ && ssh-keyscan -H {hostname} >> ~/.ssh/known_hosts'.arg(instance.options), function(err) {
			if (err)
				instance.throw(err);
			else
				instance.custom.create();
		});
	};

	instance.close = function(next) {
		isrunning = false;
		interval && clearInterval(interval);
		next();
    };

	instance.reconfigure = function() {

		interval && clearInterval(interval);

		var opt = instance.options;
		var local = opt.localpath;
		var remote = opt.remotepath;

		if (opt.localpath) {
			opt.localpath = opt.localpath[0] === '/' ? opt.localpath : '/' + opt.localpath;
			opt.localpath = opt.localpath[opt.localpath.length - 1] === '/' ? opt.localpath : opt.localpath + '/';
		} else
			opt.localpath = '/';

		if (opt.remotepath) {
			opt.remotepath = opt.remotepath[0] === '/' ? opt.remotepath : '/' + opt.remotepath;
			opt.remotepath = opt.remotepath[opt.remotepath.length - 1] === '/' ? opt.remotepath : opt.remotepath + '/';
		} else
			opt.remotepath = '/';

		if (local !== opt.localpath || remote !== opt.remotepath) {
			instance.reoptions(opt);
			return;
		}

		can = opt.type && opt.port && opt.hostname && opt.interval && opt.user && opt.password ? true : false;
		instance.status(can ? '' : 'Not configured', can ? undefined : 'red');

		if (!can)
			return;

		instance.status('Connecting...');

		if (opt.type === 'sftp')
			instance.custom.preparessh();
		else
			instance.custom.create();
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};