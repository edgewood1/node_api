// primary file for the API
// to test: node index.js on one console
// curl localhost:3000/foo on another

// dependencies

/// http server lets you listen on ports and respond
// use http module to define what server does

const http = require('http');

// which resources peopel are requesting when they send requests 
// so parse the url they are asking for. 

var fs = require('fs')

const url = require('url');

const https = require('https')

//

var StringDecoder = require('string_decoder').StringDecoder;

var config = require('./config')

// instantiating the http server

var httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
    })

// start the server, and have it listen to port 3000
httpServer.listen(config.httpPort, function() {
    console.log("the server is listening on port " + config.httpPort )
})

// instantiating the https server

var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
}

var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
    })

// instantiate https server
httpsServer.listen(config.httpsPort, function() {
    console.log("the server is listening on port " + config.httpsPort)
})


// all the server logic for both the http and https server

var unifiedServer = function(req, res) {
    // get url and parse it 
    // true means to parse the query streing / to set the parsed url doc query value at the equivalent as if we had sent this datato the query string module.  
    // so we're using 2 modules: url and the query string > true calls the query string module. 
    // parsed Url has a bunch of meta data about host
    var parsedUrl = url.parse(req.url, true)
    // get path from url - the untrimmed path
    var path = parsedUrl.pathname;
    // trimmed  path
    // \/+ - matches many slashes | or same on end -
    // /g - this modifier is used to perform a global match (find all matches rathter than stoping after the first match.  to perform a global, case-insensitive serach, use g with i)  
    // var p="x"; p.replace(/x/, "y")  - now p is y
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // get the query string as an object
    // true tells url.parse to go ahead an throw its queryString operations to the queryStrings library built into node so that this object that comes back parseduld.query object is the same as if we had used that queryString object ourselves. namely, when someone sends a url with many query parameters on the end, those are all parsed and put nicely into this object with keys and values
    
    var queryStringObject = parsedUrl.query;

    // get HTTP method - method is an object availabe on req
    // make sure its all placed in lower case - 

    var method = req.method.toLowerCase()

    // get teh headers as an Object - this can't be used with curl - so use postman. 

    var headers = req.headers;

    // get the payload if there is anything

    var decoder = new StringDecoder('utf-8');

    var buffer = '';

    // each time data streams in a piece, request object emits data event we are binding to and sends us undecoded data, we decode it to utf8 using the decoder. and add the result to the buffer.  a large stream recieved bits at a time.  

    req.on('data', function(data) {
        buffer += decoder.write(data);
    })

    // when is it all done? 

    req.on('end', function() {
        buffer += decoder.end()
            // choose handler this request should go to.  if one not found, use not found handler - essentially: if 'foo' is path, and router.foo exists, then it becomes the chosenHandler

            // var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

            var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

            // Construct data object to send to the handler

            var data = {
                'trimmedPath': trimmedPath,
                'queryStringObject': queryStringObject,
                'method': method,
                'headers': headers,
                'payload': buffer
            }

            // route the request to the handler specified in handler -- we expect back statusCode and payload

            chosenHandler(data, function(statusCode, payload) {
                // use the status code callback or default to 200

                statusCode = typeof(statusCode)  == 'number' ? statusCode : 200;

                // use payload callback or default to empty object
                
                payload = typeof(payload) == 'object' ? payload : {};

                // we can't send an object back to user who wsent this - we need to send a string - why????

                var payloadString = JSON.stringify(payload);

                // return the response 
                // res.setHeader('Content-Type', 'application/json');

                res.writeHead(statusCode, {
                    "Content-Type": "application/json"
                })
                res.end(payloadString);
                     // this was originally outside this req.on
            // log what path the person was asking for // log the request path
            // console.log("Request recieved on path " + trimmedPath + " with this method " + method + " with these query strings parameters " , queryStringObject , " headers are " , headers, " payload ", buffer);

            console.log("returning ", statusCode, payloadString);

            })
        })
}


// define handlers 

var  handlers = {};

// ping handler

handlers.ping = function(data, callback) {
    callback(200)
}
 

// not found handler 

handlers.notFound = function(data, callback) {
    callback(404);
}

// define a request router 

var router = {
    'ping': handlers.ping,
}
