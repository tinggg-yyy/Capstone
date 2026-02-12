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
  const gender = document.getElementById("petGender").value;
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
    name: name,
    breed: breed,
    gender: gender,
    sterilized: sterilized,
    mbti: mbti,
    dailylife: dailylife,
    hobby: hobby,
    avatar: avatarUrl,
  };

  fetch("/profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Saved profile:", data);
    });

  const card = `
  <img src="${avatarUrl}" alt="Pet Avatar" style="width:100px; height:100px;" />
    <h3>${name || "未命名宠物 / Unnamed Pet"}</h3>
    <p>品种 / Breed: ${breed}</p>
    <p style="opacity:0.6; font-size:14px;">
      ${gender} ·  ${sterilized}绝育 ·  MBTI: ${mbti} <br />
      日常生活 / Daily Life: ${dailylife} <br />
      爱好 / Hobby: ${hobby}
    </p>
  `;

  document.getElementById("petCard").innerHTML = card;

  goTo("card");
}
