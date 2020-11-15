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

const workspaces = io.of('/device');
workspaces.on('connection', socket => {

  socket.on('join', deviceId => {
    socket.join(deviceId);
  });

  socket.on('room', room => {
    socket.join(room);

    socket.on('message', message => {
      socket.to(room).emit('message', message);
    });

    socket.on('message', message => {
      socket.to(room).emit('message', message);
    });

    socket.on('message', message => {
      socket.to(room).emit('message', message);
    });

    socket.on('player move', position => {
      socket.broadcast.to(room).emit('player move', position);
    });

    socket.on('player scored', position => {
      socket.broadcast.to(room).emit('player scored', position);
    });

    socket.on('player fire', shot => {
      socket.broadcast.to(room).emit('player fire', shot);
    });

    socket.on('player hit', scoreData => {
      socket.to(room).emit('player hit', scoreData);
    });

    socket.on('opponent hit', scoreData => {
      socket.to(room).emit('opponent hit', scoreData);
    });
  });
});

// this middleware will be assigned to each namespace
workspaces.use((socket, next) => {
  // ensure the user has access to the workspace
  next();
});

module.exports = app;
