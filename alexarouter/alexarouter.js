exports.id = 'alexarouter';
exports.title = 'Alexa Router';
exports.group = 'Alexa';
exports.color = '#AAAAFF';
exports.icon = 'globe';
exports.input = 1;
exports.output = 1;
exports.version = '1.1.2';
exports.author = 'John Graves';
exports.cloning = false;
exports.options = { conditions: [{ type: 'LaunchRequest', name: '', index: 0 }], helpintentsmml: '<speak>\n\n</speak>', cancelintentsmml: '<speak>\n\n</speak>', stopintentsmml: '<speak>\n\n</speak>', nointentsmml: '<speak>\n\n</speak>' };
exports.readme = `# Alexa router

This component takes mssages from a HTTP Route node and parses various Alexa intents.

See demo here: https://youtu.be/YBtN4Ky3MLo

__Outputs__:
- LaunchRequest
- AMAZON.HelpIntent (Optional)
- AMAZON.CancelIntent (Optional)
- AMAZON.StopIntent (Optional)
- AMAZON.NoIntent (Optional)
- AMAZON.FallbackIntent (Optional)
- SessionEndedRequest`;

exports.html = `
<style>
	.cond-col1 { width:20px; float:left; }
	.cond-col2 { width:200px; float:left; }
	.cond-col3 { width:300px; float:left; }
	.cond-col4 { width:30px; float:left; }
	.pr10 { padding-right:10px; }
	.cond-remove { padding: 8px 13px; }
</style>
<div class="padding">
	<section>
		<label><i class="fa fa-edit"></i>@(Conditions)</label>
		<div class="padding npb">
			<div class="row">
				<div class="col-md-12">
					<div class="cond-col1"><strong>#</strong></div>
					<div class="cond-col2"><strong>Request Type</strong></div>
					<div class="cond-col3"><strong>Intent Name</strong></div>
				</div>
			</div>
			<div data-jc="repeater__conditions" class="mt10">
				<script type="text/html">
				<div class="row">
					<div class="col-md-12">
						<div class="cond-col1 mt5"><strong>$index</strong></div>
						<div class="cond-col2 pr10"><div data-jc="dropdown__conditions[$index].type__items:LaunchRequest,IntentRequest,Both" class="m"></div></div>
						<div class="cond-col3 pr10"><div data-jc="textbox__conditions[$index].name__placeholder:@(intent name)"></div></div>
						<div class="cond-col4"><button class="exec button button-small cond-remove" data-exec="FUNC.alexaroutercomponent_remove_condition" data-index="$index"><i class="fa fa-trash"></i></button></div>
					</div>
				</div>
				</script>
			</div>
			<div class="row">
				<div class="col-md-2 m">
					<br>
					<button class="exec button button-small" data-exec="FUNC.alexaroutercomponent_add_condition"><i class="fa fa-plus mr5"></i>ADD</button>
				</div>
			</div>
		</div>
	</section>
	<br />
	<section class="m">
		<label>@(Default Intents)</label>
		<div class="padding">
			<div data-jc="checkbox__helpintentoverride">@(Override Help Intent)</div>
			<div data-jc="visible__helpintentoverride__if:value">
				<div data-jc="codemirror__helpintentsmml__type:javascript;required:true;height:70;tabs:true;trim:true" class="m">@(Help Intent SMML)</div>
			</div>
			<div data-jc="checkbox__cancelintentoverride">@(Cancel Intent)</div>
			<div data-jc="visible__cancelintentoverride" data-jc-config="if:value">
				<div data-jc="codemirror__cancelintentsmml__type:javascript;required:true;height:70;tabs:true;trim:true" class="m">@(Cancel Intent SMML)</div>
			</div>
			<div data-jc="checkbox__stopintentoverride">@(Stop Intent)</div>
			<div data-jc="visible__stopintentoverride" data-jc-config="if:value">
				<div data-jc="codemirror__stopintentsmml__type:javascript;required:true;height:70;tabs:true;trim:true" class="m">@(Stop Intent SMML)</div>
			</div>
			<div data-jc="checkbox__nointentoverride">@(No Intent)</div>
			<div data-jc="visible__nointentoverride__if:value">
				<div data-jc="codemirror__nointentsmml__type:javascript;required:true;height:70;tabs:true;trim:true" class="m">@(No Intent SMML)</div>
			</div>
		</div>
	</section>
	<div><a href="https://developer.amazon.com/docs/custom-skills/speech-synthesis-markup-language-ssml-reference.html" class="b" target="_blank">Alexa SMML Documentation</a></div>
	<div><a href="https://youtu.be/YBtN4Ky3MLo" target="_blank">Example Video</a></div>
</div>
<script>

	var changed = false;
	var outputs_count;

	ON('open.alexarouter', function(component, options) {
		outputs_count = options.conditions.length || 0;
	});

	ON('save.alexarouter', function(component, options) {
		var length = options.conditions.length || 0;
		component.output = [];
		component.output.push('#FFFF00|Init'); // LaunchRequest
		for(var i = 0;i < length;i++) {
			component.output.push('#FFFFFF|'+options.conditions[i].name); // Intents are white
		}

		component.output.push('#444444|Fallback Intent'); // AMAZON.FallbackIntent
		component.output.push('#FF4444|Session End'); // Session End Path
		setState(MESSAGES.apply);
	});

	FUNC.alexaroutercomponent_add_condition = function() {
		PUSH('settings.alexarouter.conditions', {type: 'IntentRequest', name: ''});
		changed = true;
	};

	FUNC.alexaroutercomponent_remove_condition = function(button){
		var index = button.attr('data-index');
		var conditions = settings.alexarouter.conditions;
		conditions = conditions.remove('index', parseInt(index));
		SET('settings.alexarouter.conditions', conditions);
		changed = true;
	};

</script>`;

