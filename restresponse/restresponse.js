exports.id = 'restresponse';
exports.title = 'Response';
exports.group = 'REST';
exports.color = '#B0331B';
exports.input = 1;
exports.output = false;
exports.author = 'Peter Širka';
exports.icon = 'globe';
exports.version = '1.0.0';
exports.options = {};
exports.html = '';

exports.readme = `# REST: Response

This component responds with JSON.`;

exports.install = function(instance) {
	instance.on('data', function(response){
		response.repository.controller && response.repository.controller.json(response.data);
	});
};