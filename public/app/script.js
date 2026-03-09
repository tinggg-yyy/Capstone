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

// Create Profile & Swipe Function
let profiles = [];
let currentIndex = 0;
function createCard() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("petName").value;
  const breed = document.getElementById("petBreed").value;
  const gender = document.getElementById("petGender").value;
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
  const avatarUrl = generateAvatarUrl();
  console.log("Avatar URL from createCard:", avatarUrl);

  let profile = {
    username: username,
    password: password,
    name: name,
    breed: breed,
    gender: gender,
    age: age,
    hukou: hukou,
    sterilized: sterilized,
    mbti: mbti,
    dailylife: dailylife,
    hobby: hobby,
    avatar: avatarUrl,
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
    });

  // create the card content
  const card = `
  <img src="${avatarUrl}" alt="Pet Avatar" style="width:100px; height:100px;" />
    <h3>${name || "未命名宠物 / Unnamed Pet"}</h3>
    <p>品种 / Breed: ${breed}</p>
    <p style="opacity:0.6; font-size:14px;">
      ${gender} · ${age}岁 · 户口${hukou}· ${sterilized}绝育 ·  MBTI: ${mbti} <br />
      日常生活 / Daily Life: ${dailylife} <br />
      爱好 / Hobby: ${hobby}
    </p>
  `;

  document.getElementById("petCard").innerHTML = card;

  goTo("card");
}

function createSwipeCard() {
  // currentUser 为空时阻止继续
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

      currentIndex = 0;
      showProfile();
      goTo("swipe-page");
    });
}

function showProfile() {
  const container = document.getElementById("swipe-container");
  container.innerHTML = "";

  if (currentIndex >= profiles.length) {
    container.innerHTML = "<h1>没有更多宠物了 🐾</h1>";
    return;
  }

  const profile = profiles[currentIndex];

  container.innerHTML = `
<div class="card">

  <div class="avatar-box">
    <img src="${profile.avatar}" class="avatar">
  </div>

  <div class="section">
    <span class="label">名字</span>
    <span class="value big">${profile.name}</span>
  </div>

  <div class="grid-3">
    <div class="cell">
      <span class="label">性别</span>
      <span class="value">${profile.gender}</span>
    </div>
    <div class="cell">
      <span class="label">年龄</span>
      <span class="value">${profile.age}</span>
    </div>
    <div class="cell">
      <span class="label">户籍</span>
      <span class="value">${profile.hukou}</span>
    </div>
  </div>

  <div class="section">
    <span class="label">MBTI</span>
    <span class="value big">${profile.mbti}</span>
  </div>

  <div class="grid-2">
    <div class="cell">
      <span class="label">婚育状况</span>
      <span class="value">${profile.sterilized}</span>
    </div>
    <div class="cell">
      <span class="label">交友目的</span>
      <span class="value">${profile.goal}</span>
    </div>
  </div>

  <div class="grid-2">
    <div class="cell">
      <span class="label">兴趣爱好</span>
      <span class="value">${profile.hobby}</span>
    </div>
    <div class="cell">
      <span class="label">日常生活</span>
      <span class="value">${profile.dailylife}</span>
    </div>
  </div>

        <div class="section">
        <span class="label">被喜欢</span>
        <span class="value big"
          >${profile.likes ? profile.likes.length : 0} 💗</span
        >
      </div>

</div>
  `;
  console.log("Showing profile:", profile);
  console.log("Current index:", currentIndex);
}

// like 时发送到服务器
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

// 进入 app 时检查通知
function checkNotifications() {
  if (!currentUser) return;

  fetch(`/notifications/${currentUser.username}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.likesCount > 0) {
        alert(
          `💗 你有 ${data.likesCount} 个宠物喜欢你！\n来自: ${data.likedBy.join(", ")}`,
        );
      }
    });
}

function skip() {
  currentIndex++;
  showProfile();
}

// Impression Function
function impression() {
  const impression = document.getElementById("impression").value.trim();
  if (!impression) return;

  // 已经划完了，没有当前 profile
  if (currentIndex >= profiles.length) {
    alert("没有更多宠物可以评论了 / No more pets to comment on");
    return;
  }

  fetch("/impression", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      likedUsername: profiles[currentIndex].username,
      commenterName: currentUser.name,
      impression: impression,
    }),
  }).then(() => {
    document.getElementById("impression").value = ""; // 清空输入框
  });
}
