const io = require('../servers').io;

const Orb = require('./classes/Orb');

let orbs = [];
let settings = {
  defaultOrbs: 50,
  defaultSpeed: 6,
  defaultSize: 6,
  // as player gets bigger, the zoom needs to go out
  defaultZoom: 1.5,
  worldWidth: 500,
  worldHeight: 500,
};

initGame();

io.sockets.on('connect', (socket) => {
  // a player has connected
  socket.emit('initReturn', {
    orbs,
  });
});

// Run at the beginning of a new game
function initGame() {
  for (let i = 0; i < settings.defaultOrbs; i++) {
    orbs.push(new Orb(settings));
  }
}

module.exports = io;
