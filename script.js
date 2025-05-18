/**
 * script.js
 * 1) Carousel de projets (inchangé)
 * 2) Idle (45 s) – UI “tombe”
 * 3) Toggle + onde sinusoïdale de suivi (PC uniquement)
 * 4) Animation Apple : reveal du carousel au scroll
 * 5) Skills scatter random et responsive (ici)
 */
document.addEventListener("DOMContentLoaded", () => {
  // ── 1) CAROUSEL ──────────────────────────────
  const host = document.getElementById("carousel-section");
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
    host.innerHTML = `
      <button id="prev" class="nav-btn">&#10094;</button>
      <div id="slides">
        ${list.map(p => `
          <div class="slide">
            <img src="${p.cover}" alt="">
            <h2>${p.title}</h2>
            <p>${p.tagline}</p>
            ${p.date ? `<small>Dernier commit : ${p.date}</small>` : ""}
            <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
          </div>
        `).join("")}
      </div>
      <button id="next" class="nav-btn">&#10095;</button>
    `;
    const slides    = document.querySelectorAll(".slide");
    let idx         = 0;
    const total     = slides.length;
    const container = document.getElementById("slides");
    function show(i) {
      container.style.transform = `translateX(-${i*100}%)`;
      idx = i;
    }
    document.getElementById("next").onclick = () => show((idx+1)%total);
    document.getElementById("prev").onclick = () => show((idx-1+total)%total);
    show(0);
    setInterval(()=> document.getElementById("next").click(), 7000);
  });

  // ── 2) IDLE ────────────────────────────────────
  const IDLE_MS = 45000;
  let idleTimer;
  function goIdle() {
    document.body.classList.add("idle");
  }
  function resetIdle() {
    document.body.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, IDLE_MS);
  }
  window.addEventListener("mousemove", resetIdle, { passive: true });
  window.addEventListener("touchstart", resetIdle, { passive: true });
  resetIdle();

  // ── 3) TOGGLE + ONDE SINUSOÏDALE ──────────────
  let tracking = false;
  const toggleBtn = document.getElementById("toggle-tracking");
  const svg       = document.getElementById("tracker-svg");
  const isMobile  = window.matchMedia("(pointer: coarse)").matches;
  const origin = {
    x: window.innerWidth  - 20,
    y: window.innerHeight - 20
  };
  let path = null;
  let points = [];
  function initWave() {
    if (path) return;
    const NS = "http://www.w3.org/2000/svg";
    path = document.createElementNS(NS, "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "var(--accent)");
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);
    points = [{ x: origin.x, y: origin.y }];
  }
  function extendWave(tx, ty) {
    initWave();
    const last = points[points.length - 1];
    const dx   = tx - last.x;
    const dy   = ty - last.y;
    const SEGMENTS = 10;
    const AMP      = 20;
    for (let i = 1; i <= SEGMENTS; i++) {
      const t  = i / SEGMENTS;
      const xi = last.x + dx * t;
      const yi = last.y + dy * t + Math.sin((points.length + i) * 0.3) * AMP;
      points.push({ x: xi, y: yi });
    }
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x},${points[i].y}`;
    }
    path.setAttribute("d", d);
  }
  function clearWave() {
    if (path) {
      path.remove();
      path = null;
      points = [];
    }
  }
  toggleBtn.addEventListener("click", () => {
    if (isMobile) return;
    tracking = !tracking;
    toggleBtn.textContent = tracking
      ? "Désactiver le suivi"
      : "Activer le suivi (PC uniquement)";
    if (!tracking) clearWave();
  });
  window.addEventListener("mousemove", e => {
    if (tracking && !isMobile) {
      extendWave(e.clientX, e.clientY);
    }
  }, { passive: true });
  window.addEventListener("touchstart", resetIdle, { passive: true });

  // ── 4) ANIMATION APPLE REVEAL DU CARROUSEL ──────
  const reveal = document.querySelector('.carousel-reveal');
  if (reveal) {
    function handleScroll() {
      const rect = reveal.getBoundingClientRect();
      if (rect.top < window.innerHeight - 120) {
        reveal.classList.add('visible');
        window.removeEventListener('scroll', handleScroll);
      }
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();
  }

  // ── 5) SKILLS SCATTER RANDOM RESPONSIVE ──────────────
  // Paramétrage des skills
  const skills = [
    { img: "mita.jpg", name: "Python" },
    { img: "mita.jpg", name: "SQL" },
    { img: "mita.jpg", name: "FL Studio" },
    { img: "mita.jpg", name: "Pandas" },
    { img: "mita.jpg", name: "LaTeX" },
    { img: "mita.jpg", name: "Linux" }
  ];
  // Pour éviter qu'ils se chevauchent, on génère des positions "random mais réparties"
 // ... (garde tout le code déjà en place avant)
// Remplace juste la fonction "generateScatterPositions" et ce qui s'y rapporte :
function generateScatterPositions(n, w, h, isMobile) {
  if (isMobile) {
    // Découpe le container en n "cases" verticales bien réparties
    const stepY = h / (n + 1);
    let usedX = [];
    return Array.from({length: n}).map((_, i) => {
      // Pour l’effet random, on randomise X à chaque fois (en évitant de coller les autres)
      let x, collision, tries = 0;
      do {
        x = Math.round(w * (0.2 + 0.6 * Math.random())); // entre 20% et 80% de largeur
        collision = usedX.some(xu => Math.abs(xu - x) < 60);
        tries++;
      } while (collision && tries < 8);
      usedX.push(x);
      // Y = stepY * (i+1) => espaces égaux
      return {
        left: `${x}px`,
        top: `${Math.round(stepY * (i + 1))}px`,
        translateX: "0",
        rotate: Math.round(Math.random()*14-7)
      };
    });
  }
  // Desktop : scatter XY dans l'aire (simple)
  const positions = [];
  const used = [];
  for (let i=0; i<n; ++i) {
    let tries = 0;
    let ok = false, x, y, angle;
    while (!ok && tries < 100) {
      x = Math.round(40 + Math.random()*(w-100));
      y = Math.round(20 + Math.random()*(h-80));
      ok = used.every(pos => Math.hypot(pos.x-x,pos.y-y)>88);
      angle = Math.round(Math.random()*18-9);
      tries++;
    }
    used.push({x,y});
    positions.push({left:`${x}px`,top:`${y}px`,rotate:angle,translateX:"0"});
  }
  return positions;
}

  }
  function renderSkillsScatter() {
    const scatter = document.getElementById('skills-scatter');
    scatter.innerHTML = "";
    const isMobile = window.innerWidth < 650;
    const width = scatter.offsetWidth || (isMobile ? window.innerWidth : 700);
    const height = scatter.offsetHeight || (isMobile ? 360 : 220);
    const pos = generateScatterPositions(skills.length, width, height, isMobile);
    skills.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = "skill";
      div.style.left = pos[i].left;
      div.style.top  = pos[i].top;
      div.style.transform = 
        `translateX(${pos[i].translateX}) scale(0.95) translateY(80px) rotateZ(${pos[i].rotate}deg)`;
      div.innerHTML = `<img src="${s.img}" alt="${s.name}"><span>${s.name}</span>`;
      scatter.appendChild(div);
    });
    // Effet d'apparition animée
    const skillEls = scatter.querySelectorAll('.skill');
    function showScatterSkills() {
      skillEls.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 60) {
          setTimeout(() => el.classList.add('visible'), i * 180);
        }
      });
    }
    window.addEventListener("scroll", showScatterSkills);
    showScatterSkills();
  }
  // Premier rendu + au resize
  renderSkillsScatter();
  window.addEventListener("resize", () => setTimeout(renderSkillsScatter, 100));
});
