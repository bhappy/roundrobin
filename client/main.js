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
    
    // handle the creation of a new pin, as specified on the socket
    socket.on('new pin', function (config) {
        var pin, upper, lower;
        var pinId = config.pin.id;
        var color = config.user;
        pin = RR.pinMap[pinId] = new RRPin(config.pin);
        upper = pin.getDiagEndpoints().upper;
        lower = pin.getDiagEndpoints().lower;
        $('#selectArea').append(Handlebars.templates['pin']({
            pin:  { id: pinId, lower: lower, upper: upper },
            user: { color: color }
        }));
        var sendComment = (function (id) {
            return function () {
                RRComment.sendNew({ pin: id, text: $('#commentInput_' + id).val() });
            };
        }(pinId));
        $('#commentInputButton_' + pinId).on('click', sendComment);
        var commentInput = $('#commentInput_' + pinId);
        commentInput.on('keypress', function (eventObj) {
            if (eventObj.which === 13) {  // enter key
                sendComment();
                commentInput.val('');
                return false;  // prevent form submission
            }
        });
    });

    // handle the creation of a new comment, as specified on the socket
    socket.on('new comment', function (config) {
        var comment, commentText;
        var commentId = config.comment.id;
        var pinId = config.pin;
        var color = config.user;
        commentText = config.comment.text;
        comment = RR.commentMap[commentId] = new RRComment(config.comment);
        $('#pinBody_' + pinId).append(Handlebars.templates['comment']({
            comment: { id: commentId, text: commentText },
            user: { color: color }
        }));
    });

    // handle sending the user name
    var sendUserName = function () {
        RRUser.sendUpdate({ name: $('#nameToSend').val() });
    };
    $('#sendName').on('click', sendUserName);
    $('#nameToSend').on('keypress', function (eventObj) {
        if (eventObj.which === 13) { // enter key
            sendUserName();
            $('#nameToSend').val('');
            return false;  // prevent form submission
        }
    });

    $('#sendDiagEndpoints').on('click', function () {
        RRPin.sendNew({
            upper: [ $('#upperXAdd').val(), $('#upperYAdd').val() ],
            lower: [ $('#lowerXAdd').val(), $('#lowerYAdd').val() ]
        });
    });
});
