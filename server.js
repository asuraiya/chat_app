var app = require('express')();
var http = require('http').Server(app)
var io = require('socket.io')(http);
var userList = {};
var typingTimeout;

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    var userId = Math.floor(Math.random()*100000);
    var userName = "Guest"+userId;
    userList[userId] = userName;
    io.emit('user connected', userList[userId], userList[userId] + " connected", userList)
    socket.on('chat message', function(msg){
        socket.broadcast.emit('user stopped typing');
        socket.broadcast.emit('chat message', userList[userId] + ': ' + msg);
        clearTimeout(typingTimeout);
    });
    socket.on('disconnect', function() {
        var userName = userList[userId];
        delete userList[userId];
        io.emit('user disconnected', userName + ' disconnected', userList);
    });
    socket.on('new nickname', function(nick){
        var oldNick = userList[userId];
        userList[userId] = nick;
        io.emit('nickname changed', nick, oldNick + ' is now ' + nick);
    });
    socket.on('typing', function() {
        clearTimeout(typingTimeout);
        socket.broadcast.emit('user typing', userList[userId] + ' is typing');
        typingTimeout = setTimeout(function() {
            socket.broadcast.emit('user stopped typing');
        }, 3000);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

