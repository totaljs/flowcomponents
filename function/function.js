exports.id = 'function';
exports.title = 'Function';
exports.group = 'Common';
exports.color = '#656D78';
exports.icon = 'code';
exports.input = true;
exports.output = 1;
exports.version = '1.1.2';
exports.author = 'Martin Smola';
exports.options = {
	outputs: 1,
	code: 'send(\'Hello world!\');'
};

exports.readme = `# Function

Allows you to do sync operation on data. If \`send\` function isn't called the data flow will not continue.

__Custom function__:

\`\`\`javascript
data;          // received data
send;          // send data to next component, optionaly specify output index -> send(0, data);
instance;      // ref to value.instance, available methods get, set, rem for storing temporary data related to this instance of Function component and  debug, status and error for sending data to designer
global;        // ref to value.global, available methods get, set, rem for storing persistent data globally accessible in any component
flowdata;      // ref to value.flowdata, instance of FlowData - available methods get, set, rem for storing temporary data related to current flow
flowdata.data; // user defined data recieved from previous component

// Example:
send('Hello world.'); // sends data to all outputs
send(0, 'Hello world.'); // sends data only to first output

// Calling send without any argument will pass incomming data to next components
send();
\`\`\``;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3">
			<div data-jc="textbox" data-jc-path="outputs" data-jc-config="type:number;validation:value > 0;increment:true;maxlength:3">@(Number of outputs)</div>
			<div class="help m">@(Minimum is 1)</div>
		</div>
	</div>
	<div data-jc="codemirror" data-jc-path="code" data-jc-config="type:javascript;required:true;height:500">@(Code)</div>
</div>
<script>
	var function_outputs_count;

	ON('open.function', function(component, options) {
		function_outputs_count = options.outputs = options.outputs || 1;
	});

	ON('save.function', function(component, options) {
		if (function_outputs_count !== options.outputs) {
			if (flow.version < 511) {
				component.connections = {};
				setState(MESSAGES.apply);
			}
			component.output = options.outputs || 1;
		}
	});
</script>`;

exports.install = function(instance) {

	var fn;
	var ready = false;

	var VALUE = {
		instance: {
			get: instance.get.bind(instance),
			set: instance.set.bind(instance),
			rem: instance.rem.bind(instance),
			error: instance.error.bind(instance),
			debug: instance.debug.bind(instance),
			status: instance.status.bind(instance),
			send: function(flowdata, index, data){
				if (data === undefined) {
					flowdata = flowdata.clone();
					flowdata.data = index;
					instance.send2(flowdata);
				} else {
					flowdata = flowdata.clone();
					flowdata.data = data;
					instance.send2(index, flowdata);
				}
			}
		},
		global: {
			get: FLOW.get,
			set: FLOW.set,
			rem: FLOW.rem,
			variable: FLOW.variable
		},
		Date: Date,
		Object: Object
	};

	instance.custom.reconfigure = function() {

		if (F.is4) {
			fn = new Function('value', 'next', 'var model=value;var now=function(){return new Date()};var instance=value.instance;var flowdata=value.flowdata;var data=flowdata.data;var global=value.global;var send=function(index,data){value.instance.send(value.flowdata,index,data)};try{' + instance.options.code + '}catch(e){next(e)}');
		} else {
			fn = SCRIPT(`
				var instance = value.instance;
				var flowdata = value.flowdata;
				var data = flowdata.data;
				var Date = value.Date;
				var Object = value.Object;
				var global = value.global;
				var send = function(index, data){
					value.instance.send(value.flowdata, index, data);
				}
				${instance.options.code}
				next(value);
			`);
		}

		if (typeof(fn) !== 'function') {
			ready = false;
			instance.error(fn.message);
			return;
		}
		ready = true;
	};

	instance.on('data', function(flowdata) {
		VALUE.flowdata = flowdata;
		ready && fn(VALUE, function(err) {
			if (err)
				return instance.error('Error while processing function ' + err);
		});
	});

	instance.on('options', instance.custom.reconfigure);
	instance.custom.reconfigure();
};
