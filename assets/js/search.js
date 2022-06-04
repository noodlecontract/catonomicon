function initSearch(rawIndex, catsById, catProfileBaseUrl, catImgBaseUrl) {
  const index = lunr.Index.load(rawIndex);

  const searchInputEl = document.getElementById("search-field");
  const searchResultsEl = document.getElementById("search-results");

  renderCats(pickRandom(catsById, 20), searchResultsEl, catProfileBaseUrl, catImgBaseUrl);

  searchInputEl.addEventListener("input", debounce((e) => {
    if (e.target.value) {
      searchResultsEl.innerHTML = "";
      const results = index.search(e.target.value);
      const ids = results.map(r => r.ref);
      const matchingCats = ids.map(id => catsById[id]);
      if (matchingCats.length > 0) {
        renderCats(matchingCats, searchResultsEl, catProfileBaseUrl, catImgBaseUrl);
      } else {
        searchResultsEl.innerHTML = "CATS are nowhere to be found..."
      }
    }
  }), 500);
}

function renderCats(cats, parentEl, catProfileBaseUrl, catImgBaseUrl) {
  cats.forEach((cat) => {
    const {
      id: id,
      n: name,
      d: description,
      t: archetype,
      ss: sun,
      sm: moon,
      sr: rising,
    } = cat;

    const catDiv = document.createElement("div");
    catDiv.setAttribute("style", "display: flex;");

    const photo = document.createElement("div");
    photo.setAttribute("style", "min-width: 150px; margin-top: 8px;");
    photo.innerHTML = `<img src="${catImgBaseUrl}/${id}.png" style="border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.4);"></img>`
    catDiv.appendChild(photo);

    const profileDiv = document.createElement("div");
    const head = document.createElement("h3");
    const catUrl = `${catProfileBaseUrl}/${id}`;
    head.innerHTML = `#${id} <a style="color: rgb(223, 179, 128)" href="${catUrl}">${name}</a>`
    profileDiv.appendChild(head);
    catDiv.appendChild(profileDiv);

    const chart = document.createElement("div");
    chart.setAttribute("class", "text-gray");
    chart.textContent = `${archetype} | ☼ ${sun}, ☾ ${moon}, ↑ ${rising}`;
    profileDiv.appendChild(chart);

    const desc = document.createElement("div");
    desc.setAttribute("class", "text-gray");
    desc.textContent = description;
    profileDiv.appendChild(desc);

    parentEl.appendChild(catDiv);
  });
}

function pickRandom(catsById, n) {
  const totalCats = Object.keys(catsById).length;
  const ids = [...Array(n).keys()].map((_) => {
    return Math.floor(Math.random() * totalCats + 1);
  });

  const cats = [...new Set(ids)].map((id) => catsById[`${id}`]).filter(c => !!c);

  return cats;
}

// https://www.joshwcomeau.com/snippets/javascript/debounce/
function debounce (callback, wait) {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}
