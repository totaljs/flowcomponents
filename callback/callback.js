var ID = 'flowcallback';

exports.id = 'callback';
exports.title = 'Callback';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.color = '#656D78';
exports.icon = 'repeat';
exports.input = true;
exports.output = false;
exports.options = { target: '', type: 'send', index: 0, delay: 0 };
exports.readme = `# Callback

The component can make a callback to the target instance and repeat the cycle for new/modified data. Incoming data will be used as data to another component.`;

exports.html = `<div class="padding">
	<div data---="dropdown__?.target__datasource:%{0};empty:No target" class="m">@(Target instance)</div>
	<div class="row">
		<div class="col-md-4 m">
			<div data---="dropdown__?.type__items:@(Trigger click)|click,@(Push to instance)|push,@(Send as instance)|send">@(Type)</div>
		</div>
		<div class="col-md-3 m" data-bind="?.type__hide:value==='click'">
			<div data-bind="?.type__exec:settings_callback_label">
				<div data---="input__?.index__items:@(Trigger click)|click,@(Push to instance)|push,@(Send as instance)|send;type:number"><span class="name"></span> @(index)</div>
			</div>
		</div>
		<div class="col-md-3 m">
			<div data---="input__?.delay__type:number">@(Delay)</div>
			<div class="help">@(In milliseconds)</div>
		</div>
	</div>
</div>
<script>
function settings_callback_label(value, path, el) {
	el.find('.name').html(value === 'push' ? '@(Input)' : '@(Ouptut)');
}
ON('open.callback', function(instance) {
	TRIGGER('{0}', { id: instance.id }, '%{0}');
});</script>`.format(ID);

exports.install = function(instance) {

	var send = function(data) {
		if (instance.options.target) {
			var target = FLOW.instances[instance.options.target];
			if (target) {
				switch (instance.options.type) {
					case 'click':
						target.click();
						break;
					case 'send':
						target.send(instance.options.index, data);
						break;
					case 'push':
						target.emit('data', data);
						target.emit(instance.options.index + '', data);
						break;
				}
			}
		}
	};

	instance.on('data', function(data) {
		if (instance.options.delay)
			setTimeout(send, instance.options.delay, data);
		else
			send(data);
	});

	instance.custom.status = function() {
		var target = instance.options.target ? FLOW.instances[instance.options.target] : null;
		instance.status(target ? target.name : 'Not configured', target ? null : 'red');
	};

	instance.on('options', instance.custom.status);
	instance.on('design', instance.custom.status);

};

FLOW.trigger(ID, function(next) {

	var arr = [];

	for (var key in FLOW.instances) {
		var instance = FLOW.instances[key];
		arr.push({ id: key, name: (instance.reference ? (instance.reference + ': ') : '') + instance.name });
	}

	arr.quicksort('name');
	next(arr);
});

exports.uninstall = function() {
	FLOW.trigger(ID, null);
};
