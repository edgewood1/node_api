// primary file for the API

// dependencies

// http module enables requests and responses via a server

const http = require('http');

// use fs module allows us to read from / write to the file system 

var fs = require('fs')

// the url module splits up a web address into useable parts 

const url = require('url');

// https allows us to create a server that uses TLS / SSL protocol.  

const https = require('https')

// this decoder allows us to decode Buffer objects into strings

var StringDecoder = require('string_decoder').StringDecoder;

// this is our import that contains server configurations:

var config = require('./config')

// here, we instantiate our http server: 

var httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
    })

// and start it: 

httpServer.listen(config.httpPort, function() {
    console.log("the server is listening on port " + config.httpPort )
})

// this object points to the files with our keys and certificates used in https.createServer

var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
}

// instantiating the https server, passing in our keys/cert object

var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
})

// starting it: 

httpsServer.listen(config.httpsPort, function() {
    console.log("the server is listening on port " + config.httpsPort)
})


// all the server logic for both the http and https server

var unifiedServer = function(req, res) {

    // get url and parse it to get meta data about host
    // true activates the  query string module.  
    
    var parsedUrl = url.parse(req.url, true)
    
    // a url method that gets untrimmed path from url: 

    var path = parsedUrl.pathname;
    
    // here, we trim the path using regex, which means: 
    // \/+ - matches any slashes that occur at start OR  (|) end 
    // /g - global match rather than stopping at the first - to perform a global, case-insensitive serach, use g with i)  
    // use the .replace method: slashes with blank space ''  
    
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // get the query parameters and translates into an object with keys and values.
    // we can do this because we marked 'true' on url.parse
    
    var queryStringObject = parsedUrl.query;

    // get HTTP method and place in lowercase:

    var method = req.method.toLowerCase()

    // get the headers as an Object: 

    var headers = req.headers;

    // get the StringDecoder module to decode our buffer

    var decoder = new StringDecoder('utf-8');

    var buffer = '';

    // .on binds an event (arbitrarily called 'data') to the 'req' object. 
    // So, each time the req object recieves data, we run this function
    // this function decodes the data and appends it to our buffer until there's no more data?:  

    req.on('data', function(data) {
        buffer += decoder.write(data);
    })

    // By this time, the buffering is over, so: 

    req.on('end', function() {

        // we end the decoding: 

        buffer += decoder.end()

        // check if the trimmed path matches any of the keys in our router object.  If not, the chosenHandler is handlers.notFound. 

        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct data object to send to the handler

        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        }
        
        // call the handler function (whether it is handler.notFound or one in the router object)
        // pass in data object (above) and function noted in 2nd parameter.
        // the handler function will take the data as well as the noted function as a callback  

        chosenHandler(data, function(statusCode, payload) {

            // set the statusCode: 
            
            statusCode = typeof(statusCode)  == 'number' ? statusCode : 200;

            // if theres no payload object, default to empty object
            
            payload = typeof(payload) == 'object' ? payload : {};

            // to pass a payload via HTTP, we need to stringify it:  

            var payloadString = JSON.stringify(payload);

            // create the head for our response:  
            
            res.writeHead(statusCode, {
                "Content-Type": "application/json"
            })

            // send our payload: 

            res.end(payloadString);
                
            // for kicks, I'm parsing logging the payload.payload, 
            // which I had set as {"abc":"123"}

            var obj = JSON.parse(payload.payload)
            

            console.log("returning ", statusCode, obj.abc);
        

        })
    })
}


// define handlers 

var  handlers = {};

// ping handler

handlers.ping = function(data, callback) {    
    callback(200, data)// this is the function passed in as the chosenHandler argumnet
}
 
// not found handler 

handlers.notFound = function(data, callback) {
    callback(404 ) // this is the function passed in as the chosenHandler argumnet
}

// define a request router 

var router = {
    'ping': handlers.ping,
}
