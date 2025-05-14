/**
 * script.js
 * 1) Carousel
 * 2) Idle (45s)
 * 3) Toggle + onde prolongée
 */
document.addEventListener("DOMContentLoaded", () => {
  // ── 1) CAROUSEL ─────────────────────────
  const host = document.getElementById("grid");
  Promise.all(
    projects.map(p =>
      fetch(`https://api.github.com/repos/${p.repo}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => ({
          ...p,
          title: d ? d.name.replace(/-/g," ") : p.repo.split("/")[1],
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
    function show(i){
      container.style.transform = \`translateX(-\${i*100}%)\`;
      idx = i;
    }
    document.getElementById("next").onclick = ()=> show((idx+1)%total);
    document.getElementById("prev").onclick = ()=> show((idx-1+total)%total);
    show(0);
    setInterval(()=> document.getElementById("next").click(), 7000);
  });

  // ── 2) IDLE & 3) ONDE PROLONGÉE ─────────
  const IDLE_MS = 45000;
  let idleTimer = null;
  let tracking = false;
  const toggleBtn = document.getElementById("toggle-tracking");
  const svg       = document.getElementById("tracker-svg");
  const isMobile  = window.matchMedia("(pointer: coarse)").matches;

  // origine
  const origin = {
    x: window.innerWidth  - 20,
    y: window.innerHeight - 20
  };

  // store the svg <path> and points
  let path = null;
  let points = [];

  /** passe en mode idle */
  function goIdle(){
    document.body.classList.add("idle");
  }
  /** reset idle */
  function resetIdle(){
    document.body.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, IDLE_MS);
  }
  /** initialise la path */
  function initPath(){
    if(path) return;
    const NS = "http://www.w3.org/2000/svg";
    path = document.createElementNS(NS, "path");
    path.setAttribute("stroke", "var(--accent)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    svg.appendChild(path);
    points = [ {x:origin.x, y:origin.y} ];
  }
  /** étend l’onde vers (tx,ty) */
  function extendWave(tx, ty){
    initPath();
    const last = points[points.length - 1];
    const dx = tx - last.x, dy = ty - last.y;
    const seg = 10, amp = 20;
    for(let i=1;i<=seg;i++){
      const t = i/seg;
      const xi = last.x + dx*t;
      const yi = last.y + dy*t + Math.sin((points.length + i)*0.3)*amp;
      points.push({x:xi,y:yi});
    }
    let d = `M ${points[0].x},${points[0].y}`;
    for(let i=1;i<points.length;i++){
      d += ` L ${points[i].x},${points[i].y}`;
    }
    path.setAttribute("d", d);
  }
  /** supprime la wave */
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

  // activité utilisateur
  function onActivity(e){
    resetIdle();
    if(tracking && !isMobile){
      const ev = e.touches ? e.touches[0] : e;
      extendWave(ev.clientX, ev.clientY);
    }
  }
  window.addEventListener("mousemove", onActivity, {passive:true});
  window.addEventListener("touchstart", onActivity, {passive:true});

  // lance le timer idle
  resetIdle();
});
