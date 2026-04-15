let currentUser = null;

// Login Function
function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username) return alert("请输入用户名 / Please enter username");

  // 从服务器拿所有 profiles，检查是否已存在
  fetch("/profiles")
    .then((res) => res.json())
    .then((data) => {
      const existing = data.find(
        (p) => p.username === username && p.password === password,
      );

      if (existing) {
        currentUser = existing;
        // 老用户 → 直接进入 swipe
        checkNotifications();
        startMessagePolling();
        createSwipeCard();
      } else {
        const userExists = data.find((p) => p.username === username);
        if (userExists) {
          // username 存在但密码错
          alert("密码错误 / Wrong password");
        } else {
          // 新用户 → 走注册流程
          goTo("profile-name");
        }
      }
    });
}

// Page Navigation Function
function goTo(id) {
  document.querySelectorAll(".page").forEach((p) => {
    p.classList.remove("active");
  });
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
  } else {
    console.error(`Element with id "${id}" not found.`);
  }
}

// Date Picker Functions
let selectedYear = 2020;
let selectedMonth = 1;
let selectedDay = 1;

function openDatePicker() {
  document.getElementById("datePicker").classList.remove("hidden");
  generateWheels();
}

function generateWheels() {
  createWheel("yearWheel", 2000, 2026, selectedYear, (v) => (selectedYear = v));
  createWheel("monthWheel", 1, 12, selectedMonth, (v) => (selectedMonth = v));
  createWheel("dayWheel", 1, 31, selectedDay, (v) => (selectedDay = v));
}

function createWheel(id, start, end, selected, onSelect) {
  const wheel = document.getElementById(id);
  wheel.innerHTML = "";

  for (let i = start; i <= end; i++) {
    const item = document.createElement("div");
    item.textContent = i;
    if (i === selected) item.classList.add("selected");

    item.onclick = () => {
      onSelect(i);
      generateWheels(); // refresh highlight
    };

    wheel.appendChild(item);
  }
  wheel.addEventListener("touchstart", (e) => e.stopPropagation(), {
    passive: true,
  });
  wheel.addEventListener("touchmove", (e) => e.stopPropagation(), {
    passive: true,
  });
}

function confirmDate() {
  const display = document.getElementById("birthDisplay");
  display.value = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;

  document.getElementById("datePicker").classList.add("hidden");
}

//Age Calculation
function getPetAge() {
  const value = document.getElementById("birthDisplay").value;
  if (!value) return "未知";

  const birth = new Date(value);
  const today = new Date();

  const totalMonths =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) {
    return `${months}个月`;
  } else if (months === 0) {
    return `${years}岁`;
  } else {
    return `${years}.${months}岁`;
  }
}

// Breed data
const breedData = {
  "哺乳类 / Mammals": [
    "狗 / Dog",
    "猫 / Cat",
    "兔子 / Rabbit",
    "仓鼠 / Hamster",
    "豚鼠 / Guinea Pig",
    "雪貂 / Ferret",
    "狐狸 / Fox",
    "浣熊 / Raccoon",
    "刺猬 / Hedgehog",
    "龙猫 / Chinchilla",
    "其他哺乳类 / Other Mammal",
  ],
  "鸟类 / Birds": [
    "鹦鹉 / Parrot",
    "金丝雀 / Canary",
    "文鸟 / Finch",
    "鸽子 / Pigeon",
    "猫头鹰 / Owl",
    "乌鸦 / Crow",
    "八哥 / Myna",
    "其他鸟类 / Other Bird",
  ],
  "爬行类 / Reptiles": [
    "蜥蜴 / Lizard",
    "壁虎 / Gecko",
    "变色龙 / Chameleon",
    "蛇 / Snake",
    "龟 / Turtle",
    "鳄蜥 / Crocodile Skink",
    "其他爬行类 / Other Reptile",
  ],
  "两栖类 / Amphibians": [
    "青蛙 / Frog",
    "蝾螈 / Salamander",
    "蟾蜍 / Toad",
    "钝口螈 / Axolotl",
    "其他两栖类 / Other Amphibian",
  ],
  "节肢动物 / Arthropods": [
    "蜘蛛 / Spider",
    "蝎子 / Scorpion",
    "螃蟹 / Crab",
    "蜈蚣 / Centipede",
    "蚱蜢 / Grasshopper",
    "其他节肢动物 / Other Arthropod",
  ],
};

