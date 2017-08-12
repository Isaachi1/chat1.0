"use strict";

module.exports = function(app){
    app.route('/').all(function(req, res){
        res.render('index');
    });
};