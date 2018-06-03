exports.id = 'alexarouter';
exports.title = 'Alexa Router';
exports.group = 'Alexa';
exports.color = '#AAAAFF';
exports.icon = 'globe';
exports.input = false;
exports.output = 1;
exports.version = '1.1.0';
exports.author = 'John Graves';
exports.cloning = false;
exports.options = { conditions: [{ type: 'LaunchRequest', name: "", index: 0 }], helpintentsmml: '<speak>\n\n</speak>', cancelintentsmml: '<speak>\n\n</speak>', stopintentsmml: '<speak>\n\n</speak>', nointentsmml: '<speak>\n\n</speak>' }
exports.readme = `# Alexa router

This component listens to a REST Post service based on the URL and forward Alexa requests to the appropriate intent.

See demo here: https://youtu.be/YBtN4Ky3MLo

__Outputs__:
- LaunchRequest
- AMAZON.HelpIntent (Optional)
- AMAZON.CancelIntent (Optional)
- AMAZON.StopIntent (Optional)
- AMAZON.NoIntent (Optional)
- AMAZON.FallbackIntent (Optional)
- SessionEndedRequest

`
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
		<label>@(Main settings)</label>
		<div class="padding npb">
			<div data-jc="textbox" data-jc-path="url" class="m" data-jc-config="required:true;maxlength:500;placeholder:/api/test">@(URL path)</div>
		</div>
	</section>
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
			<div data-jc="repeater" data-jc-path="conditions" class="mt10">
				<script type="text/html">
				<div class="row">
					<div class="col-md-12">
						<div class="cond-col1 mt5"><strong>$index</strong></div>
						<div class="cond-col2 pr10"><div data-jc="dropdown" data-jc-path="conditions[$index].type" data-jc-config="items:LaunchRequest,IntentRequest,Both" class="m"></div></div>
						<div class="cond-col3 pr10"><div data-jc="textbox" data-jc-path="conditions[$index].name" data-jc-config="placeholder:@(intent name)"></div></div>
						<div class="cond-col4"><button class="exec button button-small cond-remove" data-exec="#alexaroutercomponent_remove_condition" data-index="$index"><i class="fa fa-trash"></i></button></div>
					</div>
				</div>
				</script>
			</div>
			<div class="row">
				<div class="col-md-2 m">
					<br>
					<button class="exec button button-small" data-exec="#alexaroutercomponent_add_condition"><i class="fa fa-plus mr5"></i>ADD</button>
				</div>
			</div>
		</div>
	</section>
	<section>
		<label>@(Default Intents)</label>
		<div class="padding npb">
			<div data-jc="checkbox" data-jc-path="helpintentoverride">@(Override Help Intent)</div>
			<div data-jc="visible" data-jc-path="helpintentoverride" data-jc-config="if:value">
				<div data-jc="codemirror" data-jc-path="helpintentsmml" data-jc-config="type:javascript;required:true;height:70;tabs:true;trim:true" class="m">@(Help Intent SMML)</div>
			</div>
			<div data-jc="checkbox" data-jc-path="cancelintentoverride">@(Cancel Intent)</div>
			<div data-jc="visible" data-jc-path="cancelintentoverride" data-jc-config="if:value">
				<div data-jc="codemirror" data-jc-path="cancelintentsmml" data-jc-config="type:javascript;required:true;height:70;tabs:true;trim:true" class="m">@(Cancel Intent SMML)</div>
			</div>
			<div data-jc="checkbox" data-jc-path="stopintentoverride">@(Stop Intent)</div>
			<div data-jc="visible" data-jc-path="stopintentoverride" data-jc-config="if:value">
				<div data-jc="codemirror" data-jc-path="stopintentsmml" data-jc-config="type:javascript;required:true;height:70;tabs:true;trim:true" class="m">@(Stop Intent SMML)</div>
			</div>
			<div data-jc="checkbox" data-jc-path="nointentoverride">@(No Intent)</div>
			<div data-jc="visible" data-jc-path="nointentoverride" data-jc-config="if:value">
				<div data-jc="codemirror" data-jc-path="nointentsmml" data-jc-config="type:javascript;required:true;height:70;tabs:true;trim:true" class="m">@(No Intent SMML)</div>
			</div>
		</div>
	</section>
	<p><a href="https://developer.amazon.com/docs/custom-skills/speech-synthesis-markup-language-ssml-reference.html" target="_blank">Alexa SMML Documentation</a></p>
	<p><a href="https://youtu.be/YBtN4Ky3MLo" target="_blank">Example Video</a></p>
