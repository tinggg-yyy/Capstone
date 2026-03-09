function loadRanking() {
  fetch("/profiles")
    .then((res) => res.json())
    .then((data) => {
      // 按 likes 数量排序
      const sorted = data
        .filter((p) => p.likes)
        .sort((a, b) => b.likes.length - a.likes.length)
        .slice(0, 6);

      const board = document.getElementById("ranking-board");
      board.innerHTML = sorted
        .map(
          (p, i) => `
        <div class="rank-row rank-${i + 1}">
          <div class="rank-num">${i + 1}</div>
          <div class="avatar-wrap">
            <img src="${p.avatar}" />
          </div>
          <div class="info">
            <div class="pet-name">${p.name}</div>
            <div class="pet-meta">${p.breed} · ${p.mbti} · ${p.gender}</div>
          </div>
          <div class="likes-badge">
            <div class="likes-count">💗${p.likes.length}</div>
            <div class="likes-label">LIKES</div>
          </div>
        </div>
      `,
        )
        .join("");
    });
}
