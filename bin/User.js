"use strict";
var User = (function () {
    function User(nick, gender) {
        this.nick = nick;
        this.gender = gender;
        this.cameIn = (new Date()).getTime();
    }
    User.prototype.setID = function (id) {
        this.id = id;
    };
    return User;
}());
exports.User = User;
