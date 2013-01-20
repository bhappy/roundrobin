/* --- RESOLVE EXTERNAL DEPENDENCIES --- */

var http      = require('http');
var fs        = require('fs');
var url       = require('url');
var io        = require('socket.io');
var colors    = require('./colors').colors;
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
});

/* --- GIVE INITIAL INDICATION OF SERVER RUNNING --- */

console.log('Server running at http://127.0.0.1:1337/');
