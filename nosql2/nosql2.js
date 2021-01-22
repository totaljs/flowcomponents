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
	var getBuilder = function(obj){
		return F.is4 ? { make : function(fn){fn(obj);} } : obj;
	};
	
	instance.on('data', function(flowdata, next) {

		instance.send2(1, flowdata.clone());

		var data = flowdata.data;
		var id = data.idname || 'id';
		var options = instance.options;

		var collection = data.collection || options.collection;
		if (!collection)
			return next(0, flowdata.rewrite({ success: false, err: '[DB] No collection specified' }));

		var nosql = NOSQL(collection);
		var method = flowdata.data.method || options.method;

		if (!method)
			return next(0, flowdata.rewrite({ success: false, err: '[DB] No method specified' }));

		if (method === 'read') {

			if (!data[id])
				return next(0, flowdata.rewrite({ success: false, err: '[DB] Cannot get record by id: `undefined`' }));

			getBuilder(nosql.find()).make(function(builder) {
				builder.where(id, data[id]);
				builder.first();
				builder.callback(function(err, response) {
					next(0, flowdata.rewrite({ success: err ? false : true, result: response }));
				});
			});

		} else if (method === 'insert') {

			options.addid && (data[id] = UID());
			nosql.insert(data).callback(function(err) {
				next(0, flowdata.rewrite({ success: err ? false : true, result: data[id] }));
			});

		} else if (method === 'query') {

			var query = data;
			getBuilder(nosql.find()).make(function(builder) {
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
			});

		} else if (method === 'update') {

			if (!options.upsert && !data[id]) {
				next(0, flowdata.rewrite({ success: false, err: '[DB] Cannot update record by id: `undefined`' }));
			}

			if (options.upsert && (options.upsertid && !data[id]))
				data[id] = UID();

			getBuilder(nosql.modify(data, options.upsert)).make(function(builder) {
				builder.where(id, data[id]);
				builder.callback(function(err, count) {
					next(0, flowdata.rewrite({ success: err ? false : true, result: count || 0 }));
				});
			});

		} else if (method === 'remove') {

			if (!data[id])
				return next(0, flowdata.rewrite({ success: false, err: '[DB] Cannot remove record by id: `undefined`' }));

			getBuilder(nosql.remove()).make(function(builder) {
				builder.where(id, data[id]);
				builder.callback(function(err, count) {
					next(0, flowdata.rewrite({ success: err ? false : true, result: count || 0 }));
				});
			});
		}
	});
};
