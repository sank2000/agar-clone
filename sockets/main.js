const io = require('../servers').io;

const Orb = require('./classes/Orb');
const Player = require('./classes/Player');
const PlayerData = require('./classes/PlayerData');
const PlayerConfig = require('./classes/PlayerConfig');

let orbs = [];
let players = [];
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
  let playerConfig = new PlayerConfig(settings);
  // make a playerData object
  let playerData = new PlayerData(data.playerName, settings);
  // make a master player object to hold both
  player = new Player(socket.id, playerConfig, playerData);

  // a player has connected
  socket.emit('initReturn', {
    orbs,
  });
  players.push(playerData);
});

// Run at the beginning of a new game
function initGame() {
  for (let i = 0; i < settings.defaultOrbs; i++) {
    orbs.push(new Orb(settings));
  }
}

module.exports = io;
