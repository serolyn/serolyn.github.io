const grid = document.getElementById("grid");

// utilitaire fetch dépôts publics
function fetchRepo(full){
  return fetch(`https://api.github.com/repos/${full}`).then(r=>r.json());
}

projects.forEach(async p=>{
  try{
    const data = await fetchRepo(p.repo);
    const html = `
      <article class="card">
        <h2>${data.name.replace(/-/g," ")}</h2>
        <p>${p.tagline}</p>
        <small>Dernier commit : ${new Date(data.pushed_at).toLocaleDateString()}</small>
        <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
      </article>`;
    grid.insertAdjacentHTML("beforeend", html);
  } catch(e){
    console.error("API GitHub error",e);
  }
});
