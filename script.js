const slider = document.getElementById("grid");   // utiliser la même div
let index = 0;

/* -------- utilitaire HTML -------- */
function cardHTML(p, date){
  return `
  <div class="slide">
    <img src="${p.cover || 'https://raw.githubusercontent.com/github/explore/main/topics/github/github.png'}" alt="" />
    <h2>${p.title}</h2>
    <p>${p.tagline}</p>
    ${date ? `<small>Dernier commit : ${date}</small>` : ""}
    <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
  </div>`;
}

/* -------- récupérer données GitHub puis afficher -------- */
Promise.all( projects.map(p =>
  fetch(`https://api.github.com/repos/${p.repo}`)
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      p.title = data ? data.name.replace(/-/g," ") : p.repo.split("/")[1];
      p.date  = data ? new Date(data.pushed_at).toLocaleDateString() : "";
      return p;
    })
) ).then(list => {
    slider.innerHTML = `
      <button id="prev" class="nav-btn">&#10094;</button>
      <div id="slides">${ list.map(p=>cardHTML(p, p.date)).join("") }</div>
      <button id="next" class="nav-btn">&#10095;</button>`;
    initSlider();
});

/* -------- logique diaporama -------- */
function initSlider(){
  const slides = document.querySelectorAll(".slide");
  const total  = slides.length;
  const show = i => {
    slides.forEach((s,idx)=> s.style.display = idx===i ? "flex" : "none");
    index = i;
  };
  document.getElementById("next").onclick = ()=> show((index+1)%total);
  document.getElementById("prev").onclick = ()=> show((index-1+total)%total);
  show(0);                         // premier affichage
  setInterval(()=>document.getElementById("next").click(), 7000); // auto 7 s
}
