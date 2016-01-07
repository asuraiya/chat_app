var app = require('express')();
var http = require('http').Server(app)
var io = require('socket.io')(http);
var userList = {};

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    var userId = Math.floor(Math.random()*100000);
    var userName = "Guest"+userId;
    userList[userId] = userName;
    io.emit('user connected', userList[userId], userList[userId] + " connected")
    socket.on('chat message', function(msg){
        socket.broadcast.emit('chat message', userList[userId] + ': ' + msg);
    });
    socket.on('disconnect', function() {
        io.emit('user disconnected', userList[userId] + ' disconnected');
    });
    socket.on('new nickname', function(nick){
        var oldNick = userList[userId];
        userList[userId] = nick;
        io.emit('nickname changed', nick, oldNick + ' is now ' + nick);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

