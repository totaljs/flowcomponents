exports.id = 'restresponse';
exports.title = 'Response';
exports.group = 'REST';
exports.color = '#B0331B';
exports.input = 1;
exports.output = ['#666D76'];
exports.author = 'Peter Širka';
exports.icon = 'globe';
exports.version = '1.0.0';
exports.options = {};
exports.html = '';

exports.readme = `# REST: Response

This component responds with JSON automatically. Output is the message duration \`Number\` in seconds.`;

exports.install = function(instance) {

	var dursum = 0;
	var durcount = 0;

	instance.on('data', function(response) {
		if (response.repository.controller) {
			var ctrl = response.repository.controller;
			ctrl.$flowdata = response;
			ctrl.json(response.data);
			durcount++;
			dursum += ((new Date() - response.begin) / 1000).floor(2);
			setTimeout2(instance.id, instance.custom.duration, 500, 10);
		}
	});

	instance.on('service', function() {
		dursum = 0;
		durcount = 0;
	});

	instance.custom.duration = function() {
		var avg = (dursum / durcount).floor(2);
		instance.status(avg + ' sec.');
		instance.send2(0, avg);
	};
};