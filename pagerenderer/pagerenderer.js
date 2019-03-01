exports.id = 'pagerenderer';
exports.title = 'Page renderer';
exports.group = 'Website';
exports.version = '1.0.0';
exports.color = '#67B13D';
exports.input = 1;
exports.output = 1;
exports.author = 'Martin Smola';
exports.icon = 'code';
exports.options = { layout: '', template: '' };

exports.html = `<div class="padding">
	<div data-jc="dropdown" data-jc-path="layout" data-jc-config="datasource:pagerenderer.templates" class="m">@(Layout)</div>
	<div data-jc="dropdown" data-jc-path="template" data-jc-config="datasource:pagerenderer.templates;required:true">@(Template)</div>
</div>
<script>
	ON('open.pagerenderer', function(component, options) {
		TRIGGER('pagetemplates', 'pagerenderer.templates');
	});
	ON('save.pagerenderer', function(component, options) {
		if (!component.name) {
			var layout = pagerenderer.templates.findItem('id', options.layout);
			var template = pagerenderer.templates.findItem('id', options.template);
			console.log(layout);
			console.log(template);
			var name = '';
			if (layout)
				name = layout.name + ' -> ';
			name += template.name;
			component.name = name;
		}
	});
</script>`;

exports.readme = `# Page renderer
Renders data into selected layout and template.

Incoming data are available in the templates as \`model\`

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

	var ready = false;

	var pagetemplate = '';

	instance.on('data', function(flowdata){
		console.log('DATA', ready, flowdata.data);
		if (!ready)
			return;

		try {
			flowdata.data = F.viewCompile('@{nocompress all}\n' + pagetemplate, flowdata.data, '', flowdata.parent);
			instance.send2(flowdata);
		} catch (e) {
			instance.error(e.toString());
		}
	});

	instance.custom.reconfigure = function() {
		ready = instance.options.template ? true : false;
		instance.status(ready ? '' : 'Not configured', ready ? undefined : 'red');
		ready && make_template();
	};

	function make_template(){

		var templatecomp = FLOW.instance(instance.options.template);
		pagetemplate = templatecomp.options.template;

		if (instance.options.layout) {
			var layoutcomp = FLOW.instance(instance.options.layout);
			var layout = layoutcomp.options.template;
			pagetemplate = layout.replace('@{body}', pagetemplate);
		}
	}

	instance.on('options', instance.custom.reconfigure);

	ON('flow.init', function() {
		instance.custom.reconfigure();
	});
};