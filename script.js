/****************************************
 *        script.js — CAROUSEL          *
 * MOBILE/PC IDLE EFFECT + SENTINELLE  *
 ****************************************/

const host = document.getElementById("grid");
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// 1) CAROUSEL
Promise.all(
  projects.map(p =>
    fetch(`https://api.github.com/repos/${p.repo}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => ({
        ...p,
        title:  d ? d.name.replace(/-/g, " ") : p.repo.split("/")[1],
        date:   d ? new Date(d.pushed_at).toLocaleDateString() : ""
      }))
  )
).then(list => {
  const slidesHTML = list.map(p => `
    <div class="slide">
      <img src="${p.cover}" alt="">
      <h2>${p.title}</h2>
      <p>${p.tagline}</p>
      ${p.date ? `<small>Dernier commit : ${p.date}</small>` : ""}
      <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
    </div>
  `).join("");
  host.innerHTML = `
    <div class="carousel">
      <button id="prev" class="nav-btn">&#10094;</button>
      <div id="slides">${slidesHTML}</div>
      <button id="next" class="nav-btn">&#10095;</button>
    </div>
  `;
  const slides = document.querySelectorAll(".slide");
  let idx = 0, total = slides.length;
  const container = document.getElementById("slides");
  function show(i){ container.style.transform = `translateX(-${i*100}%)`; idx = i; }
  document.getElementById("next").onclick = ()=> show((idx+1)%total);
  document.getElementById("prev").onclick = ()=> show((idx-1+total)%total);
  show(0);
  setInterval(()=> document.getElementById("next").click(), 7000);
});

// 2) IDLE & EFFECTS
(() => {
  let lastPos = { x:window.innerWidth/2, y:window.innerHeight/2 };
  let idleTimer = null, shootInterval = null;

  // lance l'effet “chute” : ajoute la classe CSS body.idle
  function triggerIdle() {
    document.body.classList.add("idle");
    if (!isTouch && !shootInterval) startSentinel();
  }
  // remet tout en place
  function clearIdle() {
    document.body.classList.remove("idle");
    clearTimeout(idleTimer);
    clearInterval(shootInterval);
    shootInterval = null;
    removeProjectiles();
    idleTimer = setTimeout(triggerIdle, 5000);
  }

  // PROJECTILES uniquement sur desktop
  function startSentinel(){
    const sentinel = document.getElementById("sentinel");
    shootInterval = setInterval(()=>{
      const proj = document.createElement("div");
      proj.className = "projectile";
      document.body.appendChild(proj);
      const r = sentinel.getBoundingClientRect();
      proj.style.left = r.left + r.width/2 - 10 + "px";
      proj.style.top  = r.top  + r.height/2 - 10 + "px";
      const dx = lastPos.x - (r.left + r.width/2);
      const dy = lastPos.y - (r.top  + r.height/2);
      requestAnimationFrame(()=> {
        proj.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      setTimeout(()=> proj.remove(), 600);
    }, 1000);
  }
  function removeProjectiles(){
    document.querySelectorAll(".projectile").forEach(el=>el.remove());
  }

  // écouteurs
  window.addEventListener(isTouch ? "touchstart" : "mousemove", e => {
    if (isTouch) {
      lastPos = { x:e.touches ? e.touches[0].clientX : e.clientX, y:e.touches ? e.touches[0].clientY : e.clientY };
    } else {
      lastPos = { x:e.clientX, y:e.clientY };
    }
    clearIdle();
  });

  // initialise
  idleTimer = setTimeout(triggerIdle, 5000);
})();
