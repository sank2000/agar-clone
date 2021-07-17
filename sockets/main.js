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
  defaultOrbs: 500,
  defaultSpeed: 6,
  defaultSize: 6,
  // as player gets bigger, the zoom needs to go out
  defaultZoom: 1.5,
  worldWidth: 5000,
  worldHeight: 5000,
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
        score: player.playerData.score,
      });
    }, 33);

    // a player has connected
    socket.emit('initReturn', {
      orbs,
    });

    players.push(playerData);

    socket.emit('updateLeaderBoard', getLeaderBoard());
  });

  socket.on('tick', (data) => {
    speed = 10;

    if (!player.playerConfig) return;

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

        io.sockets.emit('updateLeaderBoard', getLeaderBoard());
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
        io.sockets.emit('updateLeaderBoard', getLeaderBoard());

        io.sockets.emit('playerDeath', data);
      })
      .catch(() => {
        // console.log("No player collision")
      });
  });

  socket.on('disconnect', (data) => {
    if (player.playerData) {
      players.forEach((currPlayer, i) => {
        if (currPlayer.uid == player.playerData.uid) {
          players.splice(i, 1);
          io.sockets.emit('updateLeaderBoard', getLeaderBoard());
        }
      });
    }
  });
});

function getLeaderBoard() {
  players.sort((a, b) => {
    return b.score - a.score;
  });
  let leaderBoard = players.map((curPlayer) => {
    return {
      name: curPlayer.name,
      score: curPlayer.score,
    };
  });
  return leaderBoard;
}

// Run at the beginning of a new game
function initGame() {
  for (let i = 0; i < settings.defaultOrbs; i++) {
    orbs.push(new Orb(settings));
  }
}

module.exports = io;
