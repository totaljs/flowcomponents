# Template

### Layout
Use `@{body}` placeholder to insert other template, only works for layout

Incoming data are available in the templates or layouts as `model`

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