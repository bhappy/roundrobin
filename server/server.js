/* --- RESOLVE EXTERNAL DEPENDENCIES --- */

var http      = require('http');
var fs        = require('fs');
var url       = require('url');
var io        = require('socket.io');
var colors    = require('./colors');
var RRUser    = require('./RRUser.generated').RRUser;
var Pin       = require('./Pin.generated').Pin;
var _         = require('underscore');

/* --- SETUP STATIC DATA --- */


/* --- SETUP INSTANCE PERSISTENT STATE --- */

var userCnt = 0;
var colorsWithThreads = {};

/* --- SETUP MAIN SERVER --- */

var app = http.createServer(function (req, res) {
    var path = url.parse(req.url).pathname;
    var fsCallback = function (error, data) {
        if (error) {
            res.writeHead(500);
            res.end("Error loading file");
        }
        res.writeHead(200);
        res.write(data);
        res.end();
    };
    switch (path) {
        case '/Pin.js':
            fs.readFile(__dirname + '/../client/Pin.generated.js', fsCallback);
        break;
        case '/RRUser.js':
            fs.readFile(__dirname + '/../client/RRUser.generated.js', fsCallback);
        break;
        default:
            fs.readFile(__dirname + '/../client/index.html', fsCallback);
        break;
    }
}).listen('1337', '127.0.0.1');

/* --- SETUP SOCKETS --- */

io = io.listen(app);
io.sockets.on('connection', function (socket) {
    socket.pinit = { 
        user: new RRUser()
    };
    socket.pinit.user.setColor(colors[userCnt % 20]);
    userCnt++;
    socket.emit('colors with threads', _.keys(colorsWithThreads));
    socket.on('set username', function (data) {
        socket.pinit.user.setUsername(data.username);
        socket.emit('user update', socket.pinit.user);
    });
});

/* --- GIVE INITIAL INDICATION OF SERVER RUNNING --- */

console.log('Server running at http://127.0.0.1:1337/');
