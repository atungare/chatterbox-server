/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */

var fs = require("fs");

module.exports.handler = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */



  console.log("Serving request type " + request.method + " for url " + request.url);

  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";

  if(request.method === "GET") {
    var fileData = fs.readFileSync("./data.json", {encoding: 'utf8'});

    response.writeHead(200, headers);
    response.end(fileData);
    // grab some messages
    // add them to the results array in response
    // send response
  } else if (request.method === "POST") {
    request.addListener("data", function( reqData ) {
      var fileData = fs.readFileSync("./data.json", {encoding: 'utf8'});
      fileData = JSON.parse(fileData);
      reqData = JSON.parse(reqData);
      fileData.results.push(reqData);
      fs.writeFileSync("./data.json", JSON.stringify(fileData));
      response.writeHead(201, headers);
      response.end( reqData );
    });

    //statusCode = 201;
    // check if data file exists
    //    if not, create it w/ data from req
    //    stringify obj & save file
    // if does exist
    //    parse file
    //    add data req to obj
    //    stringify obj
    //    save file
    // if err occurs send err
    // else send 201
  }

  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */


  /* .writeHead() tells our server what HTTP status code to send back */
  // response.writeHead(statusCode, headers);

  /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
  // response.end(JSON.stringify(sampleResponse));



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
