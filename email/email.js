exports.id = 'email';
exports.version = '1.4.0';
exports.title = 'Email';
exports.group = 'Notifications';
exports.color = '#8CC152';
exports.input = true;
exports.author = 'Peter Širka';
exports.output = 1;
exports.icon = 'envelope-o';
exports.dateupdated = '2018-04-06T09:50:00.000Z';
exports.options = { type: 'smtp' };

exports.html = `<div class="padding">
	<div data-jc="dropdown" data-jc-path="type" data-jc-config="required:true;items:@(Internal SMTP)|internal,@(Custom defined SMTP)|smtp" data-jc-value="'smtp'" class="m">@(Sender)</div>
	<section data-b="?.type" data-b-visible="value === 'smtp'" class="hidden m">
		<label><i class="fa fa-lock"></i>@(SMTP sender)</label>
		<div class="padding bg-yellow">
			<div class="row">
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="smtp" data-jc-config="required:true;maxlength:50">@(SMTP server)</div>
				</div>
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="port" data-jc-config="required:true;maxlength:4;type:number" data-jc-value="25">@(Port)</div>
				</div>
			</div>
			<div class="row">
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="user" data-jc-config="maxlength:50;placeholder:@(SMTP user)">User</div>
				</div>
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="password" data-jc-config="maxlength:50;placeholder="@(SMTP password)">@(Password)</div>
				</div>
			</div>
		</div>
	</section>
	<br />
	<section>
		<label><i class="fa fa-envelope"></i>@(Mail message settings)</label>
		<div class="padding">
			<div data-jc="textbox" data-jc-path="subject" class="m" data-jc-config="required:true;maxlength:100" data-jc-value="''">@(Subject)</div>
			<div class="row mt10">
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="from" data-jc-config="required:true;maxlength:120;icon:envelope-o" data-jc-value="'@'">@(From)</div>
				</div>
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="target" data-jc-config="required:true;maxlength:120;icon:envelope-o" data-jc-value="'@'">@(To)</div>
				</div>
			</div>
			<div class="row">
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="cc" data-jc-config="maxlength:120;icon:envelope-o" data-jc-value="''">@(CC)</div>
				</div>
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="bbcc" data-jc-config="maxlength:120;icon:envelope-o" data-jc-value="''">@(BCC)</div>
				</div>
			</div>
		</div>
	</section>
</div>
<script>
	ON('save.email', function(component, options) {
		var builder = [];
		builder.push('### @(Configuration)');
		builder.push('');
		builder.push('- SMTP: __' + (options.type === 'smtp' ? options.smtp : '@(Internal email)') + '__');
		builder.push('- @(authorization): __' + (options.user && options.password ? '@(yes)' : '@(no)') + '__');
		builder.push('---');
		builder.push('- @(from): __' + options.from + '__');
		builder.push('- @(to): __' + options.target + '__');
		builder.push('- @(cc): __' + (options.cc || '@(none)') + '__');
		builder.push('- @(bcc): __' + (options.bcc || '@(none)') + '__');
		builder.push('---');
		builder.push('- @(subject): __' + options.subject + '__');
		component.notes = builder.join('\\n');
	});
</script>`;

exports.readme = `# Email sender

You need to configure this component.

__Dynamic arguments__:
Are performed via FlowData repository and can be used for subject, from/to addresses or attachments. Use \`repository\` component for creating of dynamic arguments. Examples:

- subject \`{name}\`
- from address e.g. \`{from}\`
- to address e.g. \`{to}\`

__Attachments__:
\`FlowData\` repository needs to contain \`attachments\` key with user-defined array in the form:

__Multile addresses__:
This component can send email to multiple addresses but the addresses need to be declared in FlowData repository as \`String Array\`.

\`\`\`javascript
[
	{ filename: '/absolute/path/to/some/file.pdf', name: 'report.pdf' },
	{ filename: '/or/absolute/path/to/package.zip' }
]\`\`\``;

exports.install = function(instance) {

	var can = false;
	var smtp = null;

	instance.on('data', function(response) {
		can && instance.custom.send(response.data, response);
	});

	instance.custom.send = function(body, msg) {
		var options = instance.options;
		var message = Mail.create(msg.arg(options.subject), typeof(body) === 'object' ? JSON.stringify(body) : body.toString());

		message.from(msg.arg(options.from));

		var target = msg.arg(options.target);
		if (target && target.indexOf(',') !== -1) {
			target = target.split(',');
			for (var i = 0; i < target.length; i++)
				message.to(target[i].trim());
		} else if (target)
			message.to(target);

		target = msg.arg(options.cc);
		if (target && target.indexOf(',') !== -1) {
			target = target.split(',');
			for (var i = 0; i < target.length; i++)
				message.cc(target[i].trim());
		} else if (target)
			message.cc(target);

		target = msg.arg(options.bcc);
		if (target && target.indexOf(',') !== -1) {
			target = target.split(',');
			for (var i = 0; i < target.length; i++)
				message.bcc(target[i].trim());
		} else if (target)
			message.bcc(target);

		var a = msg.get('attachments');
		if (a instanceof Array) {
			for (var i = 0; i < a.length; i++)
				message.attachment(a[i].filename, a[i].name);
		}

		message.callback(function(err) {
			if (err) {
				msg.data = err;
				instance.throw(msg);
			} else
				instance.send2(0, msg);
		});

		if (options.internal)
			message.send2();
		else
			message.send(options.smtp, smtp);
	};

	instance.reconfigure = function() {

		var options = instance.options;

		can = (options.smtp || options.type !== 'smtp') && !!options.subject;

		if (!can) {
			instance.status('Not configured', 'red');
			return;
		}

		if (options.type === 'smtp') {
			smtp = {};
			options.user && (smtp.user = options.user);
			options.password && (smtp.password = options.password);
			options.port && (smtp.port = options.port);

			if (smtp.port !== 25)
				smtp.secure = true;

			Mail.try(options.smtp, smtp, function(err) {
				if (err) {
					Mail.try(options.smtp, smtp, function(err) {
						instance.status(err ? err.toString() : '', err ? 'red' : undefined);
					});
				} else
					instance.status('');
			});
		} else {
			instance.status('');
			smtp = null;
		}
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};