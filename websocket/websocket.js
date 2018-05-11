exports.id = 'websocket';
exports.title = 'WebSocket Listener';
exports.group = 'HTTP';
exports.color = '#5D9CEC';
exports.icon = 'exchange';
exports.output = 1;
exports.version = '1.0.0';
exports.author = 'John Graves';
exports.options = { json: true };
exports.cloning = false;
exports.npm = [ 'html5-websocket' ];

exports.html = `<div class="padding">
  <div data-jc="textbox" data-jc-path="url" class="m" data-jc-config="required:true;maxlength:500;placeholder:ws\\://myhost\\:myport/mypath">@(WS address)</div>
  <div data-jc="checkbox" data-jc-path="json">@(JSON Message)</div>
</div>`

exports.readme = `# Request

This component creates a websocket to the given URI and outputs data received.

__Response:__

Based no websocket data.  There is an option to parse the data for JSON.

__Arguments:__
- url address e.g. \`ws://myhost:port/path\`
- json - Parse data from websocket as json.`;

exports.install = function(instance) {

  instance.reconfigure = function() {
    var socketUrl = instance.options.url;
    if(socketUrl === undefined || socketUrl === "") {
      return;
    }
    instance.debug("WebSocket: Connect to: "+socketUrl);

    const WebSocket = require('html5-websocket');
    const ReconnectingWebSocket = require('reconnecting-websocket');
    instance.websocket = new ReconnectingWebSocket(socketUrl,[],{ constructor: WebSocket });
    instance.websocket.onmessage = function(evt) {
      var data = evt.data;
      if(instance.options.json === true) {
        data = JSON.parse(data);
      }
      instance.send2(data);
    };
    instance.websocket.onclose = function() {
      instance.debug("WebSocket["+socketUrl+"] closed");
    };
    instance.websocket.onerror = function(evt) {
      instance.debug("WebSocket["+socketUrl+"] error");
    };
  };

  instance.on('close', function() {
  });

  instance.options.json = true;
  instance.reconfigure();
};

