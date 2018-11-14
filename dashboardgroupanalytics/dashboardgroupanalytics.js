exports.id = 'dashboardgroupanalytics';
exports.title = 'Group Analytics';
exports.version = '1.1.1';
exports.author = 'Peter Širka';
exports.group = 'Dashboard';
exports.color = '#5CB36D';
exports.icon = 'area-chart';
exports.input = true;
exports.output = 1;
exports.options = { fn: 'next({ value: value.count, group: value.brand });\n// or can return array:\n// next([{ value: value.count, group: value.brand }]);', format: '{0}x', decimals: 2, statshours: 24, statsdays: 14, statsmonths: 12, statsyears: 5, clearsignal: true };
exports.readme = `# Group Analytics

Creates a group analytics automatically according a value and group. The value must be a \`Number\` and group must be a \`String\`. The output is \`Object\`:

\`\`\`javascript
{
	meta: {                // meta info
		last: 'Audi',      // {String} last processed group
		lastvalue: 50      // {Number} last calculated value,
		groups: [],        // {String Array} all groups
		datetime: ...      // {Date} processed date and time
	},
	Audi: {
		count: 4,          // {Number} count of analyzed values in the hour
		decimals: 0,       // {Number} count of decimals
		format: '{0}x',    // {String} custom defined format, "{0}" will be a value
		period: 'hourly'   // {String} period "hourly" or "daily"
		previous: 45,      // {Number} previous calculated value
		raw: 50,           // {Number} last raw value
		type: 'sum',       // {String} type of analytics
		value: 50,         // {Number} last calculated value
		datetime: ...      // {Date} processed date and time
	},
	BMW: {
		count: 2,          // {Number} count of analyzed values in the hour
		decimals: 0,       // {Number} count of decimals
		format: '{0}x',    // {String} custom defined format, "{0}" will be a value
		period: 'hourly'   // {String} period "hourly" or "daily"
		previous: 15,      // {Number} previous calculated value
		raw: 30,           // {Number} last raw value
		type: 'sum',       // {String} type of analytics
		value: 30,         // {Number} last calculated value
		datetime: ...      // {Date} processed date and time
	}
}
\`\`\``;

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

	var fn = null;
	var dbname = 'dga_' + instance.id;
	var temporary = F.path.databases(dbname + '.json');
	var cache = {};
	var current = {};

	instance.on('close', function() {
		Fs.unlink(temporary, NOOP);
	});

	instance.on('data', function(response) {
		fn && fn(response.data, function(err, value) {

			if (err || value == null)
				return;

			if (value instanceof Array) {
				if (value.length === 1)
					instance.processvalue(value[0]);
				else {
					value.wait(function(item, next) {
						instance.processvalue(item);
						setImmediate(next);
					});
				}
			} else
				instance.processvalue(value);

		});
	});

	instance.processvalue = function(value) {

		if (!value || !value.group || value.value == null)
			return false;

		var val = value.value;
		var group = value.group;

		var type = typeof(val);
		if (type === 'string') {
			val = val.parseFloat2();
			type = 'number';
		}

		if (isNaN(val))
			return false;

		cache.$datetime = F.datetime;
		!cache[group] && (cache[group] = { count: 0 });

		var atmp = cache[group];
		atmp.count++;
		atmp.raw = val;
		atmp.datetime = F.datetime;

		switch (instance.options.type) {
			case 'max':
			case 'Dmax':
				atmp.number = atmp.number == null ? val : Math.max(atmp.number, val);
				break;
			case 'min':
			case 'Dmin':
				atmp.number = atmp.number == null ? val : Math.min(atmp.number, val);
				break;
			case 'sum':
			case 'Dsum':
				atmp.number = atmp.number == null ? val : atmp.number + val;
				break;
			case 'avg':
			case 'Davg':
				!atmp.avg && (atmp.avg = { count: 0, sum: 0 });
				atmp.avg.count++;
				atmp.avg.sum += val;
				atmp.number = atmp.avg.sum / atmp.avg.count;
				break;
			case 'median':
			case 'Dmedian':
				!atmp.median && (atmp.median = []);
				atmp.median.push(val);
				atmp.median.sort((a, b) => a - b);
				var half = Math.floor(atmp.median.length / 2);
				atmp.number = atmp.median.length % 2 ? atmp.median[half] : (atmp.median[half - 1] + atmp.median[half]) / 2.0;
				break;
		}

		!current.meta && (current.meta = { groups: NOSQL(dbname).meta('groups') || [] });
		!current[group] && (current[group] = {});

		var btmp = current[group];
		btmp.previous = btmp.value;
		btmp.value = atmp.number;
		btmp.raw = atmp.raw;
		btmp.format = instance.options.format;
		btmp.type = instance.options.type[0] === 'D' ? instance.options.type.substring(1) : instance.options.type;
		btmp.count = atmp.count;
		btmp.period = instance.options.type[0] === 'D' ? 'daily' : 'hourly';
		btmp.decimals = instance.options.decimals;
		btmp.datetime = F.datetime;

		current.meta.last = group;
		current.meta.lastvalue = atmp.number;
		current.meta.datetime = F.datetime;

		if (current.meta.groups.indexOf(group) === -1)
			current.meta.groups.push(group);

		instance.send2(current);
		instance.dashboard && instance.dashboard('laststate', current);
		instance.custom.status();
		EMIT('flow.dashboardgroupanalytics', instance, current);
		return true;
	};

	instance.on('service', function() {
		if (fn) {
			instance.custom.save();
			instance.custom.save_temporary();
		}
	});

	instance.custom.save_temporary = function() {
		Fs.writeFile(temporary, JSON.stringify(cache), NOOP);
	};

	instance.custom.save = function() {

		if (!cache.$datetime)
			return;

		if (instance.options.type[0] === 'D') {
			if (cache.$datetime.getDate() === F.datetime.getDate())
				return;
		} else {
			if (cache.$datetime.getHours() === F.datetime.getHours())
				return;
		}

		var keys = Object.keys(cache);
		var all = NOSQL(dbname).meta('groups') || [];

		var dt = cache.$datetime;
		var id = +dt.format('yyyyMMddHH');
		var w = +dt.format('w');

		for (var i = 0, length = keys.length; i < length; i++) {

			var key = keys[i];
			if (key === '$datetime')
				continue;

			all.indexOf(key) === -1 && all.push(key);

			var item = cache[key];
			var doc = {};

			doc.id = id;
			doc.year = dt.getFullYear();
			doc.month = dt.getMonth() + 1;
			doc.day = dt.getDate();
			doc.hour = dt.getHours();
			doc.week = w;
			doc.count = item.count;
			doc.value = item.number;
			doc.type = instance.options.type[0] === 'D' ? instance.options.type.substring(1) : instance.options.type;
			doc.period = instance.options.type[0] === 'D' ? 'daily' : 'hourly';
			doc.format = instance.options.format;
			doc.group = key;
			doc.datecreated = F.datetime;

			NOSQL(dbname).update(doc, doc).where('id', doc.id).where('group', doc.group).callback(function() {
				// Sends stats
				setTimeout2('stats.' + instance.id, instance.stats, 3000);
			});

			item.count = 0;
			item.number = null;

			switch (instance.options.type) {
				case 'median':
				case 'Dmedian':
					item.median = [];
					break;
				case 'avg':
				case 'Davg':
					item.avg.count = 0;
					item.avg.sum = 0;
					break;
			}
		}

		var keys = Object.keys(current);
		for (var i = 0, length = keys.length; i < length; i++) {
			var key = keys[i];
			if (key !== 'meta') {
				var tmp = current[key];
				tmp.count = 0;
				tmp.value = null;
				tmp.year = dt.getFullYear();
				tmp.month = dt.getMonth() + 1;
				tmp.day = dt.getDate();
				tmp.hour = dt.getHours();
			}
		}

		if (current.meta) {
			current.meta.last = '';
			current.meta.lastvalue = null;
			current.meta.datetime = F.datetime;
			current.meta.groups = all;
		}

		cache.$datetime = F.datetime;
		NOSQL(dbname).meta('groups', all);
		instance.custom.save_temporary();

		if (instance.options.clearsignal) {
			instance.dashboard && instance.dashboard('laststate', current);
			instance.send2(current);
		}
	};

	instance.custom.reconfigure = function() {
		if (instance.options.type) {
			fn = SCRIPT(instance.options.fn + ';\n');
			instance.status('');
			instance.custom.init && instance.custom.init();
		} else {
			instance.status('Not configured', 'red');
			fn = null;
		}
	};

	instance.on('options', instance.custom.reconfigure);
	instance.on('dashboard', function(type) {
		switch (type) {
			case 'stats':
				instance.stats();
				break;
			case 'laststate':
				instance.dashboard && instance.dashboard(type, current);
				break;
		}
	});

	instance.nosql = callback => callback(null, NOSQL(dbname));

	// This method sends stats to Dashboard
	instance.stats = function(callback) {

		if (!global.DASHBOARD || !global.DASHBOARD.online()) {
			callback && callback();
			return;
		}

		var output = {};
		var daily = instance.options.type[0] === 'D';
		var g = {};

		output.id = instance.id;
		output.hours = {};
		output.days = {};
		output.months = {};
		output.years = {};
		output.groups = [];
		output.period = daily ? 'hourly' : 'daily';
		output.type = daily ? instance.options.type.substring(1) : instance.options.type;
		output.format = instance.options.format;
		output.decimals = instance.options.decimals;

		var comparer = output.type === 'min' ? Math.min : Math.max;
		var preprocessor = function(doc) {

			g[doc.group] = true;

			var tmp = { year: doc.year, month: doc.month, day: doc.day, hour: doc.hour, count: doc.count, value: doc.value, datecreated: doc.datecreated };
			var group = output.hours[doc.group];
			!group && (group = output.hours[doc.group] = []);
			tmp.id = doc.id;
			output.hourslength = instance.options.statshours || 24;
			quantitator(output.hourslength, group, 'id', tmp, comparer);

			tmp.id = +doc.id.toString().substring(0, 8);
			output.dayslength = instance.options.statsdays || 14;
			group = output.days[doc.group];
			!group && (group = output.days[doc.group] = []);
			quantitator(output.dayslength, group, 'id', tmp, comparer);

			tmp.id = +doc.id.toString().substring(0, 6);
			output.monthslength = instance.options.statsmonths || 12;
			group = output.months[doc.group];
			!group && (group = output.months[doc.group] = []);
			quantitator(output.monthslength, group, 'id', tmp, comparer);

			tmp.id = doc.year;
			output.yearslength = instance.options.statsyears || 5;
			group = output.years[doc.group];
			!group && (group = output.years[doc.group] = []);
			quantitator(output.yearslength, group, 'id', tmp, comparer);
		};

		NOSQL(dbname).find().stream(preprocessor).callback(function() {
			output.groups = Object.keys(g);
			if (callback)
				callback(null, output);
			else if (instance.dashboard)
				instance.dashboard('stats', output);
		});
	};

	instance.custom.groups = callback => callback(null, NOSQL(dbname).meta('groups'));
	instance.custom.reconfigure();

	instance.custom.status = function() {
		var count = NOSQL(dbname).meta('groups').length;
		instance.status('Groups: ' + count + 'x');
	};

	instance.custom.init = function() {
		instance.custom.init = null;
		Fs.readFile(temporary, function(err, data) {
			if (err)
				return;
			var tmp = data.toString('utf8').parseJSON(true);
			if (tmp && tmp.$datetime) {
				cache = tmp;
				instance.custom.save();
			} else
				cache.$datetime = F.datetime;

			current.meta = {};
			current.meta.groups = NOSQL(dbname).meta('groups') || EMPTYARRAY;
		});
	};
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
		return;
	}

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
