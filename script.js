/* script.js
 *
 * 1) Carousel de projets
 * 2) Idle (45 s)
 * 3) Toggle “onde prolongée” (PC uniquement)
 */

document.addEventListener("DOMContentLoaded", () => {
  // ─────────────── 1) CAROUSEL ──────────────────
  const host = document.getElementById("grid");
  Promise.all(
    projects.map(p =>
      fetch(`https://api.github.com/repos/${p.repo}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => ({
          ...p,
          title: d ? d.name.replace(/-/g, " ") : p.repo.split("/")[1],
          date:  d ? new Date(d.pushed_at).toLocaleDateString() : ""
        }))
    )
  ).then(list => {
    const html = list.map(p => `
      <div class="slide">
        <img src="${p.cover}" alt="">
        <h2>${p.title}</h2>
        <p>${p.tagline}</p>
        ${p.date?`<small>Dernier commit : ${p.date}</small>`:""}
        <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
      </div>
    `).join("");
    host.innerHTML = `
      <div class="carousel">
        <button id="prev" class="nav-btn">&#10094;</button>
        <div id="slides">${html}</div>
        <button id="next" class="nav-btn">&#10095;</button>
      </div>
    `;
    const slides = document.querySelectorAll(".slide");
    let idx = 0, total = slides.length;
    const container = document.getElementById("slides");
    function show(i){ container.style.transform = \`translateX(-\${i*100}%)\`; idx = i; }
    document.getElementById("next").onclick = ()=> show((idx+1)%total);
    document.getElementById("prev").onclick = ()=> show((idx-1+total)%total);
    show(0);
    setInterval(()=> document.getElementById("next").click(), 7000);
  });

  // ───────── 2) IDLE & 3) ONDE PROLONGÉE ─────────
  const IDLE_MS = 45000;
  let idleTimer = null;
  let tracking = false;
  const toggleBtn = document.getElementById("toggle-tracking");
  const svg = document.getElementById("tracker-svg");
  const isMobile = window.matchMedia("(pointer: coarse)").matches;

  // origine de l’onde
  const origin = {
    x: window.innerWidth  - 20,
    y: window.innerHeight - 20
  };
  let path;             // <path> SVG
  let points = [];      // accumulation des points de l’onde
  const amplitude = 20; // amplitude de la sinusoïde
  const segmentsPerMove = 10; // nb de sous-segments par move

  function goIdle(){
    document.body.classList.add("idle");
  }
  function resetIdle(){
    document.body.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, IDLE_MS);
  }

  function initWave(){
    // crée le path la 1ʳᵉ fois
    if (!path){
      const NS = "http://www.w3.org/2000/svg";
      path = document.createElementNS(NS,"path");
      path.setAttribute("fill","none");
      path.setAttribute("stroke","var(--accent)");
      path.setAttribute("stroke-width","2");
      svg.appendChild(path);
      // init points à l’origine
      points = [ {x: origin.x, y: origin.y} ];
    }
  }

  function extendWave(tx, ty){
    initWave();
    // dernier point connu
    const last = points[points.length-1];
    const dx = tx - last.x;
    const dy = ty - last.y;
    // créer segments intermédiaires
    for(let i=1; i<=segmentsPerMove; i++){
      const t = i/segmentsPerMove;
      const xi = last.x + dx*t;
      const yi = last.y + dy*t + Math.sin((points.length + i) * 0.3) * amplitude;
      points.push({x:xi, y:yi});
    }
    // recréer le d complet
    let d = `M ${points[0].x},${points[0].y}`;
    for(let i=1; i<points.length; i++){
      d += ` L ${points[i].x},${points[i].y}`;
    }
    path.setAttribute("d", d);
  }

  function clearWave(){
    if(path){
      path.remove();
      path = null;
      points = [];
    }
  }

  // toggle bouton
  toggleBtn.addEventListener("click", ()=>{
    if(isMobile) return;
    tracking = !tracking;
    toggleBtn.textContent = tracking
      ? "Désactiver le suivi"
      : "Activer le suivi (PC uniquement)";
    if(!tracking) clearWave();
  });

  function onActivity(e){
    resetIdle();
    if(tracking && !isMobile){
      const ev = e.touches ? e.touches[0] : e;
      extendWave(ev.clientX, ev.clientY);
    }
  }

  window.addEventListener("mousemove", onActivity, {passive:true});
  window.addEventListener("touchstart",  onActivity, {passive:true});

  // start idle timer
  resetIdle();
});
