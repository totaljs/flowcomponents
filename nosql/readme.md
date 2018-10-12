# NoSQL

## Outputs

First output is response from nosql engine and second is the data passed in.

## Collection

if the collection field is left empty, then we try to look at `flowdata.get('collection')`, to set this value you need to use `flowdata.set('collection', '<collection-name>')` in previous component (currently only `function` can be used)

## Insert

- will insert recieved data
- expects data to be an Object
- returns error, success, id

## Read

- will read a document by id
- expects data to be an Object with an `id` property
- returns error, response

## Update

- will update document by id
- expects data to be an Object with `id` property and all the props to be updated
- returns error, response
- if response is 0 then update failed

## Remove

- will remove document by id
- expects data to be an Object with an `id` property
- returns error, response
- if response is 0 then remove failed

## Query

- will query DB
- expects data to be an Array as shown bellow
- returns error, response

```javascript
[
	['where', 'sensor', 'temp'], // builder.where('sensor', 'temp');
	['limit', 2]                 // builder.limit(2);
]
```
