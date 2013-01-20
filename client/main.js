$(document).ready(function () {
    RR = {
        socket:     undefined,
        user:       new RRUser({ name: 'anonymous', color: 'grey' }),
        pinMap:     {},
        commentMap: {}
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
    socket.on('new pin', function (config) {
        var pin, upper, lower;
        var pinId = config.pin.id;
        var color = config.user;
        pin = RR.pinMap[pinId] = new RRPin(config.pin);
        upper = pin.getDiagEndpoints().upper;
        lower = pin.getDiagEndpoints().lower;
        $('#pins').append(Handlebars.templates['pin']({
            pin:  { id: pinId, lower: lower, upper: upper },
            user: { color: color }
        }));
        $('#commentInputButton_' + pinId).on('click', (function (id) {
            return function () {
                RRComment.sendNew({
                    pin: id,
                    text: $('#commentInput_' + id).val()
                });
            };
        }(pinId)));
    });
    socket.on('new comment', function (config) {
        var comment, commentText;
        var commentId = config.comment.id;
        var pinId = config.pin;
        var color = config.user;
        commentText = config.comment.text;
        comment = RR.commentMap[commentId] = new RRComment(config.comment);
        $('#commentInputForm_' + pinId).before(Handlebars.templates['comment']({
            comment: { id: commentId, text: commentText },
            user: { color: color }
        }));
    });
    $('#sendName').on('click', function () {
        RRUser.sendUpdate({ name: $('#nameToSend').val() });
    });
    $('#sendDiagEndpoints').on('click', function () {
        RRPin.sendNew({
            upper: [ $('#upperXAdd').val(), $('#upperYAdd').val() ],
            lower: [ $('#lowerXAdd').val(), $('#lowerYAdd').val() ]
        });
    });
});
