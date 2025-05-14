/****************************************
 *        script.js — VERSION FIX       *
 *   SENTINELLE (PC) + IDLE EFFECT      *
 ****************************************/

// --- CAROUSEL (inchangé) ---
const host = document.getElementById("grid");
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
  const slides = list.map(p => `
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
      <div id="slides">${slides}</div>
      <button id="next" class="nav-btn">&#10095;</button>
    </div>
  `;
  const slideEls = document.querySelectorAll(".slide");
  let idx = 0, total = slideEls.length;
  const container = document.getElementById("slides");
  function show(i) {
    container.style.transform = \`translateX(-\${i * 100}%)\`;
    idx = i;
  }
  document.getElementById("next").onclick = () => show((idx + 1) % total);
  document.getElementById("prev").onclick = () => show((idx - 1 + total) % total);
  show(0);
  setInterval(() => document.getElementById("next").click(), 7000);
});

// --- SENTINELLE + IDLE EFFECT ---
(() => {
  const sentinel = document.getElementById("sentinel");
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let lastPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let idleTimer = null;
  let shootInterval = null;
  const IDLE_DELAY = 45000; // 45 secondes

  function fire() {
    const proj = document.createElement("div");
    proj.className = "projectile";
    document.body.appendChild(proj);
    const r = sentinel.getBoundingClientRect();
    const sx = r.left + r.width / 2;
    const sy = r.top + r.height / 2;
    proj.style.left = \`\${sx - 15}px\`;
    proj.style.top = \`\${sy - 15}px\`;
    const dx = lastPos.x - sx;
    const dy = lastPos.y - sy;
    requestAnimationFrame(() => {
      proj.style.transform = \`translate(\${dx}px,\${dy}px)\`;
    });
    setTimeout(() => proj.remove(), 600);
  }

  function startSentinel() {
    if (isTouch || shootInterval) return;
    fire();
    shootInterval = setInterval(fire, 1000);
  }

  function stopSentinel() {
    clearInterval(shootInterval);
    shootInterval = null;
    document.querySelectorAll(".projectile").forEach(e => e.remove());
  }

  function goIdle() {
    document.body.classList.add("idle");
    startSentinel();
  }

  function resetIdle() {
    document.body.classList.remove("idle");
    stopSentinel();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, IDLE_DELAY);
  }

  function onActivity(e) {
    lastPos = e.touches
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
    resetIdle();
  }

  window.addEventListener("pointermove", onActivity);
  window.addEventListener("pointerdown", onActivity);

  // initialise
  idleTimer = setTimeout(goIdle, IDLE_DELAY);
})();
