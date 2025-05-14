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

/* Sentinelle : tire si souris idle 5 s */
(()=>{const s=document.getElementById("sentinel");let pos={x:0,y:0},t;
  const shoot=(x,y)=>{const p=document.createElement("div");p.className="projectile";
    document.body.appendChild(p);
    const r=s.getBoundingClientRect();
    p.style.left=r.left+r.width/2-4+"px";p.style.top=r.top+r.height/2-4+"px";
    p.style.transform=`translate(${x-(r.left+r.width/2)}px,${y-(r.top+r.height/2)}px)`;setTimeout(()=>p.remove(),400)};
  window.addEventListener("mousemove",e=>{pos={x:e.clientX,y:e.clientY};clearTimeout(t);t=setTimeout(()=>shoot(pos.x,pos.y),5000);});
})();
