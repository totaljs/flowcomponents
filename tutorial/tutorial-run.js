// TEST INTERFACE FOR TOTAL.JS FLOW COMPONENT
require('total4');
require('../flow');
FLOWINIT(require('./' + U.getName(process.argv[1].replace(/-run\.js$/, ''))));

// `assert` is a global variable

// ====================
// GLOBAL METHODS
// ====================

// FLOWDATA(data, [index])     - sends data to component
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

	// Updates configuration
	FLOWOPTIONS({ delay: 1500 });

	// Simulates click
	FLOWCLICK();

	setTimeout(function() {

		FLOWDATA('Hello Tutorial!', 0);

	}, 1000);

	setTimeout(function() {
		// Close the component
		FLOWCLOSE();
	}, 5000);
});
