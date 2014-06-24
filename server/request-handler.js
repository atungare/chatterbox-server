/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */

var fs = require("fs");

var last = function(arr){
  return arr[arr.length-1];
}

module.exports.handler = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */
  console.log("Serving request type " + request.method + " for url " + request.url);

  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";

  if(request.method === "GET") {
    handleGet(request, response, headers);
  } else if (request.method === "POST") {
    handlePost(request, response, headers);
  } else if (request.method === "OPTIONS") {
    handleOptions(request, response, headers);
  }

  /* .writeHead() tells our server what HTTP status code to send back */
  // response.writeHead(statusCode, headers);

  /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
  // response.end(JSON.stringify(sampleResponse));

};

var handleOptions = function( request, response, headers ) {
  response.writeHead(200, headers);
  response.end();
};

var handleGet = function (request, response, headers) {
  if (request.url === '/' ||request.url[1] === '?') {
    headers['Content-Type'] = "text/html";
    var html = fs.readFileSync('/Users/student/code/ajay-nick/2014-06-chatterbox-server/client/index.html');
    response.writeHead(200, headers);
    response.end(html);
    headers['Content-Type'] = "text/plain";
    return;
  }

  var url = request.url.split('/');

  if (url[1] === 'client') {

    console.log("getting from client");

    var filetype = last(request.url.split('.'));
    if (filetype === 'js') {filetype = "javascript";}
    headers['Content-Type'] = "text/" + filetype;
    var file = fs.readFileSync('/Users/student/code/ajay-nick/2014-06-chatterbox-server/' + request.url);
    response.writeHead(200, headers);
    response.end(file);
    headers['Content-Type'] = "text/plain";
    return;
  }

  if (url[url.length-2] !== 'classes') {
    response.writeHead(404, headers);
    response.end();
    return;
  }

  var room = url[url.length - 1];

  var fileData = fs.readFileSync("./data.json", {encoding: 'utf8'});
  var filter = room === "messages" ?
    function(){ return true; } :
    function(msg){ return msg.room === room; };

  var results = JSON.parse(fileData).results.filter( filter )
    .map( function( msg ) {
      delete msg.room;
      return msg;
    });

  console.log(results);
  response.writeHead(200, headers);
  response.end(JSON.stringify({results: results}));

};

var handlePost = function (request, response, headers) {
  request.addListener("data", function( reqStr ) {

    var fileData = fs.readFileSync("./data.json", {encoding: 'utf8'});
    fileData = JSON.parse(fileData);
    var reqData = JSON.parse(reqStr);

    var url = request.url.split('/');
    if (url[url.length-2] !== 'classes') {
      response.writeHead(403, headers);
      response.end();
      return;
    }

    reqData.room = url[url.length - 1];

    fileData.results.unshift(reqData);
    fs.writeFileSync("./data.json", JSON.stringify(fileData));

    response.writeHead(201, headers);
    response.end( reqStr );
  });
};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
