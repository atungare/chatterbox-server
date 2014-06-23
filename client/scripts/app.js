// YOUR CODE HERE:

/*

$.ajax({
  url: "a string",
  type: "GET", "POST", "PUT", "DELETE",
  dataType: "html", "json", "jsonp" (default to intelligent guess),
  data: Object (will be stringified)
  success: Function,
  error: Function,
  complete: Function
})

 */

var response;
var roomNames = [];
var ajaxParams = {
  limit: 1000,
  sort: "createdAt",
  skip: 0
};

var app = {};

app.server = "https://api.parse.com/1/classes/chatterbox";
app.currentUser = null;
app.currentRoom = null;

$(function(){
  var roomListTemplate = Handlebars.compile($("#room-list").html());
  var messageListTemplate = Handlebars.compile($("#message-list").html());

  app.init = function() {
    $("body").on("click", ".username", function(evt){
      app.addFriend( $(this).html() );
    });

    $("#send").on("submit", ".submit", function(){
      app.handleSubmit($("#message").val());
    });

    this.fetch().then(function(json){
      app.addAllMessages({messages: json.results});
      _.each(json.results, function(element) {
        roomNames.push(element["roomname"]);
      });
      roomNames = _.uniq(roomNames);
      // console.log(roomNames);
      app.addAllRooms(roomNames);
    });
  };

  app.send = function(data){
    return $.ajax({
      url: this.server,
      type: "POST",
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function(){
        console.log("Ajax FTW");
      }
    });
  };

  app.fetch = function() {
    return $.ajax({
      url: this.server,
      type: "GET",
      data: ajaxParams,
    });
  };

  app.addAllMessages = function(messages){
    var temp = messages["messages"];
    messages["messages"] = temp.reverse();
    $(".message-list").append(messageListTemplate(messages));
  };

  app.clearMessages = function(){
    $("#chats").empty();
  };

  app.addAllRooms = function(roomNames) {
    console.log(roomListTemplate(roomNames));
    $(".rooms-list").append(roomListTemplate(roomNames));
  };

  app.addFriend = function(username) {

  };

  app.handleSubmit = function(message) {
    return app.send({
      text: message,
      username: app.currentUser || "John Doe",
    });
  };

  app.init();
});

