const ID = 'flowcounter';

exports.id = 'counter';
exports.title = 'Counter';
exports.version = '1.0.1';
exports.author = 'Peter Širka';
exports.color = '#656D78';
exports.icon = 'dashboard';
exports.input = true;
exports.output = 1;
exports.options = { enabled: true };
exports.readme = `# Counter

Counter counts all received data by months.`;

exports.html = `<div class="padding">
	<div><i class="fa fa-bar-chart mr5"></i>@(Counter for last 12 months)</div>
	<div data-jc="nosqlcounter" data-jc-path="flowcounterstats" class="m mt10" data-jc-noscope="true" style="height:100px"></div>
</div>
<script>ON('open.counter', function(instance) {
	TRIGGER('{0}', { id: instance.id }, 'flowcounterstats');
});</script>`.format(ID);

exports.install = function(instance) {

	var count = 0;

	instance.on('data', function() {
		count++;

		if (F.is4)
			COUNTER(ID).hit(instance.id, 1);
		else
			NOSQL(ID).counter.hit(instance.id, 1);

		instance.custom.status();
	});

	instance.custom.stats = function(callback) {
		if (F.is4)
			COUNTER(ID).monthly(instance.id, callback);
		else
			NOSQL(ID).counter.monthly(instance.id, callback);
	};

	instance.custom.reset = function(callback) {
		if (F.is4)
			COUNTER(ID).clear(callback);
		else
			NOSQL(ID).counter.clear(callback);
	};

	instance.custom.status = function() {
		setTimeout2(instance.id, function() {
			instance.status(count.format(0));
			instance.send2(count);
		}, 100);
	};

	var cb = function(err, response) {
		count = response || 0;
	};

	if (F.is4)
		COUNTER(ID).count(instance.id, cb);
	else
		NOSQL(ID).counter.count(instance.id, cb);
};

FLOW.trigger(ID, function(next, data) {

	var cb = function(err, response) {
		next(response);
	};

	if (F.is4)
		COUNTER(ID).monthly(data.id, cb);
	else
		NOSQL(ID).counter.monthly(data.id, cb);
});

exports.uninstall = function() {
	FLOW.trigger(ID, null);
};
