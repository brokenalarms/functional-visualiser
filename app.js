import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';

//import logger from 'morgan';
//import cookieParser from 'cookie-parser'; 
//import bodyParser from 'body-parser';



/** Import self-written modules
 */
import routes from './routes/index';

var app = express();

// view engine setup for server-side errors
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(favicon(__dirname + '/public/resources/favicons/favicon.ico'));

//set to read js files from the babel-transpiled ES5 folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('*', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

//test that es6 is working
let a = 42;

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        App.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    app.render('error', {
        message: err.message,
        error: {}
    });
});


export default app;
