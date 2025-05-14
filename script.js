/****************************
 *  CAROUSEL  +  SENTINELLE *
 ****************************/

/* ---------- données projets ---------- */
const host = document.getElementById("grid");
const projects = [
  {
    repo: "serolyn/ia-psychologie-2025",
    tagline: "Recherche exploratoire sur les dynamiques émotionnelles homme–IA (rapport PDF).",
    cover: "https://avatars.githubusercontent.com/u/659168?v=4"
  },
  {
    repo: "serolyn/climat-paris-data-viz",
    tagline: "Datavisualisation et analyse de 35 000 lignes météo (Python + figures).",
    cover: "https://avatars.githubusercontent.com/u/659168?v=4"
  }
];

/* ---------- HTML slide ---------- */
const slideHTML = (p) => `
  <div class="slide">
    <img src="${p.cover}" alt="">
    <h2>${p.title}</h2>
    <p>${p.tagline}</p>
    ${p.date ? `<small>Dernier commit : ${p.date}</small>` : ""}
    <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
  </div>`;

/* ---------- construire le carousel ---------- */
Promise.all(
  projects.map(p =>
    fetch("https://api.github.com/repos/" + p.repo)
      .then(r => (r.ok ? r.json() : null))
      .then(d => ({
        ...p,
        title: d ? d.name.replace(/-/g, " ") : p.repo.split("/")[1],
        date: d ? new Date(d.pushed_at).toLocaleDateString() : ""
      }))
  )
).then(list => {
  host.innerHTML = `
    <div class="carousel">
      <button id="prev" class="nav-btn">&#10094;</button>
      <div id="slides">${list.map(slideHTML).join("")}</div>
      <button id="next" class="nav-btn">&#10095;</button>
    </div>`;

  /*  slider logique  */
  const slides = document.querySelectorAll(".slide");
  const total  = slides.length;
  let idx = 0;
  const show = i => {
    document.getElementById("slides").style.transform = `translateX(-${i*100}%)`;
    idx = i;
  };
  document.getElementById("next").onclick = () => show((idx+1)%total);
  document.getElementById("prev").onclick = () => show((idx-1+total)%total);
  setInterval(()=>document.getElementById("next").click(),7000);   // auto‑slide
  show(0);
});

/* ---------- SENTINELLE (tir après 1 s d'inactivité) ---------- */
(()=>{
  const sentinel = document.getElementById("sentinel");
  let lastPos = {x: window.innerWidth/2, y: window.innerHeight/2};
  let timer = null;

  function shoot(x, y){
    const proj = document.createElement("div");
    proj.className = "projectile";
    document.body.appendChild(proj);

    const r = sentinel.getBoundingClientRect();
    proj.style.left = r.left + r.width/2 - 4 + "px";
    proj.style.top  = r.top  + r.height/2 - 4 + "px";

    const dx = x - (r.left + r.width/2);
    const dy = y - (r.top  + r.height/2);
    proj.style.transform = `translate(${dx}px, ${dy}px)`;

    setTimeout(()=>proj.remove(), 400);
  }

  function resetTimer(){
    clearTimeout(timer);
    timer = setTimeout(()=>shoot(lastPos.x, lastPos.y), 1000); // 1 s idle
  }

  window.addEventListener("mousemove", e=>{
    lastPos = {x:e.clientX, y:e.clientY};
    resetTimer();
  });

  resetTimer(); // démarre le chrono sans attendre le premier mouvement
})();
