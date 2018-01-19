exports.id = 'lastusage';
exports.title = 'Last Usage';
exports.version = '1.1.0';
exports.author = 'Peter Širka';
exports.color = '#656D78';
exports.input = true;
exports.icon = 'calendar';
exports.options = { format: 'dd.MM.yyyy HH:mm:ss' };
exports.dateupdated = '2018-01-19T11:57:00.000Z';
exports.traffic = false;
exports.readme = `# Last Usage

This component remembers date and time of last received data. The component keeps stats of usage in NoSQL embedded DB.`;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-4">
			<div data-jc="textbox" data-jc-path="format" data-jc-config="placeholder:@(dd.MM.yyyy HH:mm:ss);maxlength:25;align:center">@(Date format)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	var lastusage = null;

	instance.on('data', function() {

		lastusage = new Date();
		instance.custom.status();

		// Internal stats
		NOSQL('flowlastusage').counter.hit(instance.id, 1);
	});

	instance.custom.status = function(skip) {
		lastusage && setTimeout2(instance.id, function() {

			instance.status(lastusage.format(instance.options.format));

			if (skip)
				return;

			var data = {};
			data.id = instance.id;
			data.date = lastusage;
			data.name = instance.name;
			NOSQL('flowlastusage').update(data, data).where('id', data.id);
		}, 1000);
	};

	instance.on('options', instance.custom.status);

	NOSQL('flowlastusage').one().where('id', instance.id).callback(function(err, response) {
		if (response) {
			lastusage = response.date;
			instance.custom.status(true);
		}
	});
};