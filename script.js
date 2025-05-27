/**
 * script.js
 * 1) Carousel de projets (inchangé)
 * 2) Idle (45 s) – UI “tombe”
 * 3) Toggle + onde sinusoïdale de suivi (PC uniquement)
 * 4) Animation Apple : reveal du carousel au scroll
 * 5) Skills scatter random et responsive vraiment propre (mobile + desktop)
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
    { img: "python.png", name: "Python" },
    { img: "sql.jpg", name: "SQL" },
    { img: "flstudio.[nh", name: "FL Studio" },
    { img: "panda.png", name: "Pandas" },
    { img: "latex.jpg", name: "LaTeX" },
    { img: "linux.jpg", name: "Linux" }
  ];

  function generateScatterPositions(n, w, h, isMobile) {
    if (isMobile) {
      // Découpe en cases verticales espacées
      const stepY = h / (n + 1);
      // Pour garder de l'espace sur le côté, X random mais borné (entre 12% et 80%)
      return Array.from({length: n}).map((_, i) => {
        const xMin = Math.round(w * 0.13);
        const xMax = Math.round(w * 0.80);
        const x = Math.round(xMin + (xMax - xMin) * Math.random());
        const y = Math.round(stepY * (i + 1));
        const rotate = Math.round(Math.random() * 16 - 8);
        return {
          left: `${x}px`,
          top: `${y}px`,
          translateX: "0",
          rotate
        };
      });
    }
    // Desktop scatter XY avec check
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

  function renderSkillsScatter() {
    let scatter = document.getElementById('skills-scatter');
    // Si pas déjà là, créer dynamiquement
    if (!scatter) {
      const container = document.querySelector('.skills-scatter');
      scatter = document.createElement('div');
      scatter.id = 'skills-scatter';
      scatter.style.position = "relative";
      scatter.style.width = "100%";
      scatter.style.height = container ? container.style.height : "250px";
      container && container.appendChild(scatter);
    }
    scatter.innerHTML = "";
    const isMobile = window.innerWidth < 650;
    // Largeur réelle (évite bug iOS)
    let width = scatter.offsetWidth;
    if (!width) width = isMobile ? window.innerWidth - 30 : 700;
    const height = isMobile ? 380 : 220;
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
    // Apparition animée cascade
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
  window.addEventListener("resize", () => setTimeout(renderSkillsScatter, 130));
});
