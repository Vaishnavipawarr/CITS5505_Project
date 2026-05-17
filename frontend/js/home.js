// home.js — Home page only (/): search, category filter, nav/button links
function writeReviewHref() {
  const user = Session.load();
  if (user?.role === "customer") {
    return "/customer-dashboard?write=1";
  }
  return "/login";
}

window.appReady.then(() => {
  const u = Session.load();
  if (u) {
    const logInBtn = document.querySelector(".nav-right");
    if (logInBtn)
      logInBtn.innerHTML = `<a href="${u.role === "customer" ? "/customer-dashboard" : "/owner-dashboard"}" class="btn btn-amber btn-sm">Dashboard</a>`;
  }
  const writeBtn = document.getElementById("heroWriteReview");
  if (writeBtn) writeBtn.href = writeReviewHref();
});

function goToRestaurantSearch() {
  const q = (document.getElementById("heroSearch")?.value || "").trim();
  window.location.href = q
    ? `/restaurants?q=${encodeURIComponent(q)}`
    : "/restaurants";
}

const heroSearchBtn = document.getElementById("heroSearchBtn");
if (heroSearchBtn) heroSearchBtn.addEventListener("click", goToRestaurantSearch);

const heroSearch = document.getElementById("heroSearch");
if (heroSearch) {
  heroSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goToRestaurantSearch();
    }
  });
}

// Category filter
document.querySelectorAll(".cat-pill").forEach((p) => {
  p.addEventListener("click", function () {
    document
      .querySelectorAll(".cat-pill")
      .forEach((x) => x.classList.remove("active"));
    this.classList.add("active");
    const f = this.dataset.f;
    document.querySelectorAll("#rGrid [data-cat]").forEach((c) => {
      c.style.display = f === "all" || c.dataset.cat === f ? "" : "none";
    });
  });
});
