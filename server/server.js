/* --- RESOLVE EXTERNAL DEPENDENCIES --- */

var http      = require('http');
var fs        = require('fs');
var url       = require('url');
var io        = require('socket.io');
var colors    = require('./colors').colors;
var RRUser    = require('./RRUser.generated').RRUser;
var Pin       = require('./RRPin.generated').Pin;
var Comment   = require('./RRComment.generated').Pin;
var _         = require('underscore');

/* --- SETUP STATIC DATA --- */


/* --- SETUP INSTANCE PERSISTENT STATE --- */

var userCnt = 0;
var colorsWithThreads = {};
var commentMap = {};
var pinMap = {};

/* --- SETUP MAIN SERVER --- */

var app = http.createServer(function (req, res) {
    var path = url.parse(req.url).pathname;
    var fsCallback = function (error, data) {
        if (error) {
            res.writeHead(500);
            res.end("Error loading file");
            return;
        }
        res.writeHead(200);
        res.write(data);
        res.end();
    };
    switch (path) {
        case '/main.js':
            fs.readFile(__dirname + '/../client/main.js', fsCallback);
        break;
        case '/RRComment.js':
            fs.readFile(__dirname + '/../client/RRComment.generated.js', fsCallback);
        break;
        case '/RRPin.js':
            fs.readFile(__dirname + '/../client/RRPin.generated.js', fsCallback);
        break;
        case '/RRUser.js':
            fs.readFile(__dirname + '/../client/RRUser.generated.js', fsCallback);
        break;
        case '/templates.js':
            fs.readFile(__dirname + '/../client/templates.generated.js', fsCallback);
        break;
        default:
            fs.readFile(__dirname + '/../client/index.html', fsCallback);
        break;
    }
}).listen('1337', '127.0.0.1');

/* --- SETUP SOCKETS --- */

io = io.listen(app);
io.sockets.on('connection', function (socket) {
    socket.RR = {
        user: new RRUser({ name: 'anonymous', color: colors[userCnt % 20] })
    };
    userCnt++;
    socket.emit('colors with threads', _.keys(colorsWithThreads));
    socket.on('update user', function (config) {
        if (config.name)  socket.RR.user.setName(config.name);
        if (config.color) socket.RR.user.setColor(config.color);
        socket.emit('update user', socket.RR.user);
    });
    socket.on('new pin', function (config) {
        var pin = socket.RR.user.addPin(new RRPin({
            diagEndpoints: {
                lower: config.lower,
                upper: config.upper
            },
            user:  socket.RR.user
        }));
        pin.setId();
        pinMap[pin.getId()] = pin;
        io.sockets.emit('new pin', {
            pin:  {
                id: pin.getId(),
                diagEndpoints: pin.getDiagEndpoints()
            },
            user: socket.RR.user.getColor()
        });
    });
    socket.on('new comment', function (config) {
        var comment = pinMap[config.pin].addComment(new RRComment({
            pin:  pinMap[config.pin],
            text: config.text,
            user: socket.RR.user
        }));
        comment.setId();
        commentMap[comment.getId()] = comment;
        io.sockets.emit('new comment', {
            comment: {
                id:   comment.getId(),
                text: comment.getText()
            },
            pin: comment.getPin().getId(),
            user: socket.RR.user.getColor()
        });
    });
    _.each(_.keys(pinMap), function (pinId) {
        var pin = pinMap[pinId];
        socket.emit('new pin', {
            pin: {
                id: pin.getId(),
                diagEndpoints: pin.getDiagEndpoints()
            },
            user: pin.getUser().getColor()
        });
    });
    _.each(_.keys(commentMap), function (commentId) {
        var comment = commentMap[commentId];
        socket.emit('new comment', {
            comment: {
                id:   comment.getId(),
                text: comment.getText()
            },
            pin: comment.getPin().getId(),
            user: comment.getPin().getUser().getColor()
        });
    });
});

/* --- GIVE INITIAL INDICATION OF SERVER RUNNING --- */

console.log('Server running at http://127.0.0.1:1337/');
