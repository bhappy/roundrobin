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
        $('#pins').append('<div id="pin_' + pinId + '" class="pin"><span style="color: ' + color +
                ';">(' + upper[0] + ',' + upper[1] + ') (' + lower[0] + ',' + lower[1] + 
                ')</span><br/><input id="commentInput_' + pinId + '" class="commentInput" ' +
                'type="text">' + 'Comment</input><br/>' +
                '<button id="inputComment_' + pinId + '" class="commentInputButton">send comment' +
                '</button></div>');
        $('#pin_' + pinId + ' .commentInputButton').on('click', (function (id) {
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
        $('#commentInput_' + pinId).before('<span id="comment_' + commentId + '" class="comment" ' +
                'style="color: ' + color + ';">' + commentText + '</span><br/>');
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
