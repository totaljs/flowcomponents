exports.id = 'commanderdependencies';
exports.title = 'Commander: Dependencies';
exports.group = 'Commander';
exports.color = '#AC92EC';
exports.icon = 'github';
exports.output = 1;
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.readme = `# Commander: Dependencies

This component can inject dependencies to each new connected user. Output is \`user\` instance.`;
exports.options = { scripts: [], styles: [], code: '' };
exports.html = `<div class="padding npb">
	<div data-jc="textboxlist" data-jc-path="scripts" data-jc-config="placeholder:@(URL to .js scripts)" class="m">@(JavaScript)</div>
	<div data-jc="textboxlist" data-jc-path="styles" data-jc-config="placeholder:@(URL to .css styles)" class="m">@(Styles)</div>
	<div data-jc="codemirror" data-jc-path="code" data-jc-config="type:javascript;tabs:true;height:100">@(Custom code)</div>
</div>`;

exports.install = function(instance) {

	function process(client) {

		instance.options.scripts.forEach(function(url) {
			url && client.commander_runcode('IMPORT(\'{0} .js\')'.format(url));
		});

		instance.options.styles.forEach(function(url) {
			url && client.commander_runcode('IMPORT(\'{0} .css\')'.format(url));
		});

		instance.options.code && client.commander_runcode(instance.options.code);

		var data = instance.make(client.user);
		data.set('client', client);
		instance.send(data);
	}

	ON('commander.open', process);

	instance.on('close', function() {
		OFF('commander.open', process);
	});
};