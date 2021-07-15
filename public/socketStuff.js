let socket = io.connect('http://localhost:8080');

function init() {
  draw();
}

socket.on('initReturn', (data) => {
  orbs = data.orbs;
});
