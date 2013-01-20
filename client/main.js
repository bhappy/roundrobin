$(document).ready(function () {
    RR = {
        socket: undefined,
        user:   new RRUser({ name: 'anonymous', color: 'grey' })
    };
    var socket = io.connect('http://localhost:1337');
    RR.socket = socket;
    socket.on('colors with threads', function (data) {
        $('body').append(data);
    });
    socket.on('update user', function (config) {
        if (config.name)  RR.user.setName(config.name);
        if (config.color) RR.user.setColor(config.color);
    });
    $('#sendName').on('click', function () {
        RR.user.sendUpdate({ name: $('#nameToSend').val() });
    });
});
