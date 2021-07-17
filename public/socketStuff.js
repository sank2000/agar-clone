let socket = io.connect('http://localhost:8080');

function init() {
  draw();

  socket.emit('init', {
    playerName: player.name,
  });
}

socket.on('initReturn', (data) => {
  orbs = data.orbs;

  setInterval(() => {
    socket.emit('tick', player);
  }, 33);
});

socket.on('tock', (data) => {
  players = data.players;
});

socket.on('tickTock', (data) => {
  player.locX = data.playerX;
  player.locY = data.playerY;
});

socket.on('orbSwitch', (data) => {
  orbs.splice(data.orbIndex, 1, data.newOrb);
});

socket.on('updateLeaderBoard', (data) => {
  // console.log(data);
  document.querySelector('.leader-board').innerHTML = '';
  data.forEach((curPlayer) => {
    document.querySelector('.leader-board').innerHTML += `
            <li class="leaderboard-player">${curPlayer.name} - ${curPlayer.score}</li>
        `;
  });
});
