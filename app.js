var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var mongo = require('mongodb');

var app = express();

// set up modules
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(partials());

// set up routers
var routes = require("./routes/index");
var map = require("./routes/map");
var ev = require("./routes/api/events");
var locations = require("./routes/api/locations");
var subscriptions = require("./routes/api/subscriptions");
var users = require("./routes/api/users");

app.use('/', routes);
app.use('/map', map);

// REST API routers
app.use("/api/locations", locations);
app.use('/api/events', ev);
app.use("/api/subscriptions", subscriptions);
app.use("/api/users", users);


// ERROR Handlers
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set("port", (process.env.PORT || 5000));
app.listen(app.get("port"), function() {
    console.log("listening on port " + app.get("port"));
});


module.exports = app;
