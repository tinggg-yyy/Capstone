let petCanvas;
let tool = "brush";

let grid = [];
let currentText = "";

function setup() {
  let canvas = createCanvas((windowWidth * 4) / 5, (windowWidth * 4) / 5);
  canvas.parent("p5-canvas-container");
  background(176, 206, 173);
  petCanvas = createGraphics(32, 32);
  petCanvas.clear();
  createInput("name");

  for (let y = 0; y < 32; y++) {
    grid[y] = [];
    for (let x = 0; x < 32; x++) {
      grid[y][x] = null;
    }
  }

  ////墨水屏效果 ink paper effect
  // petCanvas.pixelDensity(1);
  // pixelDensity(1);
}

function draw() {
  background(176, 206, 173);
  // fill(0);
  // image(petCanvas, 0, 0, width, height);

  let cellSize = width / 32;

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      let value = grid[y][x];

      if (value === "pixel") {
        fill(0);
        noStroke();
        rect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else if (value !== null) {
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(cellSize);
        text(value, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      }
    }
  }
}

// P5 touch events: https://p5js.org/reference/#Touch

function setBrush() {
  tool = "brush";
}

function setEraser() {
  tool = "eraser";
}

function touchStarted() {}

function touchMoved() {
  if (touches.length === 0) return;

  let x = touches[0].x;
  let y = touches[0].y;

  // limit x,y within canvas
  if (x < 0 || x > width || y < 0 || y > height) {
    return false;
  }

  let petX = floor((x / width) * 32);
  let petY = floor((y / height) * 32);

  if (petX >= 0 && petX < 32 && petY >= 0 && petY < 32) {
    petCanvas.loadPixels();
    if (tool === "brush") {
      // console.log("Using brush tool");
      // petCanvas.set(petX, petY, color(0));
      if (currentText !== "") {
        grid[petY][petX] = currentText;
      } else {
        grid[petY][petX] = "pixel";
      }
    } else if (tool === "eraser") {
      // console.log("Using erasor tool");
      // petCanvas.set(petX, petY, color(0, 0, 0, 0));
      grid[petY][petX] = null;
    }
    petCanvas.updatePixels();
  }

  return false;
}

function touchEnded() {}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//generate data url from p5 canvas
function generateAvatarUrl() {
  // const dataUrl = petCanvas.elt.toDataURL("image/png");
  // console.log("Avatar URL:", dataUrl);
  // return dataUrl;
  let exportCanvas = createGraphics(512, 512);
  exportCanvas.clear();

  let cellSize = 512 / 32;

  exportCanvas.textAlign(CENTER, CENTER);
  exportCanvas.textSize(cellSize);
  exportCanvas.fill(0);
  exportCanvas.noStroke();

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      let value = grid[y][x];

      if (value !== null) {
        if (value === "pixel" && currentText !== "") {
          value = currentText;
        }

        exportCanvas.text(
          value,
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
        );
      }
    }
  }

  return exportCanvas.elt.toDataURL("image/png");
}

function drawText() {
  let input = document.getElementById("text-input").value.trim();

  if (input !== "") {
    currentText = input[0]; // 只取第一个字
  }

  // 把所有 pixel 变成这个字
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      if (grid[y][x] === "pixel") {
        grid[y][x] = currentText;
      }
    }
  }
}