function onBreedClassChange() {
  const cls = document.getElementById("petBreedClass").value;
  const select = document.getElementById("petBreed");
  const wrapper = document.getElementById("breedSpecificWrapper");

  select.innerHTML =
    '<option value="" disabled selected hidden>选择品种 / Select breed...</option>';
  (breedData[cls] || []).forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    select.appendChild(opt);
  });

  wrapper.classList.remove("hidden");
}

// Create Profile & Swipe Function
let profiles = [];
let currentIndex = 0;
function createCard() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("petName").value;
  const breedClass = document.getElementById("petBreedClass").value;
  const breedSpecific = document.getElementById("petBreed").value;
  const breed =
    breedClass && breedSpecific
      ? `${breedClass} · ${breedSpecific}`
      : breedSpecific || breedClass;
  const gender = document.getElementById("petGender").value;
  const orientation = document.getElementById("petOrientation").value;
  const age = getPetAge();
  const hukou = document.getElementById("petHukou").value;
  const sterilized = document.getElementById("petSterilized").value;
  const mbti1 = document.getElementById("petMbti1").value;
  const mbti2 = document.getElementById("petMbti2").value;
  const mbti3 = document.getElementById("petMbti3").value;
  const mbti4 = document.getElementById("petMbti4").value;

  const mbti = mbti1 + mbti2 + mbti3 + mbti4;
  const dailylife = document.getElementById("dailylife").value;
  const hobby = document.getElementById("hobby").value;
  const edu = document.getElementById("petEdu").value;
  const occupation = document.getElementById("petOccupation").value;
  const income = document.getElementById("petIncome").value;
  const avatarUrl = generateAvatarUrl();
  console.log("Avatar URL from createCard:", avatarUrl);

  let profile = {
    username: username,
    password: password,
    name: name,
    breed: breed,
    gender: gender,
    orientation: orientation,
    age: age,
    hukou: hukou,
    sterilized: sterilized,
    mbti: mbti,
    dailylife: dailylife,
    hobby: hobby,
    edu: edu,
    occupation: occupation,
    income: income,
    avatar: avatarUrl,
    grid: grid,
    gridText: currentText,
  };

  // send the profile data to the server
  fetch("/profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  })
    .then((res) => res.json())
    .then((data) => {
      currentUser = data;
      console.log("Saved profile:", data);
      startMessagePolling();
    });

  // create the card content
  const card = `
  <img src="${avatarUrl}" alt="Fursona" style="width:100px; height:100px;" />
    <h3>${name || "无名兽人 / Unnamed Anthro"}</h3>
    <p>物种 / Species: ${breed}</p>
    <p style="opacity:0.6; font-size:14px;">
      ${gender} · ${age} · 领地 ${hukou} · ${sterilized} · MBTI: ${mbti} <br />
      日常生活 / Daily Life: ${dailylife} <br />
      爱好 / Hobby: ${hobby}
    </p>
  `;

  document.getElementById("petCard").innerHTML = card;

  goTo("card");
}

function matchesOrientation(viewer, target) {
  const o = (viewer.orientation || "").split("/")[0]; // e.g. "异性恋"
  const vg = (viewer.gender || "").split("/")[0]; // e.g. "雄"
  const tg = (target.gender || "").split("/")[0]; // e.g. "雌"

  if (o === "异性恋") {
    if (vg === "雄") return tg === "雌";
    if (vg === "雌") return tg === "雄";
    return true; // 非二元 viewer 看全部
  }
  if (o === "同性恋") {
    return tg === vg;
  }
  // 双性恋 / 泛性恋 / 无性恋 / 其他 / 不透露 / 未填 → 全部显示
  return true;
}

