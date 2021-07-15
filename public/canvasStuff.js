function draw() {
  // reset the translation back to default!
  context.setTransform(1, 0, 0, 1, 0, 0);
  // clear the screen out so the old stuff is gone from the last frame
  context.clearRect(0, 0, canvas.width, canvas.height);

  // clamp the camera to the player
  const camX = -player.locX + canvas.width / 2;
  const camY = -player.locY + canvas.height / 2;
  // translate allows us to move the canvas around
  context.translate(camX, camY);

  // draw  player
  context.beginPath();
  context.fillStyle = p.color;
  context.arc(p.locX, p.locY, p.radius, 0, Math.PI * 2);
  context.fill();
  context.lineWidth = 3;
  context.strokeStyle = 'rgb(0,255,0)';
  context.stroke();

  // draw all the orbs
  orbs.forEach((orb) => {
    context.beginPath();
    context.fillStyle = orb.color;
    context.arc(orb.locX, orb.locY, orb.radius, 0, Math.PI * 2);
    context.fill();
  });

  requestAnimationFrame(draw);
}
