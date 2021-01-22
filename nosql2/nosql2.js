exports.id = 'nosql2';
exports.title = 'NoSQL 2';
exports.version = '1.0.1';
exports.group = 'Databases';
exports.author = 'Martin Smola';
exports.color = '#D770AD';
exports.icon = 'database';
exports.input = true;
exports.output = 1;
exports.options = {};
exports.readme = `# NoSQL embedded

## Outputs
- response from nosql engine

## Settings
- collection: (optional) if not set, incomming data object must have a 'collection' property set
- method: (optional) if not set, incomming data object must have a 'method' property set

## Input
\`\`\`javascript
{
	collection: 'users', // optional, will override settings value
	method: 'users', // optional, will override settings value
	idname: 'key', // optional, value of query.key will be used as an id
	// for Insert, Read, Update, Remove
	query: <document object>,
	// for Query
	query: [],
}
\`\`\`
## Insert

- will insert recieved data
- expects data to be an Object
- returns error, success, id

## Read

- will read a document by id
- expects data to be an Object with an \`id\` property(unless specified by idname)
- returns error, response

## Update

- will update document by id
- expects data to be an Object with \`id\` property(unless specified by idname) and all the props to be updated
- returns error, response
- if response is 0 then update failed

## Remove

- will remove document by id
- expects data to be an Object with an \`id\` property(unless specified by idname)
- returns error, response
- if response is 0 then remove failed

## Query

- will query DB
- expects data to be an Array as shown bellow
- returns error, response

\`\`\`javascript
[
	['where', 'sensor', 'temp'], // builder.where('sensor', 'temp');
	['limit', 2]                 // builder.limit(2);
]
\`\`\``;

exports.html = `
<div class="padding">
	<div data-jc="textbox" data-jc-path="collection" class="m mt10">DB collection name</div>
	<div data-jc="dropdown" data-jc-path="method" data-jc-config="required:true;items:insert,update,read,query,remove" class="m">@(Method)</div>
	<div data-jc="visible" data-jc-path="method" data-jc-config="if:value === 'insert'">
		<div data-jc="checkbox" data-jc-path="addid">Add unique ID to data before insert</div>
	</div>
	<div data-jc="visible" data-jc-path="method" data-jc-config="if:value === 'update'">
		<div data-jc="checkbox" data-jc-path="upsert">Insert document if it doesn't exist</div>
		<div data-jc="checkbox" data-jc-path="upsertid">Add unique ID to data before insert (only if it doesn't exist)</div>
	</div>
</div>`;

exports.install = function(instance) {

	instance.on('data', function(flowdata, next) {

		instance.send2(1, flowdata.clone());

		var data = flowdata.data;
		var id = data.idname || 'id';
		var options = instance.options;

		var collection = data.collection || options.collection;
		if (!collection) {
			next(0, flowdata.rewrite({ success: false, err: '[DB] No collection specified' }));
			return;
		}

		var nosql = NOSQL(collection);
		var method = flowdata.data.method || options.method;

		if (!method) {
			next(0, flowdata.rewrite({ success: false, err: '[DB] No method specified' }));
			return;
		}

		var builder;

		if (method === 'read') {

			if (!data[id]) {
				next(0, flowdata.rewrite({ success: false, err: '[DB] Cannot get record by id: `undefined`' }));
				return;
			}

			builder = nosql.find();
			builder.where(id, data[id]);
			builder.first();
			builder.callback(function(err, response) {
				next(0, flowdata.rewrite({ success: err ? false : true, result: response }));
			});

		} else if (method === 'insert') {

			options.addid && (data[id] = UID());
			nosql.insert(data).callback(function(err) {
				next(0, flowdata.rewrite({ success: err ? false : true, result: data[id] }));
			});

		} else if (method === 'query') {

			var query = data;
			builder = nosql.find();
			query && query instanceof Array && query.forEach(function(q) {
				if (q instanceof Array) {
					var m = q[0];
					var args = q.splice(1);
					builder[m] && (builder[m].apply(builder, args));
				}
			});

			builder.callback(function(err, response) {
				next(0, flowdata.rewrite({ success: err ? false : true, result: response || [] }));
			});

		} else if (method === 'update') {

			if (!options.upsert && !data[id]) {
				next(0, flowdata.rewrite({ success: false, err: '[DB] Cannot update record by id: `undefined`' }));
				return;
			}

			if (options.upsert && (options.upsertid && !data[id]))
				data[id] = UID();

			builder = nosql.modify(data, options.upsert);
			builder.where(id, data[id]);
			builder.callback(function(err, count) {
				next(0, flowdata.rewrite({ success: err ? false : true, result: count || 0 }));
			});

		} else if (method === 'remove') {

			if (!data[id]) {
				next(0, flowdata.rewrite({ success: false, err: '[DB] Cannot remove record by id: `undefined`' }));
				return;
			}

			builder = nosql.remove();
			builder.where(id, data[id]);
			builder.callback(function(err, count) {
				next(0, flowdata.rewrite({ success: err ? false : true, result: count || 0 }));
			});
		}

	});
};