function createSwipeCard() {
  if (!currentUser) {
    alert("请先登录 / Please login first");
    goTo("login");
    return;
  }
  checkNotifications();
  //Get profiles from profiles.json
  fetch("/profiles")
    // transform the response into JSON to get the data
    .then((res) => res.json())
    // store data back in the profiles array
    .then((data) => {
      profiles = data;

      // Remove the current user's profile from the list
      profiles = profiles.filter((p) => p.username !== currentUser.username);

      // Filter by orientation
      profiles = profiles.filter((p) => matchesOrientation(currentUser, p));

      currentIndex = 0;
      showProfile();
      goTo("swipe-page");
    });
}

let currentProfileInterpretations = {};
let longPressJustFired = false;

function renderValue(profile, field, valueText, extraClass = "") {
  const raw = profile.interpretations && profile.interpretations[field];
  const interps = Array.isArray(raw) ? raw : raw ? [raw] : [];
  if (interps.length > 0) {
    return `<span class="value ${extraClass} has-interpretations" data-field="${field}">${valueText}</span>`;
  }
  return `<span class="value ${extraClass}" data-field="${field}">${valueText}</span>`;
}

function showProfile() {
  const container = document.getElementById("swipe-container");
  container.innerHTML = "";

  if (currentIndex >= profiles.length) {
    container.innerHTML = "<h1>没有更多兽人了 🐾</h1>";
    return;
  }

  const profile = profiles[currentIndex];
  currentProfileInterpretations = profile.interpretations || {};

  container.innerHTML = `
<div class="card">

  <div class="avatar-box">
    <img src="${profile.grid ? renderGridAsAvatar(profile.grid, profile.gridText) : profile.avatar}" class="avatar">
  </div>

  <div class="section">
    <span class="label">名字</span>
    ${renderValue(profile, "name", profile.name, "big")}
  </div>

  <div class="grid-3">
    <div class="cell">
      <span class="label">性别</span>
      ${renderValue(profile, "gender", profile.gender)}
    </div>
    <div class="cell">
      <span class="label">年龄</span>
      ${renderValue(profile, "age", profile.age)}
    </div>
    <div class="cell">
      <span class="label">户籍</span>
      ${renderValue(profile, "hukou", profile.hukou)}
    </div>
  </div>

  <div class="section">
    <span class="label">性取向</span>
    ${renderValue(profile, "orientation", profile.orientation || "—")}
  </div>

  <div class="section">
    <span class="label">MBTI</span>
    ${renderValue(profile, "mbti", profile.mbti, "big")}
  </div>

  <div class="grid-2">
    <div class="cell">
      <span class="label">婚育状况</span>
      ${renderValue(profile, "sterilized", profile.sterilized)}
    </div>
    <div class="cell">
      <span class="label">交友目的</span>
      ${renderValue(profile, "goal", profile.goal)}
    </div>
  </div>

  <div class="grid-3">
    <div class="cell">
      <span class="label">学历</span>
      ${renderValue(profile, "edu", profile.edu || "—")}
    </div>
    <div class="cell">
      <span class="label">职业</span>
      ${renderValue(profile, "occupation", profile.occupation || "—")}
    </div>
    <div class="cell">
      <span class="label">月收入</span>
      ${renderValue(profile, "income", profile.income || "—")}
    </div>
  </div>

  <div class="grid-2">
    <div class="cell">
      <span class="label">兴趣爱好</span>
      ${renderValue(profile, "hobby", profile.hobby)}
    </div>
    <div class="cell">
      <span class="label">日常生活</span>
      ${renderValue(profile, "dailylife", profile.dailylife)}
    </div>
  </div>

  <div class="section">
    <span class="label">被喜欢</span>
    <span class="value big">${profile.likes ? profile.likes.length : 0} 💗</span>
  </div>

</div>
  `;

  attachLabelHandlers(profile.username);
  console.log("Showing profile:", profile);
  console.log("Current index:", currentIndex);
}

