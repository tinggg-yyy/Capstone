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
  const namedProfiles = data.filter((p) => p.name);
  initTicker(namedProfiles);
  startFakeDanmaku(namedProfiles);
}

function showSpotlight(idx) {
  currentIdx = idx;
  const p = ranking[idx];

  const v = (val) => val || "—";

  function displayBilingual(val) {
    if (!val) return "—";
    if (val.includes(" · ")) {
      const parts = val.split(" · ");
      const zh = parts.map(p => p.split(" / ")[0].trim()).join(" · ");
      const en = parts.map(p => { const s = p.split(" / "); return s.length > 1 ? s.slice(1).join(" / ").trim() : ""; }).filter(Boolean).join(" · ");
      return en ? `${zh}<br><small>${en}</small>` : zh;
    }
    if (val.includes("/")) {
      const idx = val.indexOf("/");
      const zh = val.substring(0, idx).trim();
      const en = val.substring(idx + 1).replace(/·/g, " · ").trim();
      if (zh.length + en.length > 14) return `${zh}<br><small>${en}</small>`;
      return `${zh} ${en}`;
    }
    return val;
  }

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
    ? `${displayBilingual(p.breed)} <span class="mixed-mark">× ${displayBilingual(p.breed2)}（混血 Mixed）</span>`
    : displayBilingual(p.breed);

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
        <div class="cell"><span class="label">名字<br><small>Name</small></span><span class="value big">${v(p.name)}</span></div>
        <div class="cell"><span class="label">物种<br><small>Species</small></span><span class="value">${breedDisplay}</span></div>
      </div>

      <div class="grid-3">
        <div class="cell"><span class="label">性别<br><small>Gender</small></span><span class="value">${displayBilingual(p.gender)}</span></div>
        <div class="cell"><span class="label">年龄<br><small>Age</small></span><span class="value">${v(p.age)}</span></div>
        <div class="cell"><span class="label">身高<br><small>Height</small></span><span class="value">${v(p.height)}</span></div>
      </div>

      <div class="section">
        <span class="label">领地 <small>Territory</small></span>
        <span class="value">${v(p.hukou)}</span>
      </div>

      <div class="grid-3">
        <div class="cell"><span class="label">MBTI</span><span class="value big">${v(p.mbti)}</span></div>
        <div class="cell"><span class="label">性取向<br><small>Orientation</small></span><span class="value">${displayBilingual(p.orientation)}</span></div>
        <div class="cell"><span class="label">婚育<br><small>Status</small></span><span class="value">${displayBilingual(p.sterilized)}</span></div>
      </div>

      <div class="grid-3">
        <div class="cell"><span class="label">学历<br><small>Education</small></span><span class="value">${displayBilingual(p.edu)}</span></div>
        <div class="cell"><span class="label">职业<br><small>Job</small></span><span class="value">${v(p.occupation)}</span></div>
        <div class="cell"><span class="label">月收入<br><small>Income</small></span><span class="value">${displayBilingual(p.income)}</span></div>
      </div>

      <div class="grid-2">
        <div class="cell"><span class="label">兴趣爱好<br><small>Hobbies</small></span><span class="value">${v(p.hobby)}</span></div>
        <div class="cell"><span class="label">交友目的<br><small>Goal</small></span><span class="value">${v(p.goal)}</span></div>
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

// ── 假弹幕生成系统 ────────────────────────────────────────

const _ADJ = ["香", "屑", "迷", "可以", "抽象", "在线", "离谱", "真实", "猛", "怪", "稳", "炸", "秀", "可疑", "上头", "危险", "哲学", "清醒", "迷惑", "敢说", "挺好", "有趣", "一般", "不行", "震撼", "高级", "接地气", "有点东西", "说不清楚", "耐人寻味", "确实如此", "不明觉厉"];
const _SKIP_REASONS = [
  "年龄差太大", "领地距离有点远", "MBTI感觉不合", "收入那栏看了一眼就划走了",
  "爱好完全不重合", "看了五秒感觉不是很合适", "物种匹配率太低", "第一印象太普通了",
  "直觉告诉它不行", "好像见过面不太合拍", "感觉对方不太在线", "综合考量了一下算了",
  "学历那栏让它犹豫了", "职业方向差太多", "想了想还是跳过", "头像看起来不太对味",
  "婚育状态不符合预期", "感觉双方目标不一样", "无法解释 就是没感觉",
];
const _LIKE_REASONS = [
  "物种加分项", "MBTI很对味", "爱好高度重合", "领地离得近", "学历让它心动了",
  "职业很加分", "收入让它眼前一亮", "头像看起来很顺眼", "综合评分太高了没忍住",
  "感觉气场相符", "看了三秒就决定了", "直觉说可以", "某个爱好标签戳到它了",
  "无法解释 就是感觉对", "感觉对方很有品味", "档案写得很真实",
];
const _COMMENT_TEMPLATES = [
  (a, b, tag, adj) => `💬「${a}」评论了「${b}」的[${tag}]标签：有点${adj}`,
  (a, b, tag, adj) => `💬「${a}」看了「${b}」的[${tag}]，觉得有点${adj}`,
  (a, b, tag, adj) => `💬「${a}」对「${b}」的[${tag}]留下印象：${adj}`,
  (a, b, tag, adj) => `🗨「${a}」评价「${b}」的[${tag}]：确实有点${adj}`,
  (a, b, tag, adj) => `💬「${a}」看到「${b}」写了[${tag}]，评价说：${adj}`,
];
const _LIKE_TEMPLATES = [
  (a, b, reason) => `💗「${a}」喜欢了「${b}」· ${reason}`,
  (a, b, reason) => `💗「${a}」对「${b}」上头 · 原因：${reason}`,
  (a, b, reason) => `💗「${a}」给「${b}」点了喜欢 · ${reason}`,
  (a, b, reason) => `💗「${a}」→「${b}」✓ · ${reason}`,
  (a, b, reason) => `「${a}」💗「${b}」· ${reason}`,
];
const _SKIP_TEMPLATES = [
  (a, b, reason) => `❌「${a}」跳过了「${b}」· ${reason}`,
  (a, b, reason) => `❌「${a}」划走了「${b}」· ${reason}`,
  (a, b, reason) => `❌「${a}」→「${b}」✗ · ${reason}`,
  (a, b, reason) => `「${a}」❌「${b}」· ${reason}`,
  (a, b, reason) => `❌「${a}」没有选择「${b}」· ${reason}`,
];

function _rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function _extractTags(p) {
  const tags = [];
  if (p.hobby) {
    p.hobby.split(/[,，、\s]+/).filter(Boolean).forEach((t) => tags.push(t.trim()));
  }
  if (p.mbti) tags.push(`MBTI ${p.mbti}`);
  if (p.breed) tags.push(p.breed.split(" · ").pop().split(" / ")[0].trim());
  if (p.occupation) tags.push(p.occupation);
  if (p.edu) tags.push(p.edu.split("/")[0].trim());
  return tags.filter((t) => t.length > 0 && t.length < 12);
}

function buildFakeDanmakuPool(profiles) {
  if (profiles.length < 2) return [];
  const pool = [];
  const names = profiles.map((p) => p.name || p.username);

  for (let i = 0; i < profiles.length; i++) {
    const a = profiles[i];
    const aName = a.name || a.username;

    // 每个人随机对几个他人生成 like / skip / comment
    const others = profiles.filter((_, j) => j !== i);
    const picks = others.sort(() => Math.random() - 0.5).slice(0, Math.min(4, others.length));

    picks.forEach((b) => {
      const bName = b.name || b.username;

      // like
      pool.push({
        text: _rnd(_LIKE_TEMPLATES)(aName, bName, _rnd(_LIKE_REASONS)),
        type: "like",
      });

      // skip
      pool.push({
        text: _rnd(_SKIP_TEMPLATES)(aName, bName, _rnd(_SKIP_REASONS)),
        type: "skip",
      });

      // comment on a tag
      const tags = _extractTags(b);
      if (tags.length > 0) {
        const tag = _rnd(tags);
        const adj = _rnd(_ADJ);
        const tpl = _rnd(_COMMENT_TEMPLATES);
        pool.push({ text: tpl(aName, bName, tag, adj), type: "comment" });
      }
    });
  }

  // Shuffle
  return pool.sort(() => Math.random() - 0.5);
}

let _fakeDanmakuPool = [];
let _fakeDanmakuIdx = 0;
let _fakeDanmakuTimer = null;

function startFakeDanmaku(profiles) {
  _fakeDanmakuPool = buildFakeDanmakuPool(profiles);
  if (_fakeDanmakuPool.length === 0) return;

  function fire() {
    if (_fakeDanmakuPool.length === 0) return;
    const item = _fakeDanmakuPool[_fakeDanmakuIdx % _fakeDanmakuPool.length];
    _fakeDanmakuIdx++;
    spawnDanmaku(item.text, item.type);
    // 每条随机间隔 1.8~4.5s
    _fakeDanmakuTimer = setTimeout(fire, 1800 + Math.random() * 2700);
  }

  // 延迟 1s 开始，避免页面加载时爆发
  _fakeDanmakuTimer = setTimeout(fire, 1000);
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
    const name = p.name || p.username || "Unknown User";
    const score = Math.max(0, (p.score ?? 60) - (p.skips?.length || 0));

    if (p.mixed && p.breed2) {
      msgs.push({ text: `⚠ 混血用户 Mixed-heritage user「${name}」已进入 entered · ${p.breed} × ${p.breed2}（混血 Mixed）`, type: "alert" });
    }
    if (score < 50) {
      msgs.push({ text: `📊 用户「${name}」综合评分 Score: ${score} / 100`, type: "low" });
    }
    if (isNonMammal(p.breed)) {
      msgs.push({ text: `🦎 「${name}」物种 Species: ${p.breed}（非哺乳类 non-mammal）`, type: "species" });
    }
    if (isNonStraight(p.orientation)) {
      msgs.push({ text: `🏳 「${name}」性取向 Orientation: ${p.orientation}`, type: "orientation" });
    }
    if (p.likes && p.likes.length >= 5) {
      msgs.push({ text: `💗 「${name}」已获得 received ${p.likes.length} 个 likes`, type: "like" });
    }
  });

  if (msgs.length === 0) {
    msgs.push({ text: "暂无数据 No notable data yet", type: "neutral" });
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
    data.label && data.reason ? ` 因为[${data.label}]它觉得 thinks: ${data.reason}` : "";
  spawnDanmaku(`💗 ${data.by} 对 ${data.name} 上头 fell for them${reasonPart}`, "like");

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
    pushTickerMessage(`💗 「${data.name}」累计 total ${data.likesCount} 个喜欢 likes`, "like");
  }
});

socket.on("skip-event", (data) => {
  const reasonPart =
    data.label && data.reason ? ` 因为[${data.label}]它觉得 thinks: ${data.reason}` : "";
  spawnDanmaku(`❌ ${data.by} 跳过 skipped ${data.name}${reasonPart}`, "skip");
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
