const socket = io();

let ranking = [];
let currentIdx = 0;
let cycleTimer = null;

// ── 像素 emoji ────────────────────────────────────────

function getPixelHeartUrl() {
  if (getPixelHeartUrl._cache) return getPixelHeartUrl._cache;
  const pattern = [
    [0,1,1,0,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0],
  ];
  const px = 20;
  const c = document.createElement("canvas");
  c.width = 7 * px; c.height = 6 * px;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgb(57,255,20)";
  pattern.forEach((row, ry) => row.forEach((v, rx) => { if (v) ctx.fillRect(rx*px, ry*px, px, px); }));
  getPixelHeartUrl._cache = c.toDataURL();
  return getPixelHeartUrl._cache;
}

function getPixelVomitUrl() {
  if (getPixelVomitUrl._cache) return getPixelVomitUrl._cache;
  const pattern = [
    [0,1,1,1,1,1,0],
    [1,0,1,0,1,0,1],
    [1,1,0,1,0,1,1],
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,1,1,1,1,1],
  ];
  const px = 20;
  const c = document.createElement("canvas");
  c.width = 7 * px; c.height = 9 * px;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgb(57,255,20)";
  pattern.forEach((row, ry) => row.forEach((v, rx) => { if (v) ctx.fillRect(rx*px, ry*px, px, px); }));
  getPixelVomitUrl._cache = c.toDataURL();
  return getPixelVomitUrl._cache;
}

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
  initTicker(data.filter((p) => p.name));
}