exports.install = function(instance) {
	instance.on('data', function(flowdata) {
		var ctrl = flowdata.repository.controller;
		switch(flowdata.data.body.request.type) {
			case 'LaunchRequest':
				instance.status('LaunchRequest Received', 'green');
				instance.send2(0, flowdata);
				break;
			case 'Both':
			case 'IntentRequest':
				instance.status('IntentRequest Received: '+flowdata.data.body.request.intent.name, 'green');
				switch(flowdata.data.body.request.intent.name) {
					case 'AMAZON.HelpIntent':
						if(instance.options.helpintentoverride) {
							instance.sendReply(ctrl,instance.options.helpintentsmml,'<speak>Hello?</speak>',false);
						} else {
							instance.sendReply(ctrl,'<speak>I\'m sorry, there is no help for this module.</speak>','<speak>Hello? Anyone there?</speak>',true);
						}
						break;
					case 'AMAZON.CancelIntent':
						if(instance.options.cancelintentoverride) {
							instance.sendReply(ctrl,instance.options.cancelintentsmml,'<speak>Hello?</speak>',false);
						} else {
							instance.sendReply(ctrl,'<speak>Goodbye</speak>','<speak>Hello? Anyone there?</speak>',true);
						}
						break;
					case 'AMAZON.StopIntent':
						if(instance.options.stopintentoverride) {
							instance.sendReply(ctrl,instance.options.stopintentsmml,'<speak>Hello?</speak>',false);
						} else {
							instance.sendReply(ctrl,'<speak>Goodbye</speak>','<speak>Hello? Anyone there?</speak>',true);
						}
						break;
					case 'AMAZON.NoIntent':
						if(instance.options.nointentoverride) {
							instance.sendReply(ctrl,instance.options.nointentsmml,'<speak>Hello?</speak>',true);
						} else {
							instance.sendReply(ctrl,'<speak>Goodbye</speak>','<speak>Hello? Anyone there?</speak>',true);
						}
						break;
					case 'AMAZON.FallbackIntent':
						// Send to fallback.
						instance.send2(instance.options.conditions.length+1, flowdata);
						break;
					default:
						//Custom intent.
						var found=false;
						for(var i=0;i<instance.options.conditions.length;i++) {
							if(flowdata.data.body.request.intent.name === instance.options.conditions[i].name) {
								instance.send2(i+1, flowdata);
								found=true;
							}
						}
						if(!found) {
							instance.sendReply(ctrl,'<speak>I don\'t know how to handle intent '+flowdata.data.body.request.intent.name+'</speak>','<speak>Hello? Anyone there?</speak>',false);
						}
						break;
				}
				break;
			case 'SessionEndedRequest':
				instance.status('Session End Request Received.', 'green');
				instance.send2(instance.options.conditions.length+2, flowdata);
		}
	});

	instance.sendReply = function(ctrl,say,repropmt,endsession) {
		var data = {
			'version': '1.0',
			'response': {
				'outputSpeech': {
					'type': 'SSML',
					'ssml': say
				},
				'reprompt': {
					'outputSpeech': {
						'type': 'SSML',
						'ssml': say
					}
				},
				'shouldEndSession': endsession
			},
			'sessionAttributes': {},
			'userAgent': 'alexa-flow/1.0.0 Node/v8.10.0'
		};
		ctrl.json(data);
	};
};
