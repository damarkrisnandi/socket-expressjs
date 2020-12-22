var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const serverless = require('serverless-http');

var indexRouter = require('../routes/index');
var usersRouter = require('../routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
const router = express.Router();
app.use('/.netlify/functions/server', router);  // path must route to lambda

const server = app.listen(3000);
var io = require('socket.io')(server);

io.on('connection', function(server) {
  console.log('id server:', server.id);

  server.on('SEND_MESSAGE', function(data) {
    io.emit('MESSAGE', data);
  });
  server.on('TYPING', function(data) {
    io.emit('TYPING', data);
  });
  server.on('STOP_TYPING', function(data) {
    io.emit('STOP_TYPING');
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
module.exports.handler = serverless(app);
