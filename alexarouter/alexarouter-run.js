// TEST INTERFACE FOR TOTAL.JS FLOW COMPONENT
require('total.js');
require('../flow');
FLOWINIT(require('./' + U.getName(process.argv[1].replace(/-run\.js$/, ''))));

// `assert` is a global variable

// ====================
// GLOBAL METHODS
// ====================

// FLOWDATA(data)              - sends data to component
// FLOWCLICK()                 - performs click event
// FLOWSIGNAL([data])          - sends signal to component
// FLOWEMIT(event, [data])     - emits an event
// FLOWOPTIONS(options)        - simulates a change of options
// FLOWCLOSE([callback])       - simulates closing
// FLOWTRIGGER(name, [data])   - simulates trigger
// FLOWDEBUG(true/false)       - enables internal output from console (default: true)
// FLOWUNINSTALL()             - uninstalls component
// FLOWINSTANCE                - a component instance

// ====================
// EVENTS FOR UNIT-TEST
// ====================

// ON('flow.ready')                    - triggered when the flow system is ready
// ON('flow.data', fn(data))           - triggered when FLOWDATA() is executed
// ON('flow.send', fn(index, data))    - triggered when the component performs `component.send()`
// ON('flow.options', fn(options))     - triggered when FLOWPTIONS() is executed
// ON('flow.signal', fn(index, data))  - triggered when FLOWSIGNAL() is executed
// ON('flow.status', fn(text, style))  - triggered when the component performs `component.status()`
// ON('flow.debug', fn(data, style))   - triggered when the component performs `component.debug()`
// ON('flow.close')                    - triggered when the component is closed

ON('flow.ready', function() {
	FLOWOPTIONS({ conditions: [{ type: 'LaunchRequest', name: "RatingIntent", index: 0 }], helpintentsmml: '<speak>\n\n</speak>', cancelintentsmml: '<speak>\n\n</speak>', stopintentsmml: '<speak>\n\n</speak>', nointentsmml: '<speak>\n\n</speak>' });
	FLOWDATA('{"request": { "type": "LaunchRequest", "requestId": "amzn1.echo-api.request.36023a37-b8a5-4a4f-889c-fd583f447299", "timestamp": "2018-06-03T12:31:21Z", "locale": "en-US", "shouldLinkResultBeReturned": false }}');
	FLOWCLOSE();
});
