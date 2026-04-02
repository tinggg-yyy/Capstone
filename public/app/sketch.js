let petCanvas;
let tool = "brush";

let grid = [];
let currentText = "";

let history = []; // 每一笔的 diff 列表
let currentStroke = []; // 当前这笔中被修改的格子 {x, y, oldVal}
let strokeCells = new Set(); // 当前笔中已记录的格子，避免重复记录

function setup() {
  let canvas = createCanvas((windowWidth * 4) / 5, (windowWidth * 4) / 5);
  canvas.parent("p5-canvas-container");
  //  background(176, 206, 173);
  background(0);
  petCanvas = createGraphics(32, 32);
  petCanvas.clear();

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
  //  background(176, 206, 173);
  background(0);
  // fill(0);
  // image(petCanvas, 0, 0, width, height);

  let cellSize = width / 32;

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      let cell = grid[y][x];

      if (cell === "pixel") {
        // fill(0);
        fill(57, 255, 20);
        noStroke();
        rect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else if (cell === "text") {
        // fill(0);
        fill(57, 255, 20);
        textAlign(CENTER, CENTER);
        textSize(cellSize);
        text(
          currentText,
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
        );
      } else if (cell !== null) {
        // fill(0);
        fill(57, 255, 20);
        textAlign(CENTER, CENTER);
        textSize(cellSize);
        text(cell, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      }
    }
  }
  // 网格线（可选，增加LCD感）
  stroke(57, 255, 20, 20);
  strokeWeight(0.5);
  for (let i = 0; i <= 32; i++) {
    line(i * cellSize, 0, i * cellSize, height);
    line(0, i * cellSize, width, i * cellSize);
  }
  noStroke();
}

// P5 touch events: https://p5js.org/reference/#Touch

function setBrush() {
  tool = "brush";
}

function setEraser() {
  tool = "eraser";
}

function setClear() {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      grid[y][x] = null;
    }
  }
  petCanvas.clear();
}

function setUndo() {
  if (history.length === 0) return;
  const stroke = history.pop();
  for (const { x, y, oldVal } of stroke) {
    grid[y][x] = oldVal;
  }
}

// Touch start: Reset current stroke data
function touchStarted() {
  currentStroke = [];
  strokeCells = new Set();
}

// Touch move: Modify cells based on tool type and record changes
function touchMoved() {
  const photoPage = document.getElementById("profile-photo");
  if (!photoPage.classList.contains("active")) {
    return true;
  }

  if (touches.length === 0) return;

  let x = touches[0].x;
  let y = touches[0].y;

  // limit x,y within canvas
  if (x < 0 || x > width || y < 0 || y > height) {
    return false;
  }
  // Map touch coordinates to grid coordinates
  let petX = floor((x / width) * 32);
  let petY = floor((y / height) * 32);
  if (petX >= 0 && petX < 32 && petY >= 0 && petY < 32) {
    petCanvas.loadPixels();

    // Undo Function: 记录被修改的格子和它们的旧值
    const key = `${petX},${petY}`;
    if (!strokeCells.has(key)) {
      strokeCells.add(key);
      currentStroke.push({ x: petX, y: petY, oldVal: grid[petY][petX] });
    }

    // Brush
    if (tool === "brush") {
      // console.log("Using brush tool");
      // petCanvas.set(petX, petY, color(0));
      if (currentText !== "") {
        grid[petY][petX] = "text";
      } else {
        grid[petY][petX] = "pixel";
      }
    }
    // Eraser
    else if (tool === "eraser") {
      // console.log("Using erasor tool");
      // petCanvas.set(petX, petY, color(0, 0, 0, 0));
      grid[petY][petX] = null;
    }
    petCanvas.updatePixels();
  }

  return false;
}

// Touch end: add the current stroke to the history stack and reset it for the next stroke.
function touchEnded() {
  if (currentStroke.length > 0) {
    history.push(currentStroke);
    currentStroke = [];
    strokeCells = new Set();
  }
}

function windowResized() {
  resizeCanvas((windowWidth * 4) / 5, (windowWidth * 4) / 5);
}

//generate data url from p5 canvas
function generateAvatarUrl() {
  const dataUrl = document
    .querySelector("#p5-canvas-container canvas")
    .toDataURL("image/png");
  return dataUrl;

  // const dataUrl = petCanvas.elt.toDataURL("image/png");
  // console.log("Avatar URL:", dataUrl);
  // return dataUrl;

  // let exportCanvas = createGraphics(512, 512);
  // exportCanvas.clear();

  // let cellSize = 512 / 32;

  // exportCanvas.textAlign(CENTER, CENTER);
  // exportCanvas.textSize(cellSize);
  // exportCanvas.fill(0);
  // exportCanvas.noStroke();

  // for (let y = 0; y < 32; y++) {
  //   for (let x = 0; x < 32; x++) {
  //     let cell = grid[y][x];

  //     if (cell !== null) {
  //       if (cell === "pixel" && currentText !== "") {
  //         cell = currentText;
  //       }

  //       exportCanvas.text(
  //         cell,
  //         x * cellSize + cellSize / 2,
  //         y * cellSize + cellSize / 2,
  //       );
  //     }
  //   }
  // }

  // return exportCanvas.elt.toDataURL("image/png");
}

// draw text on canvas based on currentText and update grid state
function drawText() {
  let input = document.getElementById("text-input").value.trim();

  if (input !== "") {
    currentText = input;
  }

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      if (grid[y][x] === "pixel") {
        grid[y][x] = "text";
      }
    }
  }
}
