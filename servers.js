const express = require('express');
const app = express();
const socketIo = require('socket.io');
const helmet = require('helmet');

app.use(express.static(__dirname + '/public'));
app.use(helmet());

const expressServer = app.listen(8080, () => {
  console.log('Express and socketio are listening on port 8080');
});

const io = socketIo(expressServer);

module.exports = {
  app,
  io,
};
