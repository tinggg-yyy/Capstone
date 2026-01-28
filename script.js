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

function createCard() {
  const name = document.getElementById("petName").value;
  const breed = document.getElementById("petBreed").value;
  const nickname = document.getElementById("petNickname").value;

  const card = `
    <h3>${name || "未命名宠物 / Unnamed Pet"}</h3>
    <p>昵称 / Nickname: ${nickname || "未设置 / Not Set"}</p>
    <p>品种 / Breed: ${breed}</p>
    <p style="opacity:0.6; font-size:14px;">
      社交型 · 可配对 · 宠物档案 / Social · Matchable · Pet Profile
    </p>
  `;

  document.getElementById("petCard").innerHTML = card;
  goTo("card");
}
