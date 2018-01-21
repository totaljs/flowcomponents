exports.id = 'repository';
exports.title = 'Repository';
exports.group = 'Common';
exports.color = '#656D78';
exports.input = true;
exports.output = 1;
exports.author = 'Peter Širka';
exports.icon = 'suitcase';
exports.version = '1.0.0';
exports.cloning = false;
exports.options = { code: 'set(\'token\', \'123456\');\nsend();' };
exports.readme = `# Repository

This component can write/read data from \`FlowData\` message repository or from \`Flow\` instance.

\`\`\`javascript
// value {Object} contains received data
// flowdata {Object} a current flowdata

// set(key, value); sets a key/value
// get(key); gets a value according to the key
// set2(key, value); sets a key/value in Flow instance
// get2(key); gets a value according to the key from Flow instance

// Sends data next
send();
\`\`\``;

exports.html = `<div class="padding">
	<div data-jc="codemirror" data-jc-path="code" data-jc-config="type:javascript;required:true;height:500">@(Code)</div>
</div>`;

exports.install = function(instance) {

	var fn;

	instance.on('data', function(response) {
		fn && fn(response.data, instance, response);
	});

	instance.reconfigure = function() {
		try {
			if (instance.options.code) {
				instance.status('');
				var code = `var set = (key, value) => flowdata.set(key, value);
				var get = key => flowdata.get(key);
				var rem = key => flowdata.rem(key);
				var set2 = (key, value) => FLOW.set(key, value);
				var get2 = key => FLOW.get(key);
				var rem2 = key => FLOW.rem(key);
				var send = next = () => instance.send2(flowdata);` + instance.options.code;
				fn = new Function('value', 'instance', 'flowdata', code);
			} else {
				instance.status('Not configured', 'red');
				fn = null;
			}
		} catch (e) {
			fn = null;
			instance.error('Repository: ' + e.message);
		}
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};