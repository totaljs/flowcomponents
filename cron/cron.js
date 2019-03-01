exports.id = 'cron';
exports.title = 'Cron';
exports.group = 'Time';
exports.color = '#F6BB42';
exports.version = '1.0.0';
exports.output = 1;
exports.click = true;
exports.author = 'Martin Smola';
exports.icon = 'clock-o';
exports.options = { jobs: [] };
exports.npm = ['node-schedule'];

exports.html = `
<div class="padding">
	<div class="row m">
		<div class="col-md-6">
			<div data-jc="checkbox" data-jc-path="enabled" class="m">@(Enabled)</div>
		</div>
	</div>

	<section class="m">
		<label><i class="fa fa-clock-o"></i>@(Cron jobs)</label>
		<div class="padding">
			<div class="row ">
				<div class="col-md-12">
					<div data-jc="textboxlist" data-jc-path="jobs" data-jc-config="maxlength:50;placeholder:enter value like '* 1 * * * * | day' and hit enter"></div>
				</div>
			</div>
		</div>
	</section>

	<section class="m">
		<label><i class="fa fa-info-circle"></i>@(Help)</label>
		<div class="padding">
			<div class="row ">
				<div class="col-md-12">
					value after | will be send to output when cronjob fires.<br>
					<br>
					second (0 - 59, OPTIONAL)<br>
					minute (0 - 59)<br>
					hour (0 - 23)<br>
					day of month (1 - 31)<br>
					month (1 - 12)<br>
					day of week (0 - 7) (0 or 7 is Sun)<br>
					<a href="https://www.npmjs.com/package/node-schedule" target="_blank">node-schedule</a>
					<p>
					Examples<br>
					0 16 * * * -> fire every day at 16:00<br>
					* 0 16 * * * -> start firing at 16:00 every day and it will keep firing every second until 16:01<br>
					19 * * * -> every day at 19 o'clock
					</p>
				</div>
			</div>
		</div>
	</section>
</div>`;

exports.readme = `# Cron
[node-schedule](https://www.npmjs.com/package/node-schedule) on npmjs.com

Syntax:
<cron string> | <data (only string supported)> | <comment>

Cron string:
* * * * * *
second (0 - 59, OPTIONAL)
minute (0 - 59)
hour (0 - 23)
day of month (1 - 31)
month (1 - 12)
day of week (0 - 7) (0 or 7 is Sun)

or

@startup to run once at the start or restart of an app (after 5 seconds)

Examples of cron string:
0 16 * * *      -> trigger every day at 16:00
* 0 16 * * *    -> trigger at 16:00 every day and it will keep triggering every second until 16:01
20,40 19 * * *  -> every day at 19:20 and 19:40
*/5 * * * *     -> trigger every 5 seconds
0 20 * * 1      -> every monday at 20:00
@startup        -> runs once at startup

Full example:
* 0 16 * * * | hello data | this is hello comment
@startup | start`;

exports.install = function(instance) {

	var startup = true;

	var schedule = require('node-schedule');

	var jobs = [];

	instance.on('options', reconfigure);

	reconfigure();

	function reconfigure() {
		var options = instance.options;
		startJobs(options.jobs);
	}

	function startJobs(newjobs) {

		jobs.forEach(function(job){
			job.cancel();
		});

		jobs = [];

		newjobs.forEach(function(job){
			job = job.split('|').trim();

			if (job[0] === '@startup' && startup) {
				setTimeout(function(){
					instance.send(job[1]);
				}, 5000);
				return;
			}

			var j = schedule.scheduleJob(job[0], function(){
				instance.send(job[1]);
			});

			jobs.push(j);
		});

		startup = false;
	}
};

