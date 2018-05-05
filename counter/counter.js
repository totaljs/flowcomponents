const ID = 'flowcounter';

exports.id = 'counter';
exports.title = 'Counter';
exports.version = '1.0.0';
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
		NOSQL(ID).counter.hit(instance.id, 1);
		instance.custom.status();
	});

	instance.custom.stats = function(callback) {
		NOSQL(ID).counter.monthly(instance.id, function(err, response) {
			callback(err, response);
		});
	};

	instance.custom.reset = function(callback) {
		NOSQL(ID).counter.clear(function() {
			callback && callback();
		});
	};

	instance.custom.status = function() {
		setTimeout2(instance.id, function() {
			instance.status(count.format(0));
			instance.send2(count);
		}, 100);
	};

	NOSQL(ID).counter.count(instance.id, function(err, response) {
		count = response;
		instance.custom.status();
	});
};

FLOW.trigger(ID, function(next, data) {
	NOSQL(ID).counter.monthly(data.id, function(err, response) {
		next(response);
	});
});

exports.uninstall = function() {
	FLOW.trigger(ID, null);
};
