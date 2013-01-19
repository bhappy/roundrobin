PinItUser = function () {};

/* --- ACCESSORS --- */

PinItUser.prototype.getUsername = function () {
    return this.username;
};
PinItUser.prototype.getColor = function () {
    return this.color;
};
PinItUser.prototype.getSocket = function () {
    return this.socket;
};

/* --- SETTERS --- */

PinItUser.prototype.setUsername = function (username) {
    this.username = username;
};
PinItUser.prototype.setColor = function (color) {
    this.color = color;
};
PinItUser.prototype.setSocket = function (socket) {
    this.socket = socket;
};

/* --- EXPORT --- */

if (typeof exports !== 'undefined') {
    exports.PinItUser = PinItUser;
}
