exports.id = 'range';
exports.title = 'Range';
exports.group = 'Logic';
exports.color = '#ffa824';
exports.version = '1.0.0';
exports.icon = 'arrows-h';
exports.input = true;
exports.output = 1;
exports.author = 'Martin Smola';
exports.options = { property: '' };

exports.html = `
	<div class="padding">
		<div data-jc="textbox" data-jc-path="property" data-jc-config="placeholder:@(e.g. path.to.property)" class="m">Property (unless the data is the value itself)</div>
		<div class="row">
			<div class="col-md-3">
				<div data-jc="textbox" data-jc-path="input_min" data-jc-config="type:number;increment:true;align:center" class="m">@(Input min (defaults to 0))</div>
			</div>
			<div class="col-md-3">
				<div data-jc="textbox" data-jc-path="input_max" data-jc-config="type:number;increment:true;align:center" class="m">@(Input max (defaults to 1023))</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-3">
				<div data-jc="textbox" data-jc-path="output_min" data-jc-config="type:number;increment:true;align:center" class="m">@(Output min (defaults to 0))</div>
			</div>
			<div class="col-md-3">
				<div data-jc="textbox" data-jc-path="output_max" data-jc-config="type:number;increment:true;align:center" class="m">@(Output max (defaults to 100))</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-3">
				<div data-jc="checkbox" data-jc-path="round" class="m">@(Round output?)</div>
			</div>
		</div>
	</div>
`;

exports.readme = `
# Range
`;

exports.install = function(instance) {


	instance.on('data', function(flowdata) {

		var options = instance.options;
		var val = parseFloat(typeof(flowdata.data) === 'object' ? U.get(flowdata.data, options.property) : flowdata.data);

		if (!val || typeof val !== 'number') {
			instance.error('Value is not a number');
			return;
		}

		if (val < options.input_min) {
			instance.error('Input smaller then minimal input');
			val = options.input_min;
		}

		if (val > options.input_max) {
			instance.error('Input bigger then maximal input');
			val = options.input_max;
		}

		var inmin = parseFloat(options.input_min || 0);
		var inmax = parseFloat(options.input_max || 1023);
		var outmin = parseFloat(options.output_min || 0);
		var outmax = parseFloat(options.output_max || 100);

		var data = outmin + (outmax - outmin) * (val - inmin) / (inmax - inmin);
		flowdata.data = options.round ? Math.round(data) : data;
		instance.send2(flowdata);
	});
};
