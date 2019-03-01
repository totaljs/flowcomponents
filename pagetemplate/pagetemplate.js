exports.id = 'pagetemplate';
exports.title = 'Page template';
exports.group = 'Website';
exports.color = '#4a7d2c';
exports.input = false;
exports.output = false;
exports.version = '1.0.0';
exports.author = 'Martin Smola';
exports.icon = 'code';
exports.traffic = false;
exports.options = { template: '<h1>Hello @{model.firstname}</h1>', layout: false };

exports.html = `<div class="padding">
	<div data-jc="textbox" data-jc-path="name" data-jc-config="placeholder:@(Post template);required:true" class="m">@(Template name)</div>
	<div data-jc="checkbox" data-jc-path="layout">@(Is this template a layout?)</div>
	<div class="help m">@(Layout should contain html, head and body tags and any other templates will be injected into this layout.)</div>
	<div data-jc="codemirror" data-jc-path="template" data-jc-config="required:true">@(Template)</div>
</div>`;

exports.readme = `# Template

### Layout

Use \`@{body}\` placeholder to insert other template, only works for layout

Incoming data are available in the templates or layouts as \`model\`

Data:
\`\`\`javascript
{
	id: 123,
	title: 'Homepage'
}
\`\`\`

Template:
\`\`\`html
<h1 class="post-@{model.id}">@{model.title}</h1>
\`\`\`
`;

exports.install = function(instance) {

	instance.custom.reconfigure = function() {
		var can = instance.options.template ? true : false;
		instance.status(can ? '' : 'Not configured', can ? undefined : 'red');
		templates = templates.remove('id', instance.id);
		templates.push({ id: instance.id, name: instance.options.name });
	};

	instance.on('options', instance.custom.reconfigure);
	instance.custom.reconfigure();
};

var templates = exports.templates = [];

FLOW.trigger('pagetemplates', function(next) {
	var tmps = [''];
	templates.forEach(t => tmps.push({id: t.id, name: t.name}));
	next(tmps);
});