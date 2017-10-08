exports.id = 'cron';
exports.title = 'Cron';
exports.group = 'Inputs';
exports.color = '#F6BB42';
exports.output = 1;
exports.click = true;
exports.author = 'Martin Smola';
exports.icon = 'clock-o';
exports.options = {	enabled: true, jobs: [] };
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

value after | will be send to output when cronjob fires.

second (0 - 59, OPTIONAL)
minute (0 - 59)
hour (0 - 23)
day of month (1 - 31)
month (1 - 12)
day of week (0 - 7) (0 or 7 is Sun)

Examples
0 16 * * * -> fire every day at 16:00
* 0 16 * * * -> start firing at 16:00 every day and it will keep firing every second until 16:01
19 * * * -> every day at 19 o'clock	
`;

exports.install = function(instance) {

	var schedule = require('node-schedule');

	var jobs = [];

	instance.on('click', function(){
		instance.options.enabled = !instance.options.enabled;
		instance.save();
	});

	instance.on('options', reconfigure);

	reconfigure();

	function reconfigure(o, old_options) {
		var options = instance.options;
		cancelJobs();
		startJobs(options.jobs);
	}

	function cancelJobs() {

		jobs.forEach(function(job){
			console.log('Cancel', job);
			job.cancel();
		});
	};

	function startJobs(newjobs) {
		jobs = [];
		newjobs.forEach(function(job){
			job = job.split('|');

			var j = schedule.scheduleJob(job[0].trim(), function(){
				instance.send(job[1].trim());
			});

			jobs.push(j);
		});

	};
};

