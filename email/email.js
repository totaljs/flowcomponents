exports.id = 'email';
exports.title = 'Email';
exports.group = 'Notifications';
exports.color = '#8CC152';
exports.input = true;
exports.author = 'Peter Širka';
exports.version = '1.2.0';
exports.output = ['green', 'red'];
exports.icon = 'envelope-o';
exports.options = { errors: true };

exports.html = `<div class="padding">
	<section>
		<label><i class="fa fa-lock"></i>@(SMTP sender)</label>
		<div class="padding">
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
			<div data-jc="checkbox" data-jc-path="errors">@(Enable internal error handling)</div>
		</div>
	</section>
	<br />
	<section>
		<label><i class="fa fa-envelope"></i>@(Mail message settings)</label>
		<div class="padding npb">
			<div class="b">@(Message)</div>
			<div class="row mt10">
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="from" data-jc-config="required:true;maxlength:120;type:email;icon:envelope-o" data-jc-value="'@'">@(From)</div>
				</div>
				<div class="col-md-6 m">
					<div data-jc="textbox" data-jc-path="target" data-jc-config="required:true;maxlength:120;type:email;icon:envelope-o" data-jc-value="'@'">@(To)</div>
				</div>
			</div>
			<div data-jc="textbox" data-jc-path="subject" class="m" data-jc-config="required:true;maxlength:100" data-jc-value="'@'">@(Subject)</div>
		</div>
	</section>
</div>`;

exports.readme = `# Email sender

You need to configure this component.

__Outputs__:
- \`green\` message has been sent successfully
- \`red\` an error while sending

__Dynamic arguments__:
Are performed via FlowData repository and can be used for subject, from/to addresses or attachments. Use \`repository\` component for creating of dynamic arguments. Examples:

- subject \`{name}\`
- from address e.g. \`{from}\`
- to address e.g. \`{to}\`

__Attachments__:
\`FlowData\` repository needs to contain \`attachments\` key with user-defined array in the form:

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
		message.to(msg.arg(options.target));
		message.send(options.smtp, smtp);

		var a = msg.get('attachments');
		if (a instanceof Array) {
			for (var i = 0; i < a.length; i++)
				message.attachment(a[i].filename, a[i].name);
		}

		message.callback(function(err) {
			if (err) {
				options.errors && instance.error(err);
				msg.data = err;
				instance.send2(1, msg);
			} else
				instance.send2(0, msg);
		});
	};

	instance.reconfigure = function() {

		var options = instance.options;
		can = options.smtp && options.subject;

		if (!can) {
			instance.status('Not configured', 'red');
			return;
		}

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
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};