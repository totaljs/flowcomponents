exports.id = 'dashboardanalytics';
exports.title = 'Analytics';
exports.version = '1.2.1';
exports.author = 'Peter Širka';
exports.group = 'Dashboard';
exports.color = '#5CB36D';
exports.icon = 'line-chart';
exports.input = true;
exports.output = 1;
exports.options = { fn: 'next(value.temperature);', format: '{0} °C', decimals: 2, statshours: 24, statsdays: 14, statsmonths: 12, statsyears: 5  };
exports.readme = `# Dashboard Analytics

Creates analytics automatically according a value. The value must be a number. The output is \`Object\`:

\`\`\`javascript
{
	count: 2,          // {Number} count of analyzed values in the hour
	decimals: 0,       // {Number} count of decimals
	format: '{0} °C',  // {String} custom defined format, "{0}" will be a value
	period: 'hourly'   // {String} period "hourly" or "daily"
	previous: 15,      // {Number} previous calculated value
	raw: 32.3          // {Number} last raw value
	type: 'max',       // {String} type of analytics
	value: 32.3,       // {Number} last calculated value
}
\`\`\`

This components sends to Dashboard two types of data:
- \`laststate\` with the last state
- \`stats\` with stats`;

exports.html = `<div class="padding">
	<div data-jc="dropdown" data-jc-path="type" class="m" data-jc-config="items:,@(Hourly - Sum values)|sum,@(Hourly - A maximum value)|max,@(Hourly - A minimum value)|min,@(Hourly - An average value)|avg,@(Hourly - An average (median) value)|median,@(Daily - Sum values)|Dsum,@(Daily - A maximum value)|Dmax,@(Daily - A minimum value)|Dmin,@(Daily - An average value)|Davg,@(Daily - An average (median) value)|Dmedian;required:true">@(Type)</div>
	<div data-jc="codemirror" data-jc-path="fn" data-jc-config="type:javascript;required:true" class="m">@(Analyzator)</div>
	<div class="row">
		<div class="col-md-2 m">
			<div data-jc="textbox" data-jc-path="format" data-jc-config="placeholder:@(e.g. {0} °C);maxlength:10;align:center;required:true">@(Format)</div>
		</div>
		<div class="col-md-2 m">
			<div data-jc="textbox" data-jc-path="decimals" data-jc-config="maxlength:10;align:center;increment:true;type:number">@(Decimals)</div>
		</div>
	</div>
</div>
<div class="padding bg-yellow">
	<h3><i class="fa fa-bar-chart mr5"></i>@(Reading statistics)</h3>
	<div class="row">
		<div class="col-md-2 col-sm-3 m">
			<div data-jc="textbox" data-jc-path="statshours" data-jc-config="maxlength:6;align:center;increment:true;type:number;required:true">@(Count hours)</div>
		</div>
		<div class="col-md-2 col-sm-3 m">
			<div data-jc="textbox" data-jc-path="statsdays" data-jc-config="maxlength:6;align:center;increment:true;type:number;required:true">@(Count days)</div>
		</div>
		<div class="col-md-2 col-sm-3 m">
			<div data-jc="textbox" data-jc-path="statsmonths" data-jc-config="maxlength:6;align:center;increment:true;type:number;required:true">@(Count months)</div>
		</div>
		<div class="col-md-2 col-sm-3 m">
			<div data-jc="textbox" data-jc-path="statsyears" data-jc-config="maxlength:6;align:center;increment:true;type:number;required:true">@(Count years)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	const Fs = require('fs');
	const DOC = {};

	var fn = null;

	// [d]ashboard[a]analytics = da_
	var dbname = 'da_' + instance.id;
	var temporary = F.path.databases(dbname + '.json');
	var temporarycurrent = F.path.databases(dbname + '_current.json');
	var cache = {};
	var current = {};

	cache.datetime = F.datetime;
	cache.count = 0;
	cache.avg = { count: 0, sum: 0 };
	cache.number = null;
	cache.raw = 0;
	cache.median = [];

	instance.on('close', function() {
		Fs.unlink(temporary, NOOP);
		Fs.unlink(temporarycurrent, NOOP);
	});

	instance.on('data', function(response) {
		fn && fn(response.data, function(err, value) {

			if (err || value == null)
				return;

			var type = typeof(value);
			if (type === 'string') {
				value = value.parseFloat2();
				type = 'number';
			}

			if (isNaN(value))
				return;

			cache.count++;
			cache.raw = value;

			switch (instance.options.type) {
				case 'max':
				case 'Dmax':
					cache.number = cache.number === null ? value : Math.max(cache.number, value);
					break;
				case 'min':
				case 'Dmin':
					cache.number = cache.number === null ? value : Math.min(cache.number, value);
					break;
				case 'sum':
				case 'Dsum':
					cache.number = cache.number === null ? value : cache.number + value;
					break;
				case 'avg':
				case 'Davg':
					cache.avg.count++;
					cache.avg.sum += value;
					cache.number = cache.avg.sum / cache.avg.count;
					break;
				case 'median':
				case 'Dmedian':
					cache.median.push(value);
					cache.median.sort((a, b) => a - b);
					var half = Math.floor(cache.median.length / 2);
					cache.number = cache.median.length % 2 ? cache.median[half] : (cache.median[half - 1] + cache.median[half]) / 2.0;
					break;
			}

			current.previous = current.value;
			current.value = cache.number;
			current.raw = cache.raw;
			current.format = instance.options.format;
			current.type = instance.options.type[0] === 'D' ? instance.options.type.substring(1) : instance.options.type;
			current.count = cache.count;
			current.period = instance.options.type[0] === 'D' ? 'daily' : 'hourly';
			current.decimals = instance.options.decimals;
			current.datetime = F.datetime;
			instance.send2(current);
			instance.dashboard('laststate', current);
			instance.custom.status();
			EMIT('flow.dashboardanalytics', instance, current);
		});
	});

	instance.on('service', function() {
		if (fn) {
			instance.custom.save();
			instance.custom.save_temporary();
		}
	});

	instance.custom.status = function() {
		var number = cache.number;
		if (number == null)
			return;
		number = number.format(instance.options.decimals || 0);
		instance.status(cache.format ? cache.format.format(number) : number);
	};

	instance.custom.save_temporary = function() {
		Fs.writeFile(temporary, JSON.stringify(cache), instance.uerror);
		current && Fs.writeFile(temporarycurrent, JSON.stringify(current), instance.uerror);
	};

	instance.uerror = function(err) {
		err && instance.throw(err);
	};

	instance.custom.save = function() {

		if (instance.options.type[0] === 'D') {
			if (cache.datetime.getDate() === F.datetime.getDate())
				return;
		} else {
			if (cache.datetime.getHours() === F.datetime.getHours())
				return;
		}

		DOC.id = +cache.datetime.toUTC().format('yyyyMMddHH');
		DOC.year = cache.datetime.getUTCFullYear();
		DOC.month = cache.datetime.getUTCMonth() + 1;
		DOC.day = cache.datetime.getUTCDate();
		DOC.hour = cache.datetime.getUTCHours();
		DOC.week = +cache.datetime.format('w');
		DOC.count = cache.count;
		DOC.value = cache.number;
		DOC.type = cache.type[0] === 'D' ? cache.type.substring(1) : cache.type;
		DOC.period = cache.type[0] === 'D' ? 'daily' : 'hourly';
		DOC.format = cache.format;
		DOC.datecreated = F.datetime;

		NOSQL(dbname).update(DOC, DOC).where('id', DOC.id).callback(instance.stats);

		cache.count = 0;
		cache.number = null;

		switch (instance.options.type) {
			case 'median':
			case 'Dmedian':
				cache.median = [];
				break;
			case 'avg':
			case 'Davg':
				cache.avg.count = 0;
				cache.avg.sum = 0;
				break;
		}

		cache.datetime = F.datetime;
	};

	instance.nosql = callback => callback(null, NOSQL(dbname));

	instance.reconfigure = function() {
		var options = instance.options;

		if (!options.type) {
			instance.status('Not configured', 'red');
			fn = null;
			return;
		}

		cache.type = options.type;
		cache.format = options.format;

		fn = SCRIPT(instance.options.fn + ';\n');
		instance.custom.status();
	};

	instance.on('options', instance.reconfigure);

	instance.on('dashboard', function(type) {
		switch (type) {
			case 'stats':
				instance.stats();
				break;
			case 'laststate':
				instance.dashboard(type, current);
				break;
		}
	});

	// This method sends stats to Dashboard
	instance.stats = function(callback) {

		if (callback && typeof(callback) !== 'function')
			callback = null;

		if (!global.DASHBOARD || !global.DASHBOARD.online()) {
			callback && callback();
			return;
		}

		var output = {};
		var daily = instance.options.type[0] === 'D';

		output.id = instance.id;
		output.name = instance.name;
		output.hours = [];
		output.days = [];
		output.months = [];
		output.years = [];
		output.period = daily ? 'hourly' : 'daily';
		output.type = daily ? instance.options.type.substring(1) : instance.options.type;
		output.format = instance.options.format;
		output.decimals = instance.options.decimals;

		var comparer = output.type === 'min' ? Math.min : Math.max;
		var preprocessor = function(doc) {

			var tmp = { year: doc.year, month: doc.month, day: doc.day, hour: doc.hour, count: doc.count, value: doc.value, datecreated: doc.datecreated };
			tmp.id = doc.id;
			output.hourslength = instance.options.statshours || 24;
			quantitator(output.hourslength, output.hours, 'id', tmp, comparer);

			tmp.id = +doc.id.toString().substring(0, 8);
			output.dayslength = instance.options.statsdays || 14;
			quantitator(output.dayslength, output.days, 'id', tmp, comparer);

			tmp.id = +doc.id.toString().substring(0, 6);
			output.monthslength = instance.options.statsmonths || 12;
			quantitator(output.monthslength, output.months, 'id', tmp, comparer);

			tmp.id = doc.year;
			output.yearslength = instance.options.statsyears || 5;
			quantitator(output.yearslength, output.years, 'id', tmp, comparer);
		};

		DOC.id = +cache.datetime.toUTC().format('yyyyMMddHH');
		DOC.year = cache.datetime.getUTCFullYear();
		DOC.month = cache.datetime.getUTCMonth() + 1;
		DOC.day = cache.datetime.getUTCDate();
		DOC.hour = cache.datetime.getUTCHours();
		DOC.week = +cache.datetime.format('w');
		DOC.count = cache.count;
		DOC.value = cache.number;
		DOC.type = cache.type[0] === 'D' ? cache.type.substring(1) : cache.type;
		DOC.period = cache.type[0] === 'D' ? 'daily' : 'hourly';
		DOC.format = cache.format;
		DOC.datecreated = F.datetime;

		preprocessor(DOC);

		NOSQL(dbname).stream(preprocessor, function() {
			if (callback)
				callback(null, output);
			else if (instance.dashboard)
				instance.dashboard('stats', output);
		});
	};

	instance.reconfigure();

	Fs.readFile(temporarycurrent, function(err, data) {
		if (data)
			current = data.toString('utf8').parseJSON(true) || {};
		Fs.readFile(temporary, function(err, data) {
			if (err)
				return;
			var dt = cache.datetime || F.datetime;
			var tmp = data.toString('utf8').parseJSON(true);
			if (tmp && tmp.datetime) {
				cache = tmp;
				if (cache.type[0] === 'D')
					cache.datetime.getDate() !== dt.getDate() && instance.custom.save();
				else
					cache.datetime.getHours() !== dt.getHours() && instance.custom.save();
				instance.custom.status();
			}
		});
	});
};

function quantitator(max, results, identity, obj, comparer, group) {

	if (group && !results[group])
		results[group] = [];

	var arr = group ? results[group] : results;

	var length = arr.length;
	var item;

	if (length < max) {
		item = arr.findItem(identity, obj[identity]);
		if (item) {
			item.value = comparer(item.value, obj.value);
		} else {
			arr.push(U.clone(obj));
			arr.quicksort(identity, false);
		}
	} else {
		for (var i = 0; i < length; i++) {
			item = arr[i];
			if (obj[identity] > item[identity]) {
				for (var j = length - 1; j > i; j--)
					arr[j] = arr[j - 1];
				arr[i] = U.clone(obj);
				return;
			} else if (obj[identity] === item[identity]) {
				item.value = comparer(item.value, obj.value);
				return;
			}
		}
	}
}
