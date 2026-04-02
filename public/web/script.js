const socket = io();

async function loadRanking() {
  const res = await fetch("/profiles");
  const data = await res.json();

  // rank by likes, filter no name
  const sorted = data
    .filter((p) => p.name)
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));

  renderNo1(sorted[0]);
  renderGrid(sorted.slice(1, 5)); // No.2~5
  renderList(sorted.slice(5)); // No.6+
}

// avatarHTML
function avatarHTML(p, big = false) {
  const cls = big ? "big-avatar" : "small-avatar";
  const ph = big ? "big-placeholder" : "small-placeholder";
  return p.avatar
    ? `<img class="${cls}" src="${p.avatar}" />`
    : `<div class="${ph}">${getEmoji(p.breed)}</div>`;
}

// No1 Card
function renderNo1(p) {
  if (!p) return;
  document.querySelector(".rank-1-card").innerHTML = `
    ${avatarHTML(p, true)}
    <div class="r1-likes">💗 ${p.likes?.length || 0} LIKES</div>
    <div class="overlay">
      <div class="no1-badge"><span class="no-label">No.</span>1</div>
      <div class="r1-name">${p.name}</div>
      <div class="r1-meta">
        品种: ${p.breed || "—"}<br/>
        性别: ${p.gender || "—"} &nbsp;·&nbsp; 绝育: ${p.sterilized || "—"}<br/>
        MBTI: ${p.mbti || "—"}<br/>
        日常: ${p.dailylife || "—"}<br/>
        爱好: ${p.hobby || "—"}
      </div>
    </div>
  `;
}

// No.2~5 Grid
function renderGrid(pets) {
  const grid = document.querySelector(".rank-grid");
  grid.innerHTML = pets
    .map(
      (p, i) => `
    <div class="rank-card rank-${i + 2}">
      ${avatarHTML(p, false)}
      <div class="card-likes">💗${p.likes?.length || 0}</div>
      <div class="overlay">
        <div class="rank-badge">No.${i + 2}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-meta">
          ${p.breed || "—"} · ${p.mbti || "—"}<br/>
          ${p.gender || "—"} · ${p.sterilized || "—"}<br/>
          日常: ${p.dailylife || "—"}<br/>
          爱好: ${p.hobby || "—"}
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

// No.6+ List
function renderList(pets) {
  const list = document.querySelector(".rank-list");
  if (!pets.length) {
    list.innerHTML = "";
    return;
  }

  list.innerHTML = pets
    .map(
      (p, i) => `
    <div class="rank-list-row">
      <div class="list-num">${i + 6}</div>
      <div class="list-avatar">
        ${
          p.avatar
            ? `<img src="${p.avatar}" style="width:36px;height:36px;object-fit:cover;border-radius:4px"/>`
            : getEmoji(p.breed)
        }
      </div>
      <div class="list-info">
        <div class="list-name">${p.name}</div>
        <div class="list-meta">
          ${p.breed || "—"} · ${p.mbti || "—"} · ${p.gender || "—"} · 绝育:${p.sterilized || "—"}<br/>
          日常: ${p.dailylife || "—"} &nbsp; 爱好: ${p.hobby || "—"}
        </div>
      </div>
      <div class="list-likes">💗${p.likes?.length || 0}</div>
    </div>
  `,
    )
    .join("");
}

loadRanking();
