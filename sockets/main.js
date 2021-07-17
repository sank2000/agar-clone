const io = require('../servers').io;

const Orb = require('./classes/Orb');
const Player = require('./classes/Player');
const PlayerData = require('./classes/PlayerData');
const PlayerConfig = require('./classes/PlayerConfig');

const checkForOrbCollisions =
  require('./checkCollisions').checkForOrbCollisions;
const checkForPlayerCollisions =
  require('./checkCollisions').checkForPlayerCollisions;

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

setInterval(() => {
  if (players.length > 0) {
    io.to('game').emit('tock', {
      players,
    });
  }
}, 33);

io.sockets.on('connect', (socket) => {
  let player = {};
  socket.on('init', (data) => {
    socket.join('game');

    let playerConfig = new PlayerConfig(settings);
    let playerData = new PlayerData(data.playerName, settings);
    player = new Player(socket.id, playerConfig, playerData);

    setInterval(() => {
      socket.emit('tickTock', {
        playerX: player.playerData.locX,
        playerY: player.playerData.locY,
      });
    }, 33);

    // a player has connected
    socket.emit('initReturn', {
      orbs,
    });
    players.push(playerData);
  });

  socket.on('tick', (data) => {
    speed = 10;

    xV = player.playerConfig.xVector = data?.xVector ?? 0;
    yV = player.playerConfig.yVector = data?.yVector ?? 0;

    if (
      (player.playerData.locX < 5 && player.playerData.xVector < 0) ||
      (player.playerData.locX > settings.worldWidth && xV > 0)
    ) {
      player.playerData.locY -= speed * yV;
    } else if (
      (player.playerData.locY < 5 && yV > 0) ||
      (player.playerData.locY > settings.worldHeight && yV < 0)
    ) {
      player.playerData.locX += speed * xV;
    } else {
      player.playerData.locX += speed * xV;
      player.playerData.locY -= speed * yV;
    }

    // ORB COLLISION!!
    let capturedOrb = checkForOrbCollisions(
      player.playerData,
      player.playerConfig,
      orbs,
      settings
    );

    capturedOrb
      .then((data) => {
        const orbData = {
          orbIndex: data,
          newOrb: orbs[data],
        };

        io.sockets.emit('orbSwitch', orbData);
      })
      .catch(() => {
        // catch runs if the reject runs! no collision
      });

    // PLAYER COLLISION!!
    let playerDeath = checkForPlayerCollisions(
      player.playerData,
      player.playerConfig,
      players,
      player.socketId
    );
    playerDeath
      .then((data) => {
        console.log('Player collision!!!');
      })
      .catch(() => {
        // console.log("No player collision")
      });
  });
});

// Run at the beginning of a new game
function initGame() {
  for (let i = 0; i < settings.defaultOrbs; i++) {
    orbs.push(new Orb(settings));
  }
}

module.exports = io;