// Long press + tap handlers for labels
let longPressTimer = null;
let interpTarget = { field: null, profileUsername: null, labelText: null };
let touchStartX = 0;
let touchStartY = 0;

function attachLabelHandlers(profileUsername) {
  const container = document.getElementById("swipe-container");

  // Remove old listeners by replacing the container node's cloned handlers
  // (simpler: just use a flag so we don't double-bind across showProfile calls)
  if (container._labelHandlersBound) {
    container.removeEventListener("touchstart", container._onTouchStart);
    container.removeEventListener("touchend", container._onTouchEnd);
    container.removeEventListener("touchcancel", container._onTouchCancel);
    container.removeEventListener("touchmove", container._onTouchMove);
    container.removeEventListener("click", container._onClick);
  }

  container._onTouchStart = (e) => {
    const label = e.target.closest(".value[data-field]");
    if (!label) return;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;

    // Lock these now — DOM may re-render before timer fires
    const fieldLocked = label.dataset.field;
    const labelTextLocked = label.textContent.trim();

    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      longPressJustFired = true;
      openInterpPopup(fieldLocked, profileUsername, labelTextLocked);
    }, 500);
  };

  container._onTouchEnd = () => {
    if (longPressTimer === null) return; // long press already fired, ignore
    clearTimeout(longPressTimer);
    longPressTimer = null;
  };

  container._onTouchCancel = () => {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  };

  container._onTouchMove = (e) => {
    if (longPressTimer === null) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  // Short tap: cycle original(green) → interp1(red) → interp2(red) → original …
  container._onClick = (e) => {
    if (longPressJustFired) {
      longPressJustFired = false;
      return;
    }

    const span = e.target.closest(".value[data-field]");
    if (!span) return;

    const field = span.dataset.field;
    const raw = currentProfileInterpretations[field];
    const interpList = Array.isArray(raw) ? raw : raw ? [raw] : [];
    if (interpList.length === 0) return;

    // Save original text on first tap
    if (!span.dataset.original) span.dataset.original = span.textContent;

    let idx = parseInt(span.dataset.cycleIndex ?? "-1");
    idx = idx + 1 > interpList.length - 1 ? -1 : idx + 1;
    span.dataset.cycleIndex = idx;

    if (idx === -1) {
      span.textContent = span.dataset.original;
      span.classList.remove("label-toggled");
    } else {
      span.textContent = interpList[idx].text;
      span.classList.add("label-toggled");
    }
  };

  container.addEventListener("touchstart", container._onTouchStart, {
    passive: true,
  });
  container.addEventListener("touchend", container._onTouchEnd, {
    passive: true,
  });
  container.addEventListener("touchcancel", container._onTouchCancel, {
    passive: true,
  });
  container.addEventListener("touchmove", container._onTouchMove, {
    passive: true,
  });
  container.addEventListener("click", container._onClick);
  container._labelHandlersBound = true;
}

function openInterpPopup(field, profileUsername, labelText) {
  interpTarget = { field, profileUsername, labelText };
  document.getElementById("interpret-label-name").textContent =
    `"${labelText}" 对你来说意味着什么？`;
  document.getElementById("interpret-input").value = "";
  document.getElementById("interpret-popup").classList.remove("hidden");
  document.getElementById("interpret-input").focus();
}

function closeInterpPopup() {
  document.getElementById("interpret-popup").classList.add("hidden");
  interpTarget = { field: null, profileUsername: null, labelText: null };
}

