
let particles = [];
let brush = 1;
let palette = 0;
let symmetry = false;
let mic;
let soundOn = false;
let synth;

const palettes = [
  [185, 290, 325],
  [0, 35, 55],
  [110, 145, 180],
  [220, 260, 300]
];

function setup() {
  let c = createCanvas(800, 500);
  c.parent("canvas");

  colorMode(HSB, 360, 100, 100, 100);
  background(245, 70, 5);

  synth = new p5.Oscillator("sine");
  synth.amp(0);
  synth.start();

  document.addEventListener("keydown", handleKeys);
}

function draw() {
  colorMode(HSB, 360, 100, 100, 100);

  let micLevel = mic ? mic.getLevel() : 0;
  let size = 8 + micLevel * 350;

  if (
    mouseX >= 0 && mouseX <= width &&
    mouseY >= 0 && mouseY <= height &&
    (mouseIsPressed || mouseX !== pmouseX || mouseY !== pmouseY)
  ) {
    paint(mouseX, mouseY, pmouseX, pmouseY, size);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;

    push();
    blendMode(BLEND);
    noStroke();
    fill(p.h, 100, 100, p.life);
    circle(p.x, p.y, p.size);
    pop();

    if (p.life <= 0) particles.splice(i, 1);
  }

  push();
  blendMode(BLEND);
  fill(0, 0, 100);
  noStroke();
  textSize(14);
  text(
    "BRUSH " + brush +
    " | PALETTE " + (palette + 1) +
    " | SYMMETRY " + (symmetry ? "ON" : "OFF"),
    15, 25
  );
  pop();

  if (soundOn && mouseIsPressed) {
    synth.freq(map(mouseX, 0, width, 150, 900));
    synth.amp(0.06, 0.05);
  } else if (soundOn) {
    synth.amp(0, 0.1);
  }
}

function paint(x, y, oldX, oldY, size) {
  let h = random(palettes[palette]);

  // Original brush
  drawBrush(x, y, oldX, oldY, size, h);

  if (symmetry) {
    // Horizontal reflection
    drawBrush(
      width - x, y,
      width - oldX, oldY,
      size, h
    );

    // Vertical reflection
    drawBrush(
      x, height - y,
      oldX, height - oldY,
      size, h
    );

    // Reflection across both axes
    drawBrush(
      width - x, height - y,
      width - oldX, height - oldY,
      size, h
    );
  }
}

function drawBrush(x, y, oldX, oldY, size, h) {
  push();
  colorMode(HSB, 360, 100, 100, 100);
  blendMode(BLEND);

  if (brush === 1) {
    // Particle spray
    for (let i = 0; i < 5; i++) {
      addParticle(
        x + random(-15, 15),
        y + random(-15, 15),
        h
      );
    }
  }

  if (brush === 2) {
    // Smooth neon ribbon
    stroke(h, 100, 100, 100);
    strokeWeight(5);
    line(oldX, oldY, x, y);
  }

  if (brush === 3) {
    // Rotating geometric brush
    translate(x, y);
    rotate(frameCount * 0.04);
    noFill();
    stroke(h, 100, 100, 100);
    strokeWeight(3);

    circle(0, 0, size * 3);
    circle(0, 0, size * 2);

    rotate(PI / 4);
    rectMode(CENTER);
    rect(0, 0, size * 2, size * 2);
  }

  pop();
}

function addParticle(x, y, h) {
  particles.push({
    x: x,
    y: y,
    vx: random(-2, 2),
    vy: random(-2, 2),
    size: random(3, 10),
    h: h,
    life: 100
  });

  if (particles.length > 1200) {
    particles.shift();
  }
}

function mousePressed() {
  if (
    mouseX < 0 || mouseX > width ||
    mouseY < 0 || mouseY > height
  ) return;

  for (let i = 0; i < 45; i++) {
    let a = random(TWO_PI);
    let speed = random(1, 6);
    let h = random(palettes[palette]);

    addParticle(mouseX, mouseY, h);

    let p = particles[particles.length - 1];
    p.vx = cos(a) * speed;
    p.vy = sin(a) * speed;

    if (symmetry) {
      addParticle(width - mouseX, mouseY, h);
      addParticle(mouseX, height - mouseY, h);
      addParticle(width - mouseX, height - mouseY, h);
    }
  } 
}

function handleKeys(e) {
  if (
    e.target.tagName === "INPUT" ||
    e.target.tagName === "TEXTAREA"
  ) return;

  if (["1", "2", "3", "c", "C", "s", "S", " "].includes(e.key)) {
    e.preventDefault();
  }

  if (e.key === "1") brush = 1;
  if (e.key === "2") brush = 2;
  if (e.key === "3") brush = 3;

  if (e.key.toLowerCase() === "c") {
    palette = (palette + 1) % palettes.length;
  }

  if (e.key.toLowerCase() === "s") {
    symmetry = !symmetry;
  }

  if (e.key === " ") {
    background(245, 70, 5);
    particles = [];
  }
}

async function enableMic() {
  try {
    await userStartAudio();
    mic = new p5.AudioIn();
    await mic.start();
    soundOn = true;
  } catch (err) {
    console.log("Microphone error:", err);
  }
}
