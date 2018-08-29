# node_api

Entering ‘node index.js’ on the command line starts the server so that it’s listening on two ports (http and https).  In listening to these ports, it can use the “staging” (default) or "production" environments (if we prepend 'node index.js' with NODE_ENV=production. 

In order to figure out which port to use, index.js defers to config.js

Config.js creates the two environment objects, one with a 'staging' key and the other with a 'production' key.  Config.js then checks the process.env object for a NODE_ENV value, and if that value matches one of the two environments keys, then it serves that key’s object, which includes the correct port and portName.  If there is no match, it defaults to the staging key.

With the right server spun, index.js goes on to call the unified server function.  When this picks up a request on ‘req’, it does the following: 
  1. parses the url
  2. gets the path, query string, method, and header and 
  3. constructs a decoder to decode the buffer object into a string. 

After this, it uses ‘req.on’ to bind a ‘data’ event to the req object so that when this object recieves data, the accompanying function will be called.  This function decodes the data and appends it to the buffer.

This is followed by an ‘end’ event, which triggers a function that does the following: 
  1. ends the decoding
  2. compares the trimmed path to the keys in the router object in order to get a “chosen handler”, 
  3. constructs a data object made of the parts parsed from the url, 
  4. and then calls the chosen handler, passing in the data and a callback.

This callback does the following: 
  1. sets the statusCode, 
  2. checks and stringify the payload, 
  3. writes the header, and 
  4. responds with the payload string.  
