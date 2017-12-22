# Function

Allows you to do sync operation on data

If `send` function isn't called the data flow will not continue.

__Custom function__:

```javascript
data;    	   // recieved data
send;    	   // send data to next component, optionaly specify output index -> send(0, data);
instance; 	   // ref to value.instance, available methods get, set, rem for storing temporary data related to this instance of Function component and  debug, status and error for sending data to designer
global;   	   // ref to value.global, available methods get, set, rem for storing persistent data globally accessible in any component
flowdata; 	   // ref to value.flowdata, instance of FlowData - available methods get, set, rem for storing temporary data related to current flow
flowdata.data; // user defined data recieved from previous component

// Example:
send('Hello world.'); // sends data to all outputs
send(0, 'Hello world.'); // sends data only to first output

// Calling send without any argument will pass incomming data to next components
send();
```