function showSpotlight(idx) {
  currentIdx = idx;
  const p = ranking[idx];

  const v = (val) => val || "—";

  const baseScore = p.score ?? 60;
  const skipCount = p.skips ? p.skips.length : 0;
  const displayScore = Math.max(0, baseScore - skipCount);
  const _sd = p.date ? new Date(p.date) : null;
  const stampDate = _sd
    ? `${_sd.getFullYear()}.${String(_sd.getMonth()+1).padStart(2,"0")}.${String(_sd.getDate()).padStart(2,"0")}`
    : "";
  const stampColorClass = displayScore < 60 ? "stamp-red" : "";

  const avatarHTML = p.grid
    ? `<img class="avatar" src="${renderGridAsAvatar(p.grid, p.gridText)}" alt="${p.name}" />`
    : `<div class="avatar-placeholder">${getEmoji(p.breed)}</div>`;

  const breedDisplay = p.mixed && p.breed2
    ? `${p.breed || "—"} <span class="mixed-mark">× ${p.breed2}（混血）</span>`
    : v(p.breed);

  const likesCount = p.likes?.length || 0;
  const skipsCount = p.skips?.length || 0;
  const heartImg = getPixelHeartUrl();
  const vomitImg = getPixelVomitUrl();
  const heartsHTML = likesCount === 0
    ? '<span class="stat-empty">—</span>'
    : Array(Math.min(likesCount, 60)).fill(`<img src="${heartImg}" class="pixel-emoji">`).join("");
  const skipsHTML = skipsCount === 0
    ? '<span class="stat-empty">—</span>'
    : Array(Math.min(skipsCount, 60)).fill(`<img src="${vomitImg}" class="pixel-emoji pixel-emoji-skip">`).join("");

  document.getElementById("spotlight").innerHTML = `
    <div class="s-rank-bar">
      <div class="s-rank">No.${idx + 1}</div>
    </div>

    <div class="avatar-row">
      <div class="avatar-wrap">
        ${avatarHTML}
        <div class="profile-score-stamp ${stampColorClass}">
          <span class="stamp-date">${stampDate}</span>
          <span class="stamp-num">${displayScore}</span>
          <span class="stamp-lines"><span></span><span></span></span>
        </div>
      </div>
      <div class="avatar-stats">
        <div class="emoji-pile">${heartsHTML}</div>
        <div class="emoji-pile emoji-pile-skips">${skipsHTML}</div>
      </div>
    </div>

    <div class="card">
      <div class="grid-2">
        <div class="cell"><span class="label">名字</span><span class="value big">${v(p.name)}</span></div>
        <div class="cell"><span class="label">物种</span><span class="value">${breedDisplay}</span></div>
      </div>

      <div class="grid-3">
        <div class="cell"><span class="label">性别</span><span class="value">${v(p.gender)}</span></div>
        <div class="cell"><span class="label">年龄</span><span class="value">${v(p.age)}</span></div>
        <div class="cell"><span class="label">身高</span><span class="value">${v(p.height)}</span></div>
      </div>

      <div class="section">
        <span class="label">领地</span>
        <span class="value">${v(p.hukou)}</span>
      </div>

      <div class="grid-3">
        <div class="cell"><span class="label">MBTI</span><span class="value big">${v(p.mbti)}</span></div>
        <div class="cell"><span class="label">性取向</span><span class="value">${v(p.orientation)}</span></div>
        <div class="cell"><span class="label">婚育状况</span><span class="value">${v(p.sterilized)}</span></div>
      </div>

      <div class="grid-3">
        <div class="cell"><span class="label">学历</span><span class="value">${v(p.edu)}</span></div>
        <div class="cell"><span class="label">职业</span><span class="value">${v(p.occupation)}</span></div>
        <div class="cell"><span class="label">月收入</span><span class="value">${v(p.income)}</span></div>
      </div>

      <div class="grid-2">
        <div class="cell"><span class="label">兴趣爱好</span><span class="value">${v(p.hobby)}</span></div>
        <div class="cell"><span class="label">交友目的</span><span class="value">${v(p.goal)}</span></div>
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
  void bar.offsetWidth;
  bar.classList.add("running");
}

// ── 弹幕 ──────────────────────────────────────────────

function spawnDanmaku(text, type = "like") {
  const layer = document.getElementById("danmaku-layer");
  const el = document.createElement("div");
  el.className = `danmaku danmaku-${type}`;
  el.textContent = text;

  el.style.top = 10 + Math.random() * 75 + "%";
  layer.appendChild(el);

  el.addEventListener("animationend", () => el.remove());
}

// ── 新闻滚动条（ticker）────────────────────────────────

const NON_MAMMAL_KEYWORDS = ["鸟", "爬", "鱼", "虫", "节肢", "两栖", "蛇", "龙", "蜥", "蛙", "鳄", "乌龟", "蝎", "蜘蛛", "螃蟹", "鲨", "鲸"];
const NON_STRAIGHT_ORIENTATIONS = ["同性恋", "双性恋", "泛性恋", "无性恋", "无浪漫", "流性恋", "酷儿"];

function isNonMammal(breed) {
  if (!breed) return false;
  return NON_MAMMAL_KEYWORDS.some((k) => breed.includes(k));
}

function isNonStraight(orientation) {
  if (!orientation) return false;
  return NON_STRAIGHT_ORIENTATIONS.some((k) => orientation.includes(k));
}

function generateTickerMessages(profiles) {
  const msgs = [];

  profiles.forEach((p) => {
    const name = p.name || p.username || "未知用户";
    const score = Math.max(0, (p.score ?? 60) - (p.skips?.length || 0));

    if (p.mixed && p.breed2) {
      msgs.push({ text: `⚠ 混血用户「${name}」已进入系统 · ${p.breed} × ${p.breed2}（混血）`, type: "alert" });
    }
    if (score < 50) {
      msgs.push({ text: `📊 用户「${name}」综合评分 ${score} / 100`, type: "low" });
    }
    if (isNonMammal(p.breed)) {
      msgs.push({ text: `🦎 「${name}」物种为 ${p.breed}（非哺乳类）`, type: "species" });
    }
    if (isNonStraight(p.orientation)) {
      msgs.push({ text: `🏳 「${name}」性取向：${p.orientation}`, type: "orientation" });
    }
    if (p.likes && p.likes.length >= 5) {
      msgs.push({ text: `💗 「${name}」已获得 ${p.likes.length} 个喜欢`, type: "like" });
    }
  });

  if (msgs.length === 0) {
    msgs.push({ text: "暂无值得关注的异常数据", type: "neutral" });
  }

  return msgs;
}

function initTicker(profiles) {
  const msgs = generateTickerMessages(profiles);
  const track = document.getElementById("ticker-content");
  if (!track) return;

  // Duplicate for seamless loop
  const full = [...msgs, ...msgs];
  track.innerHTML = full
    .map((m) => `<span class="ticker-item ticker-item-${m.type}">${m.text}</span>`)
    .join('<span class="ticker-sep">·</span>');

  // Calculate scroll duration based on content length
  const totalChars = full.reduce((s, m) => s + m.text.length, 0);
  const duration = Math.max(30, totalChars * 0.35);
  track.style.animationDuration = `${duration}s`;
}

function pushTickerMessage(text, type = "alert") {
  const track = document.getElementById("ticker-content");
  if (!track) return;
  const span = document.createElement("span");
  span.className = `ticker-item ticker-item-${type}`;
  span.textContent = text;
  const sep = document.createElement("span");
  sep.className = "ticker-sep";
  sep.textContent = "·";
  track.prepend(sep);
  track.prepend(span);
}

// ── Socket.io 实时事件 ─────────────────────────────────

socket.on("like-event", (data) => {
  const reasonPart =
    data.label && data.reason ? ` 因为【${data.label}】它觉得${data.reason}` : "";
  spawnDanmaku(`💗 ${data.by} 对 ${data.name} 上头${reasonPart}`, "like");

  const profile = ranking.find((p) => p.name === data.name);
  if (profile && data.likesCount !== undefined) {
    profile.likes = new Array(data.likesCount);
    if (ranking[currentIdx]?.name === data.name) {
      const box = document.querySelector(".emoji-pile");
      if (box) {
        const h = getPixelHeartUrl();
        box.innerHTML = data.likesCount === 0
          ? '<span class="stat-empty">—</span>'
          : Array(Math.min(data.likesCount, 60)).fill(`<img src="${h}" class="pixel-emoji">`).join("");
      }
    }
  }

  if (data.likesCount && data.likesCount % 5 === 0) {
    pushTickerMessage(`💗 「${data.name}」累计获得 ${data.likesCount} 个喜欢`, "like");
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

const CELL_ALPHA_WEB = { 1: 0.25, 2: 0.49, 3: 0.75, 4: 1, "pixel": 1, "text": 1, "#": 1,
  "#1": 0.25, "#2": 0.49, "#3": 0.75, "#4": 1 };

function cellAlphaWeb(cell) {
  if (Array.isArray(cell)) return cell[1];
  return CELL_ALPHA_WEB[cell] ?? 1;
}

function renderGridAsAvatar(grid, gridText) {
  const canvas = document.createElement("canvas");
  const size = 840;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const cellSize = size / 32;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${cellSize}px monospace`;

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const cell = grid[y][x];
      if (cell === null || cell === "/") continue;

      if (Array.isArray(cell)) {
        ctx.fillStyle = `rgba(57,255,20,${cell[1]})`;
        ctx.fillText(cell[0], x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      } else if (cell === "pixel") {
        ctx.fillStyle = "rgb(57, 255, 20)";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else if (typeof cell === "string" && cell.startsWith("#")) {
        const alpha = CELL_ALPHA_WEB[cell] ?? 1;
        ctx.fillStyle = `rgba(57,255,20,${alpha})`;
        ctx.fillText(gridText || "", x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      } else if (cell === "text") {
        ctx.fillStyle = "rgb(57, 255, 20)";
        ctx.fillText(gridText || "", x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      } else if (typeof cell === "number") {
        const alpha = CELL_ALPHA_WEB[cell] ?? 1;
        ctx.fillStyle = `rgba(57,255,20,${alpha})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else {
        ctx.fillStyle = "rgb(57, 255, 20)";
        ctx.fillText(cell, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      }
    }
  }

  return canvas.toDataURL();
}

// ── 启动 ─────────────────────────────────────────────

loadRanking();
