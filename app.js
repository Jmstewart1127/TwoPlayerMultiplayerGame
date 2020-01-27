const express = require('express');
const logger = require('morgan');
const debug = require('debug')('app');
const cookieParser = require('cookie-parser');
const path = require('path');

const indexRouter = require('./routes/index');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;;

const ioInit = require('./socket/ioInit');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/socket', express.static(path.join(__dirname, 'node_modules/socket.io')));

app.use('/', indexRouter);

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

http.listen(port);

io.on('connection', socket => {
  socket.on('message', message => {
    io.emit('message', message);
  });

  socket.on('player move', position => {
    socket.broadcast.emit('player move', position);
  });

  socket.on('player scored', position => {
    socket.broadcast.emit('player scored', position);
  });
});

module.exports = app;
