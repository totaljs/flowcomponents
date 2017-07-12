# Page renderer
Renders data into selected layout and template.

Incoming data are available in the templates as \`model\`

Data:
```javascript
{
	id: 123,
	title: 'Homepage'
}
```

Template:
```html
<h1 class="post-@{model.id}">@{model.title}</h1>
```