var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

var defaultHeaders = function(res) {
  res.set("access-control-allow-origin", "*");
  res.set("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("access-control-allow-headers", "content-type, accept");
  res.set("access-control-max-age", 10);
  res.set('Content-Type', 'text/plain');
};

var handleGet = function(req, res) {
  var room = req.params.room;

  fs.readFile(path.join(__dirname, 'storage/data.json'), {encoding:'utf8'}, function(err, storedData){
    messages = JSON.parse(storedData)['messages'].filter(function(msg){
      return (room === 'messages') ? true : (msg.roomname === room);
    });

    var response = JSON.stringify({messages: messages});

    res.send(response);
  });
};

var handlePost = function(req, res){
  var room = req.params.room;

  var reqData = JSON.parse(Object.keys(req.body)); // BodyParser parses the string into an object
  reqData['roomname'] = room;

  fs.readFile(path.join(__dirname, 'storage/data.json'), {encoding: 'utf8'}, function(err, storedData) {
    messages = JSON.parse(storedData)['messages'];
    messages.unshift(reqData);

    fs.writeFile(path.join(__dirname, 'storage/data.json'), JSON.stringify({messages: messages}), function() {
      res.send(JSON.stringify(reqData));
    });
  });
};

app.all('*', function(req, res, next) {
  defaultHeaders(res);
  if(req.method === 'OPTIONS') {
    res.set('Content-Type', 'application/json');
    res.send(200);
  } else {
    next();
  }
});

app.get('/classes/:room', handleGet);
app.post('/classes/:room', handlePost);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
