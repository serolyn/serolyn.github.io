const host = document.getElementById("grid");

/* HTML carte */
const tpl = (p, date) => `
<div class="carousel">
  <button id="prev" class="nav-btn">&#10094;</button>
  <div id="slides">
    <div class="slide">
      <img src="${p.cover || 'https://raw.githubusercontent.com/github/explore/main/topics/github/github.png'}" alt="">
      <h2>${p.title}</h2>
      <p>${p.tagline}</p>
      ${date ? `<small>Dernier commit : ${date}</small>` : ""}
      <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
    </div>
  </div>
  <button id="next" class="nav-btn">&#10095;</button>
</div>`;

/* Récupère data GitHub, injecte HTML */
Promise.all(
  projects.map(p =>
    fetch("https://api.github.com/repos/" + p.repo)
      .then(r => r.ok ? r.json() : null)
      .then(d => ({
        ...p,
        title: d ? d.name.replace(/-/g, " ") : p.repo.split("/")[1],
        date: d ? new Date(d.pushed_at).toLocaleDateString() : ""
      }))
  )
).then(list => {
  // build carrousel multi-slides
  const slidesHTML = list.map(p => `
    <div class="slide">
      <img src="${p.cover || 'https://raw.githubusercontent.com/github/explore/main/topics/github/github.png'}" alt="">
      <h2>${p.title}</h2>
      <p>${p.tagline}</p>
      ${p.date ? `<small>Dernier commit : ${p.date}</small>` : ""}
      <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
    </div>`).join("");

  host.innerHTML = `
    <div class="carousel">
      <button id="prev" class="nav-btn">&#10094;</button>
      <div id="slides">${slidesHTML}</div>
      <button id="next" class="nav-btn">&#10095;</button>
    </div>`;
  initSlider();
});

/* Slider logique */
function initSlider(){
  const slides = document.querySelectorAll(".slide");
  const total = slides.length;
  let idx = 0;
  const show = i => {
    document.getElementById("slides").style.transform = `translateX(-${i*100}%)`;
    idx = i;
  };
  document.getElementById("next").onclick = () => show((idx+1)%total);
  document.getElementById("prev").onclick = () => show((idx-1+total)%total);
  setInterval(()=>document.getElementById("next").click(),7000);
}

/* ---------- Mini‑jeu “sentinelle” ---------- */
(function(){
  const sentinel = document.getElementById("sentinel");
  let lastPos = {x:0, y:0}, idleTimer;

  // crée un projectile et l'anime
  function shoot(targetX, targetY){
    const proj = document.createElement("div");
    proj.className = "projectile";
    document.body.appendChild(proj);
    const rect = sentinel.getBoundingClientRect();
    proj.style.left = rect.left + rect.width/2 - 4 + "px";
    proj.style.top  = rect.top  + rect.height/2 - 4 + "px";
    // calcul vecteur
    const dx = targetX - (rect.left+rect.width/2);
    const dy = targetY - (rect.top+rect.height/2);
    proj.style.transform = `translate(${dx}px,${dy}px)`;
    setTimeout(()=>proj.remove(),400);
  }

  // reset idle timer sur mouvement
  window.addEventListener("mousemove", e=>{
    lastPos = {x:e.clientX, y:e.clientY};
    clearTimeout(idleTimer);
    idleTimer = setTimeout(()=>shoot(lastPos.x, lastPos.y), 5000); // 5 s
  });
})();
