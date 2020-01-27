module.exports.initServer = socket => {
  socket.on('message', message => {
    console.log(message);
    socket.emit(message);
  });

  socket.on('player move', move => {
    socket.emit(move);
  });
};