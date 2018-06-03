exports.id = 'alexaresponse';
exports.title = 'Alexa Response';
exports.group = 'Alexa';
exports.color = '#5D9CEC';
exports.icon = 'arrow-right';
exports.input = true;
exports.output = 0;
exports.version = '1.0.0';
exports.author = 'John Graves';
exports.options = {responsesmml: '<speak>\n\n</speak>', repromptsmml: '<speak>\n\n</speak>', setresponse: false, reprompt: false, endsession: false };
exports.readme = `# Alexa response

This component builds a response message in smml format to be sent back to the Alexa after completing an intent.

A path can be used to parse a message out of an existing message or a hard-coded value can be set.

See demo here: https://youtu.be/YBtN4Ky3MLo`;

exports.html = `
<div class="padding">
	<div data-jc="textbox" data-jc-path="property" data-jc-config="placeholder:path.to.value">Property</div>
	<div data-jc="checkbox" data-jc-path="setresponse">@(Hardcode Response?)</div>
	<div data-jc="visible" data-jc-path="setresponse" data-jc-config="if:value">
		<div data-jc="codemirror" data-jc-path="responsesmml" data-jc-config="type:javascript;required:true;height:100;tabs:true;trim:true" class="m">@(Response SMML)</div>
	</div>
	<div data-jc="checkbox" data-jc-path="reprompt">@(Repropmt?)</div>
	<div data-jc="visible" data-jc-path="reprompt" data-jc-config="if:value">
		<div data-jc="codemirror" data-jc-path="repromptsmml" data-jc-config="type:javascript;required:true;height:100;tabs:true;trim:true" class="m">@(Reprompt SMML)</div>
	</div>
	<div data-jc="checkbox" data-jc-path="endsession">@(End Session?)</div>
	<p><a href="https://developer.amazon.com/docs/custom-skills/speech-synthesis-markup-language-ssml-reference.html" target="_blank">Alexa SMML Documentation</a></p>
	<p><a href="https://youtu.be/YBtN4Ky3MLo" target="_blank">Example Video</a></p>
</div>
`;

const ERRORMESSAGE = {};

exports.install = function(instance) {

	instance.on('data', function(flowdata) {

		var ctrl = flowdata.repository.controller;
		var sendsmml = flowdata.data;
		var repromptsmml = "<speak>Hello?</speak>";

		if (!ctrl) {
			ERRORMESSAGE.error = 'No controller to use for response!';
			ERRORMESSAGE.data = data;
			instance.debug(ERRORMESSAGE, 'error');
			return;
		}

		if(instance.options.setresponse) {
			sendsmml = instance.options.responsesmml;
			repromptsmml = instance.options.repromptsmml;
		}

		// Save all non-controller based repository attributes for future calls
		var sessionAttributes = flowdata.repository;
		delete sessionAttributes['controller'];

		var data = {
			"version": "1.0",
			"response": {
				"outputSpeech": {
					"type": "SSML",
					"ssml": sendsmml
				},
			"reprompt": {
					"outputSpeech": {
						"type": "SSML",
						"ssml": repromptsmml
					}
				},
				"shouldEndSession": instance.options.endsession
			},
			"sessionAttributes": sessionAttributes,
			"userAgent": "alexa-flow/1.0.0 Node/v8.10.0"
		}

		ctrl.json(data);
	});
};
