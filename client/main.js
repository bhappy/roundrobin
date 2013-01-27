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
        var pin, left, top, height, width;
        var pinId = config.pin.id;
        var color = config.user;
        pin = RR.pinMap[pinId] = new RRPin(config.pin);
        left   = pin.getGeometry().left;
        top    = pin.getGeometry().top;
        height = pin.getGeometry().height;
        width  = pin.getGeometry().width;
        $('#selectArea').append(Handlebars.templates['pin']({
            pin:  { id: pinId, left: left, top: top, height: height, width: width },
            user: { color: color }
        }));
        $('#pinBody_' + pinId).height($('#pin_' + pinId).height() - 
                ($('#pinHeader_' + pinId).outerHeight() + $('#pinBody_' + pinId).outerHeight() +
                $('#pinFooter_' + pinId).outerHeight()));
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

    // handle the creation of a new comment, as specified on the socket.
    // comments are inserted in reverse chronological order.
    socket.on('new comment', function (config) {
        var comment, commentText = config.comment.text;
        var commentId = config.comment.id;
        var pinId = config.pin;
        var color = config.user;
        RR.commentMap[commentId] = new RRComment(config.comment);

        // create the comment from a template and fade it into the first position of the pin
        $(Handlebars.templates['comment']({
            comment: { id: commentId, text: commentText },
            user: { color: color }
        })).hide().prependTo($('#pinBody_' + pinId)).fadeIn();
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

    $('#sendGeometry').on('click', function () {
        RRPin.sendNew({
            left:   $('#geometryLeftAdd').val(),
            top:    $('#geometryTopAdd').val(),
            height: $('#geometryHeightAdd').val(),
            width:  $('#geometryWidthAdd').val()
        });
    });
});