</div>
<script>

	var changed = false;
	var outputs_count;

	ON('open.alexarouter', function(component, options) {
		outputs_count = options.conditions.length || 0;
	});

	ON('save.alexarouter', function(component, options) {
		!component.name && (component.name = 'POST ' + options.url);
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

	OPERATION('alexaroutercomponent_add_condition', function(){
		PUSH('settings.alexarouter.conditions', {type: 'IntentRequest', name: ''});
		changed = true;
	});

	OPERATION('alexaroutercomponent_remove_condition', function(button){
		var index = button.attr('data-index');
		var conditions = settings.alexarouter.conditions;
		conditions = conditions.remove('index', parseInt(index));
		SET('settings.alexarouter.conditions', conditions);
		changed = true;
	});

</script>

`;

exports.install = function(instance) {

	var id;

	instance.reconfigure = function(firstCall) {

		var options = instance.options;

		if (!options.url) {
			instance.status('Not configured', 'red');
			return;
		};

		var length = F.routes.web.length;
		for (var i = 0; i < length; i++) {
			if (F.routes.web[i].name === options.url)
				if(firstCall) { // If this is the first time this module has been created, warn the user if the URL is used elsewhere
					return instance.status('URL already in use', 'red');
				} else { // The URL is in use already because this module is already listening.  Don't repeat the route call.
					return instance.status('Listening', 'green');
				};
		};

		id && UNINSTALL('route', id);
		id = 'id:' + instance.id;

		var flags = [];
		flags.push('post');
		F.route(options.url, function() {

			if (instance.paused) {
				this.status = 503;
				this.content('Service is currently unavailable, please try again later.');
				return;
			};

			var key;
			var self = this;

			var data = instance.make({
				query: self.query,
				body: self.body,
				session: self.session,
				user: self.user,
				files: self.files,
				headers: self.req.headers,
				url: self.url,
				params: self.params,
				mobile: self.mobile,
				robot: self.robot,
				referrer: self.referrer,
				language: self.language
			});

			data.repository.controller = self;

			switch(data.data.body.request.type) {
				case 'LaunchRequest':
					instance.status('LaunchRequest Received', 'green');
					instance.send2(0, data);
					break;
				case 'Both':
				case 'IntentRequest':
					instance.status('IntentRequest Received: '+data.data.body.request.intent.name, 'green');
					switch(data.data.body.request.intent.name) {
						case 'AMAZON.HelpIntent':
							if(options.helpintentoverride) {
								instance.sendReply(self,instance.options.helpintentsmml,'<speak>Hello?</speak>',false);
							} else {
								instance.sendReply(self,'<speak>I\'m sorry, there is no help for this module.</speak>','<speak>Hello? Anyone there?</speak>',true);
							};
							break;
						case 'AMAZON.CancelIntent':
							if(options.cancelintentoverride) {
								instance.sendReply(self,instance.options.cancelintentsmml,'<speak>Hello?</speak>',false);
							} else {
								instance.sendReply(self,'<speak>Goodbye</speak>','<speak>Hello? Anyone there?</speak>',true);
							};
							break;
						case 'AMAZON.StopIntent':
							if(options.stopintentoverride) {
								instance.sendReply(self,instance.options.stopintentsmml,'<speak>Hello?</speak>',false);
							} else {
								instance.sendReply(self,'<speak>Goodbye</speak>','<speak>Hello? Anyone there?</speak>',true);
							};
							break;
						case 'AMAZON.NoIntent':
							if(options.nointentoverride) {
								instance.sendReply(self,instance.options.nointentsmml,'<speak>Hello?</speak>',true);
							} else {
								instance.sendReply(self,'<speak>Goodbye</speak>','<speak>Hello? Anyone there?</speak>',true);
							};
							break;
						case 'AMAZON.FallbackIntent':
							// Send to fallback.
							instance.send2(options.conditions.length+1, data);
							break;
						default:
							//Custom intent.
							var found=false;
							for(var i=0;i<instance.options.conditions.length;i++) {
								if(data.data.body.request.intent.name === instance.options.conditions[i].name) {
									instance.send2(i+1, data);
									found=true;
								};
							};
							if(!found) {
								instance.sendReply(self,'<speak>I don\'t know how to handle intent '+data.data.body.request.intent.name+'</speak>','<speak>Hello? Anyone there?</speak>',false);
							};
							break;
					};
					break;
				case 'SessionEndedRequest':
					instance.status('Session End Request Received.', 'green');
					instance.send2(options.conditions.length+2, data);
			};
		}, flags, 5);

		instance.status('Listening', 'green');
	};

	instance.reconfigure(true);
	instance.on('options', function() {
		instance.reconfigure(false);
	});

	instance.on('close', function() {
		id && UNINSTALL('route', id);
	});

	instance.sendReply = function(self,say,repropmt,endsession) {
		data = {
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

		self.json(data);
	};
};
