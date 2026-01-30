let petCanvas;

function setup() {
  let canvas = createCanvas((windowWidth * 4) / 5, (windowWidth * 4) / 5);
  canvas.parent("p5-canvas-container");
  petCanvas = createGraphics(32, 32);
  petCanvas.background(176, 206, 173);
  createInput("name");
}

function draw() {
  fill(0);
  image(petCanvas, 0, 0, width, height);
}

// P5 touch events: https://p5js.org/reference/#Touch

function touchStarted() {
  console.log(touches);

  // let x = touches[0].x;
  // let y = touches[0].y;
  // circle(x, y, 100);

  // for (let i = 0; i < touches.length; i++) {
  //   let x = touches[i].x;
  //   let y = touches[i].y;
  //   circle(x, y, 100);
  // }
}

function touchMoved() {
  console.log(touches);
  let x = touches[0].x;
  let y = touches[0].y;
  let petX = floor((x / width) * 32);
  let petY = floor((y / height) * 32);

  petCanvas.set(petX, petY, 0);
  petCanvas.updatePixels();
}

function touchEnded() {}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
