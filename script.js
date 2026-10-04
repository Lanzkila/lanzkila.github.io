(() => {
  "use strict";

  const root = document.documentElement;
  const projects = Array.isArray(window.KIRIN_PROJECTS) ? window.KIRIN_PROJECTS : [];
  const grid = document.getElementById("projectGrid");
  const tabs = document.getElementById("filterTabs");
  const searchInput = document.getElementById("projectSearch");
  const searchToggle = document.getElementById("searchToggle");
  const searchStrip = document.getElementById("searchStrip");
  const themeToggle = document.getElementById("themeToggle");
  const emptyState = document.getElementById("emptyState");
  const year = document.getElementById("year");

  let activeCategory = "All";
  let query = "";

  function iconArrow() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h11v11M19 5 5 19"/></svg>';
  }

  function getInitialTheme() {
    const saved = localStorage.getItem("lanzkila-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem("lanzkila-theme", theme);
  }

  function renderTabs() {
    const categories = ["All"].concat(Array.from(new Set(projects.map(p => p.category))));
    tabs.innerHTML = "";
    categories.forEach(category => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-tab" + (category === activeCategory ? " active" : "");
      button.textContent = category;
      button.addEventListener("click", () => {
        activeCategory = category;
        renderTabs();
        renderProjects();
      });
      tabs.appendChild(button);
    });
  }

  function projectMatches(project) {
    const categoryOk = activeCategory === "All" || project.category === activeCategory;
    const haystack = [project.name, project.category, project.description].concat(project.tags || []).join(" ").toLowerCase();
    const queryOk = !query || haystack.includes(query);
    return categoryOk && queryOk;
  }

  function makeCard(project) {
    const article = document.createElement("article");
    article.className = "project-card";
    article.style.setProperty("--project-color", project.color || "#8b5cf6");

    const tags = (project.tags || []).map(tag => '<span class="tag">' + tag + '</span>').join("");
    article.innerHTML =
      '<div class="card-top">' +
        '<span class="card-icon">' + project.short + '</span>' +
        '<span class="card-type">' + project.category + '</span>' +
      '</div>' +
      '<h3>' + project.name + '</h3>' +
      '<p>' + project.description + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '<div class="card-links">' +
        '<a class="card-link primary-link" href="' + project.primary + '" target="_blank" rel="noreferrer">' + project.primaryLabel + iconArrow() + '</a>' +
        '<a class="card-link" href="' + project.source + '" target="_blank" rel="noreferrer">Source' + iconArrow() + '</a>' +
      '</div>';
    return article;
  }

  function renderProjects() {
    grid.innerHTML = "";
    const shown = projects.filter(projectMatches);
    shown.forEach(project => grid.appendChild(makeCard(project)));
    emptyState.hidden = shown.length !== 0;
  }

  function openSearch() {
    searchStrip.hidden = false;
    requestAnimationFrame(() => searchInput.focus());
  }

  function closeSearch() {
    searchStrip.hidden = true;
    query = "";
    searchInput.value = "";
    renderProjects();
  }

  themeToggle.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  searchToggle.addEventListener("click", () => {
    if (searchStrip.hidden) openSearch();
    else closeSearch();
  });

  searchInput.addEventListener("input", event => {
    query = event.target.value.trim().toLowerCase();
    renderProjects();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !searchStrip.hidden) closeSearch();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
  });

  setTheme(getInitialTheme());
  renderTabs();
  renderProjects();
  year.textContent = new Date().getFullYear();
})();