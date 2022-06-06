function initSearch(rawIndex, catsById, catProfileBaseUrl, catImgBaseUrl) {
  const index = lunr.Index.load(rawIndex);

  const searchInputEl = document.getElementById("search-field");
  const searchResultsEl = document.getElementById("search-results");

  const existingQuery = searchInputEl.value;
  if (existingQuery) {
    const matchingCats = search(existingQuery, index, catsById);
    renderCats(matchingCats, searchResultsEl, catProfileBaseUrl, catImgBaseUrl);
  } else {
    // for serendipity!
    renderCats(pickRandom(catsById, 20), searchResultsEl, catProfileBaseUrl, catImgBaseUrl);
  }

  searchInputEl.addEventListener("input", debounce((e) => {
    if (e.target.value) {
      searchResultsEl.innerHTML = "";
      const matchingCats = search(e.target.value, index, catsById);
      renderCats(matchingCats, searchResultsEl, catProfileBaseUrl, catImgBaseUrl);
    }
  }), 500);
}

function search(query, index, catsById) {
  const results = index.search(query);
  const ids = results.map(r => r.ref);
  return ids.map(id => catsById[id]);
}

// should prob be replaced by safer/saner template system
function renderCats(cats, parentEl, catProfileBaseUrl, catImgBaseUrl) {
  if (cats.length == 0) {
    parentEl.innerHTML = "CATS are nowhere to be found...";
    return;
  }

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

    const catUrl = `${catProfileBaseUrl}/${id}`;

    const catDiv = document.createElement("div");
    catDiv.setAttribute("style", "display: flex;");

    const photo = document.createElement("div");
    photo.setAttribute("style", "min-width: 150px; margin-top: 8px;");
    photo.innerHTML = `
      <a href="${catUrl}">
        <img src="${catImgBaseUrl}/${id}.png" style="border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.4);"></img>
      </a>
    `
    catDiv.appendChild(photo);

    const profileDiv = document.createElement("div");
    const head = document.createElement("h3");
    head.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: baseline;">
      <div>#${id} <a style="color: rgb(223, 179, 128)" href="${catUrl}">${name}</a></div>
      <div style="font-size: 0.8rem; color: rgb(223, 179, 128)">
        (<a
          href="https://opensea.io/assets/ethereum/0x29b4d6c1d5ebedb62e5913f1c47b6b0421f1ec38/${id}"
          target="_blank"
          rel="noopener noreferrer"
          style="text-decoration: underline;"
        >opensea</a>)
      </div>
    </div>
    `
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
