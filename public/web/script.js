const socket = io();

let ranking = [];
let currentIdx = 0;
let cycleTimer = null;

// ── 加载并展示排行 ──────────────────────────────────────

async function loadRanking() {
  const res = await fetch("/profiles");
  const data = await res.json();

  ranking = data
    .filter((p) => p.name)
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 10);

  if (ranking.length === 0) return;

  showSpotlight(0);
  startCycle();
}

function showSpotlight(idx) {
  currentIdx = idx;
  const p = ranking[idx];

  const avatarHTML = p.grid
    ? `<img class="avatar" src="${renderGridAsAvatar(p.grid, p.gridText)}" alt="${p.name}" />`
    : `<div class="avatar-placeholder">${getEmoji(p.breed)}</div>`;

  const v = (val) => val || "—";

  document.getElementById("spotlight").innerHTML = `
    <div class="s-rank-bar">
      <div class="s-rank">No.${idx + 1}</div>
      <div class="s-likes-big">💗 ${p.likes?.length || 0}</div>
    </div>

    <div class="avatar-box">${avatarHTML}</div>

    <div class="card">
      <div class="section">
        <span class="label">名字</span>
        <span class="value big">${v(p.name)}</span>
      </div>

      <div class="grid-3">
        <div class="cell"><span class="label">性别</span><span class="value">${v(p.gender)}</span></div>
        <div class="cell"><span class="label">年龄</span><span class="value">${v(p.age)}</span></div>
        <div class="cell"><span class="label">领地</span><span class="value">${v(p.hukou)}</span></div>
      </div>

      <div class="section">
        <span class="label">物种</span>
        <span class="value">${v(p.breed)}</span>
      </div>

      <div class="section">
        <span class="label">性取向</span>
        <span class="value">${v(p.orientation)}</span>
      </div>

      <div class="section">
        <span class="label">MBTI</span>
        <span class="value big">${v(p.mbti)}</span>
      </div>

      <div class="grid-2">
        <div class="cell"><span class="label">婚育状况</span><span class="value">${v(p.sterilized)}</span></div>
        <div class="cell"><span class="label">交友目的</span><span class="value">${v(p.goal)}</span></div>
      </div>

      <div class="grid-3">
        <div class="cell"><span class="label">学历</span><span class="value">${v(p.edu)}</span></div>
        <div class="cell"><span class="label">职业</span><span class="value">${v(p.occupation)}</span></div>
        <div class="cell"><span class="label">月收入</span><span class="value">${v(p.income)}</span></div>
      </div>

      <div class="grid-2">
        <div class="cell"><span class="label">兴趣爱好</span><span class="value">${v(p.hobby)}</span></div>
        <div class="cell"><span class="label">日常生活</span><span class="value">${v(p.dailylife)}</span></div>
      </div>
    </div>
  `;

  resetProgress();
}

// ── 30s 轮播 ──────────────────────────────────────────

function startCycle() {
  if (cycleTimer) clearInterval(cycleTimer);
  cycleTimer = setInterval(() => {
    const next = (currentIdx + 1) % ranking.length;
    showSpotlight(next);
  }, 5000);
}

function resetProgress() {
  const bar = document.getElementById("progressBar");
  bar.classList.remove("running");
  // 强制重排使动画重置
  void bar.offsetWidth;
  bar.classList.add("running");
}

// ── 弹幕 ──────────────────────────────────────────────

function spawnDanmaku(text, type = "like") {
  const layer = document.getElementById("danmaku-layer");
  const el = document.createElement("div");
  el.className = `danmaku danmaku-${type}`;
  el.textContent = text;

  // 随机垂直位置 (10%~85%)
  el.style.top = 10 + Math.random() * 75 + "%";
  layer.appendChild(el);

  // 动画结束后移除
  el.addEventListener("animationend", () => el.remove());
}

// ── Socket.io 实时事件 ─────────────────────────────────

socket.on("like-event", (data) => {
  const reasonPart =
    data.label && data.reason ? ` 因为【${data.label}】它觉得${data.reason}` : "";
  spawnDanmaku(`💗 ${data.by} 对 ${data.name} 上头${reasonPart}`, "like");

  // 更新本地 likes 数，不重新渲染整个页面
  const profile = ranking.find((p) => p.name === data.name);
  if (profile && data.likesCount !== undefined) {
    profile.likes = new Array(data.likesCount);
    if (ranking[currentIdx]?.name === data.name) {
      const likesEl = document.querySelector(".s-likes-big");
      if (likesEl) likesEl.textContent = `💗 ${data.likesCount}`;
    }
  }
});

socket.on("skip-event", (data) => {
  const reasonPart =
    data.label && data.reason ? ` 因为【${data.label}】它觉得${data.reason}` : "";
  spawnDanmaku(`❌ ${data.by} 跳过了 ${data.name}${reasonPart}`, "skip");
});

// ── 工具函数 ──────────────────────────────────────────

function getEmoji(breed) {
  if (!breed) return "🐾";
  const b = breed.toLowerCase();
  if (b.includes("dog") || b.includes("狗")) return "🐶";
  if (b.includes("cat") || b.includes("猫")) return "🐱";
  if (b.includes("rabbit") || b.includes("兔")) return "🐰";
  if (b.includes("fox") || b.includes("狐")) return "🦊";
  if (b.includes("wolf") || b.includes("狼")) return "🐺";
  if (b.includes("bear") || b.includes("熊")) return "🐻";
  if (b.includes("bird") || b.includes("鸟")) return "🐦";
  if (b.includes("dragon") || b.includes("龙")) return "🐉";
  return "🐾";
}

// ── Grid 渲染 ─────────────────────────────────────────

function renderGridAsAvatar(grid, gridText) {
  const canvas = document.createElement("canvas");
  const size = 300;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const cellSize = size / 32;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "rgb(57, 255, 20)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${cellSize}px monospace`;

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const cell = grid[y][x];
      if (cell === "pixel") {
        ctx.fillStyle = "rgb(57, 255, 20)";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else if (cell === "text" || cell === "#") {
        ctx.fillStyle = "rgb(57, 255, 20)";
        ctx.fillText(gridText, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      } else if (cell !== null && cell !== "/") {
        ctx.fillStyle = "rgb(57, 255, 20)";
        ctx.fillText(cell, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      }
    }
  }

  return canvas.toDataURL();
}

// ── 启动 ─────────────────────────────────────────────

loadRanking();