function submitInterpretation() {
  const text = document.getElementById("interpret-input").value.trim();
  if (!text || !interpTarget.field) return;

  fetch("/interpretation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profileUsername: interpTarget.profileUsername,
      field: interpTarget.field,
      text,
      addedBy: currentUser.username,
    }),
  })
    .then((res) => res.json())
    .then(() => {
      closeInterpPopup();
      const currentUsername = profiles[currentIndex]?.username;
      fetch("/profiles")
        .then((res) => res.json())
        .then((data) => {
          profiles = data.filter((p) => p.username !== currentUser.username);
          const newIndex = profiles.findIndex(
            (p) => p.username === currentUsername,
          );
          if (newIndex >= 0) currentIndex = newIndex;
          showProfile();
        });
    });
}

// send like to server
function like() {
  if (currentIndex < profiles.length) {
    const likedUsername = profiles[currentIndex].username;

    fetch("/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        likerUsername: currentUser.username,
        likerPetName: currentUser.name,
        likedUsername: likedUsername,
      }),
    });
  }
  currentIndex++;
  showProfile();
}

// CheckNotifications (likes)
function checkNotifications() {
  if (!currentUser) return;

  fetch(`/notifications/${currentUser.username}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.likesCount > 0) {
        showToast(`💗 ${data.likesCount} 个兽人喜欢你！`);
      }
    });
}

// ── Message System ──────────────────────────────────────────

let msgPollingInterval = null;
let seenMessageIds = new Set(); // 已经弹过窗的消息 id

function startMessagePolling() {
  // 第一次先静默加载已有消息 id（不弹窗），之后轮询才弹新消息
  if (!currentUser) return;
  fetch(`/messages/${currentUser.username}`)
    .then((res) => res.json())
    .then((msgs) => {
      msgs.forEach((m) => seenMessageIds.add(m.id));
      updateBadge(msgs);
    });

  if (msgPollingInterval) clearInterval(msgPollingInterval);
  msgPollingInterval = setInterval(fetchAndNotify, 15000);
}

function stopMessagePolling() {
  if (msgPollingInterval) clearInterval(msgPollingInterval);
  msgPollingInterval = null;
}

function fetchAndNotify() {
  if (!currentUser) return;
  fetch(`/messages/${currentUser.username}`)
    .then((res) => res.json())
    .then((msgs) => {
      updateBadge(msgs);

      // 找出还没弹过窗的未读新消息
      const newMsgs = msgs.filter((m) => !m.read && !seenMessageIds.has(m.id));
      newMsgs.forEach((m) => {
        seenMessageIds.add(m.id);
        showMessagePopup(m);
      });
    });
}

function fetchUnreadCount() {
  if (!currentUser) return;
  fetch(`/messages/${currentUser.username}`)
    .then((res) => res.json())
    .then((msgs) => updateBadge(msgs));
}

function updateBadge(msgs) {
  const unread = msgs.filter((m) => !m.read).length;
  const badge = document.getElementById("msg-notif-count");
  if (!badge) return;
  if (unread > 0) {
    badge.textContent = unread;
    badge.classList.remove("hidden");
  } else {
    badge.textContent = "";
    badge.classList.add("hidden");
  }
}

// ── 弹窗逻辑 ────────────────────────────────────────────────

let popupQueue = [];
let popupShowing = false;

function showMessagePopup(msg) {
  popupQueue.push(msg);
  if (!popupShowing) showNextPopup();
}

function showNextPopup() {
  if (popupQueue.length === 0) {
    popupShowing = false;
    return;
  }
  popupShowing = true;
  const msg = popupQueue.shift();

  document.getElementById("msg-popup-from").textContent =
    `✉️ 来自 ${msg.fromName || msg.from}`;
  document.getElementById("msg-popup-content").textContent = msg.content;

  const popup = document.getElementById("msg-popup");
  popup.classList.remove("hidden");
  popup.classList.add("popup-slide-in");
}

function closeMessagePopup() {
  const popup = document.getElementById("msg-popup");
  popup.classList.add("hidden");
  popup.classList.remove("popup-slide-in");
  // 如果队列里还有消息，500ms 后显示下一条
  setTimeout(showNextPopup, 500);
}

function openMessages() {
  if (!currentUser) return;
  // 每次打开都重置到收件箱视图
  document.getElementById("convo-view").classList.add("hidden");
  document.getElementById("messages-header").classList.remove("hidden");
  document.getElementById("messages-list").classList.remove("hidden");
  convoTarget = null;

  document.getElementById("messages-panel").classList.remove("hidden");
  loadMessages();
}

function closeMessages() {
  document.getElementById("messages-panel").classList.add("hidden");
  document.getElementById("convo-view").classList.add("hidden");
  document.getElementById("messages-list").classList.remove("hidden");
  convoTarget = null;
  // 等标记已读完成后刷新角标（退出面板回到 swipe 页时角标正确）
  const p = pendingReadPromise || Promise.resolve();
  pendingReadPromise = null;
  p.then(() => fetchUnreadCount());
}

function loadMessages() {
  if (!currentUser) return;

  // 同时取收到的（用于角标）和所有收发（用于预览）
  Promise.all([
    fetch(`/messages/${currentUser.username}`).then((r) => r.json()),
    fetch(`/allMessages/${currentUser.username}`).then((r) => r.json()),
  ]).then(([received, all]) => {
    // 角标只计收到的未读
    updateBadge(received);

    const list = document.getElementById("messages-list");
    if (all.length === 0) {
      list.innerHTML =
        '<p style="text-align:center; opacity:0.6;">暂无消息 / No messages yet</p>';
      return;
    }

    // 按"对方"分组，最新一条无论谁发都算
    const grouped = {};
    all.forEach((m) => {
      const otherUser = m.from === currentUser.username ? m.to : m.from;
      const otherName = m.from === currentUser.username
        ? (m.toName || m.to)
        : (m.fromName || m.from);

      if (!grouped[otherUser]) {
        grouped[otherUser] = { username: otherUser, name: otherName, latest: m, unread: 0 };
      } else if (new Date(m.date) > new Date(grouped[otherUser].latest.date)) {
        grouped[otherUser].latest = m;
      }
    });

    // 未读数单独从 received 统计
    received.forEach((m) => {
      if (!m.read && grouped[m.from]) grouped[m.from].unread++;
    });

    const conversations = Object.values(grouped).sort(
      (a, b) => new Date(b.latest.date) - new Date(a.latest.date)
    );

    list.innerHTML = conversations
      .map((c) => {
        const time = new Date(c.latest.date).toLocaleString("zh-CN", {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const nameSafe = escapeHtml(c.name);
        const userSafe = escapeHtml(c.username);
        const preview = escapeHtml(c.latest.content);
        const unreadBadge = c.unread > 0
          ? `<span class="convo-unread-badge">${c.unread}</span>`
          : "";
        return `
        <div class="msg-item ${c.unread > 0 ? "msg-unread" : "msg-read"}"
             onclick="openConvoView('${userSafe}', '${nameSafe}')">
          <div class="msg-from">${nameSafe}${unreadBadge}</div>
          <div class="msg-content">${preview}</div>
          <div class="msg-time">${time}</div>
        </div>`;
      })
      .join("");
  });
}

function markRead(id, el) {
  fetch(`/messages/${id}/read`, { method: "PUT" })
    .then((res) => res.json())
    .then(() => {
      el.classList.remove("msg-unread");
      el.classList.add("msg-read");
      fetchUnreadCount();
    });
}

function openSendMessage() {
  if (currentIndex >= profiles.length) return;
  const target = profiles[currentIndex];
  openMessages();
  openConvoView(target.username, target.name);
}

function replyTo(username, name) {
  openConvoView(username, name);
}

// ── Conversation thread view ─────────────────────────────────

let convoTarget = null;
let pendingReadPromise = null; // 追踪标记已读的 PUT 请求

function openConvoView(username, name) {
  convoTarget = { username, name };
  document.getElementById("convo-with-name").textContent = name;
  document.getElementById("messages-header").classList.add("hidden");
  document.getElementById("messages-list").classList.add("hidden");
  document.getElementById("convo-view").classList.remove("hidden");
  loadConvo();
}

function closeConvoView() {
  document.getElementById("convo-view").classList.add("hidden");
  document.getElementById("messages-header").classList.remove("hidden");
  document.getElementById("messages-list").classList.remove("hidden");
  convoTarget = null;

  // 等 PUT 请求全部完成后再刷新收件箱和角标
  const p = pendingReadPromise || Promise.resolve();
  pendingReadPromise = null;
  p.then(() => loadMessages());
}

function loadConvo() {
  if (!currentUser || !convoTarget) return;
  fetch(`/conversation/${currentUser.username}/${convoTarget.username}`)
    .then((res) => res.json())
    .then((msgs) => {
      const bubbles = document.getElementById("convo-bubbles");

      // 标记已读，存储 Promise 供 close 时等待
      const unread = msgs.filter((m) => m.to === currentUser.username && !m.read);
      pendingReadPromise = Promise.all(
        unread.map((m) => fetch(`/messages/${m.id}/read`, { method: "PUT" }))
      );

      if (msgs.length === 0) {
        bubbles.innerHTML =
          '<p class="convo-empty">暂无消息 / No messages yet</p>';
        return;
      }

      bubbles.innerHTML = msgs
        .map((m) => {
          const isMine = m.from === currentUser.username;
          const time = new Date(m.date).toLocaleString("zh-CN", {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          return `
            <div class="bubble-row ${isMine ? "bubble-mine" : "bubble-theirs"}">
              <div class="bubble">
                <div class="bubble-text">${escapeHtml(m.content)}</div>
                <div class="bubble-time">${time}</div>
              </div>
            </div>`;
        })
        .join("");

      // 滚到底部
      bubbles.scrollTop = bubbles.scrollHeight;
      fetchUnreadCount();
    });
}

function sendConvoMessage() {
  if (!convoTarget || !currentUser) return;
  const input = document.getElementById("convo-input");
  const content = input.value.trim();
  if (!content) return;

  // 立即追加气泡，不等服务器
  input.value = "";
  appendBubble(content, true);

  fetch("/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from: currentUser.username,
      fromName: currentUser.name,
      to: convoTarget.username,
      content,
    }),
  });
}

function appendBubble(content, isMine) {
  const bubbles = document.getElementById("convo-bubbles");

  // 清除「暂无消息」占位
  const empty = bubbles.querySelector(".convo-empty");
  if (empty) empty.remove();

  const now = new Date().toLocaleString("zh-CN", {
    month: "numeric", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const row = document.createElement("div");
  row.className = `bubble-row ${isMine ? "bubble-mine" : "bubble-theirs"}`;
  row.innerHTML = `
    <div class="bubble">
      <div class="bubble-text">${escapeHtml(content)}</div>
      <div class="bubble-time">${now}</div>
    </div>`;
  bubbles.appendChild(row);
  bubbles.scrollTop = bubbles.scrollHeight;
}


function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Toast 通知 ───────────────────────────────────────────────

function showToast(text) {
  let toast = document.getElementById("toast-notif");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notif";
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add("toast-show");
  setTimeout(() => toast.classList.remove("toast-show"), 3500);
}

function skip() {
  currentIndex++;
  showProfile();
}

function onEditBreedClassChange() {
  const cls = document.getElementById("edit-breedClass").value;
  const select = document.getElementById("edit-breed");
  const wrapper = document.getElementById("edit-breedSpecificWrapper");

  select.innerHTML =
    '<option value="" disabled selected hidden>选择物种 / Select species...</option>';
  (breedData[cls] || []).forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    select.appendChild(opt);
  });
  wrapper.classList.remove("hidden");
}

function goToMyProfile() {
  if (!currentUser) return;
  const u = currentUser;

  document.getElementById("edit-name").value = u.name || "";
  document.getElementById("edit-hukou").value = u.hukou || "";
  document.getElementById("edit-occupation").value = u.occupation || "";
  document.getElementById("edit-dailylife").value = u.dailylife || "";
  document.getElementById("edit-hobby").value = u.hobby || "";

  const setSelect = (id, val) => {
    const el = document.getElementById(id);
    if (val) el.value = val;
  };

  setSelect("edit-gender", u.gender);
  setSelect("edit-orientation", u.orientation);
  setSelect("edit-sterilized", u.sterilized);
  setSelect("edit-edu", u.edu);
  setSelect("edit-income", u.income);

  if (u.mbti && u.mbti.length === 4) {
    setSelect("edit-mbti1", u.mbti[0]);
    setSelect("edit-mbti2", u.mbti[1]);
    setSelect("edit-mbti3", u.mbti[2]);
    setSelect("edit-mbti4", u.mbti[3]);
  }

  // Breed: stored as "大类 · 物种"
  if (u.breed) {
    const parts = u.breed.split(" · ");
    const cls = parts[0];
    const specific = parts[1];
    const classSelect = document.getElementById("edit-breedClass");
    classSelect.value = cls;
    onEditBreedClassChange();
    if (specific) {
      setTimeout(() => {
        document.getElementById("edit-breed").value = specific;
      }, 0);
    }
  }

  document.getElementById("profile-edit").classList.remove("hidden");
}

function closeMyProfile() {
  document.getElementById("profile-edit").classList.add("hidden");
}

function saveMyProfile() {
  const mbti = ["edit-mbti1", "edit-mbti2", "edit-mbti3", "edit-mbti4"]
    .map((id) => document.getElementById(id).value)
    .join("");

  const breedClass = document.getElementById("edit-breedClass").value;
  const breedSpecific = document.getElementById("edit-breed").value;
  const breed =
    breedClass && breedSpecific
      ? `${breedClass} · ${breedSpecific}`
      : breedSpecific || breedClass;

  const updates = {
    name: document.getElementById("edit-name").value,
    breed,
    gender: document.getElementById("edit-gender").value,
    orientation: document.getElementById("edit-orientation").value,
    hukou: document.getElementById("edit-hukou").value,
    sterilized: document.getElementById("edit-sterilized").value,
    mbti,
    dailylife: document.getElementById("edit-dailylife").value,
    hobby: document.getElementById("edit-hobby").value,
    edu: document.getElementById("edit-edu").value,
    occupation: document.getElementById("edit-occupation").value,
    income: document.getElementById("edit-income").value,
  };

  fetch(`/profiles/${currentUser.username}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
    .then((res) => res.json())
    .then((data) => {
      currentUser = data;
      closeMyProfile();
    });
}

// Impression Function
function impression() {
  const impression = document.getElementById("impression").value.trim();
  if (!impression) return;

  // No more pets
  if (currentIndex >= profiles.length) {
    alert("没有更多兽人可以评论了 / No more anthros to comment on");
    return;
  }

  const currentUsername = profiles[currentIndex].username;

  fetch("/impression", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      likedUsername: currentUsername,
      commenterName: currentUser.name,
      impression: impression,
    }),
  })
    .then((res) => res.json())
    .then(() => {
      // 重新fetch最新profile数据，刷新显示
      fetch("/profiles")
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          profiles = data.filter((p) => p.username !== currentUser.username);
          currentIndex = profiles.findIndex(
            (p) => p.username === currentUsername,
          );
          document.getElementById("impression").value = "";
          showProfile(); // 重新渲染当前profile
        });
    });
}

// Avatar Rendering Function
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
      } else if (cell === "text") {
        ctx.fillStyle = "rgb(57, 255, 20)";
        ctx.fillText(
          gridText,
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
        );
      } else if (cell !== null) {
        ctx.fillStyle = "rgb(57, 255, 20)";
        ctx.fillText(
          cell,
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
        );
      }
    }
  }

  return canvas.toDataURL();
}

// 键盘收起时强制页面回弹
document.getElementById("text-input").addEventListener("blur", () => {
  setTimeout(() => {
    //window.scrollTo(0, 0);
  }, 100);
});
