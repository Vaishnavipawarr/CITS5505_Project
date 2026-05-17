// restaurants.js — Loads restaurants from API, filters, builds card grid
let currentUser = null;

window.appReady.then(() => {
  currentUser = Session.load();
  if (currentUser) {
    const navRight = document.getElementById("navRight");
    if (navRight) {
      navRight.innerHTML = `<a href="${currentUser.role === "customer" ? "/customer-dashboard" : "/owner-dashboard"}" class="btn btn-amber btn-sm">Dashboard</a>`;
    }
  }
  applyInitialSearchFromUrl();
  renderCards();
});

const restaurantImages = {
  r1: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
  r2: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&q=80",
  r3: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&q=80",
  r4: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
  r5: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80",
  r6: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80",
};

const restaurantDescriptions = {
  r1: "Wood-fired excellence. Every cut tells a story of fire and patience.",
  r2: "Three-generation recipes with spices flown weekly from Kerala.",
  r3: "72-hour tonkotsu broth — the best ramen outside Japan.",
  r4: "Authentic Neapolitan pies baked in a 900°F wood-fired oven.",
  r5: "Craft burgers with locally sourced beef. Truffle fries are legendary.",
  r6: "Daily catch from local harbours. Pristine, minimalist preparations.",
};

function reviewLinkFor(restaurantId) {
  if (currentUser?.role === "customer") {
    return `/customer-dashboard?tab=browse&restaurant=${encodeURIComponent(restaurantId)}`;
  }
  return "/login";
}

async function renderCards() {
  await window.appReady;
  const search = document.getElementById("searchInput").value.toLowerCase();
  const cuisine = document.getElementById("filterCuisine").value;
  const price = document.getElementById("filterPrice").value;

  const restaurants = await getRestaurants();
  const filtered = restaurants.filter((r) => {
    const matchS =
      !search ||
      r.name.toLowerCase().includes(search) ||
      (r.cuisine || "").toLowerCase().includes(search) ||
      (r.city || "").toLowerCase().includes(search);
    const matchC = cuisine === "all" || r.cuisine === cuisine;
    const matchP = price === "all" || r.price === price;
    return matchS && matchC && matchP;
  });

  const grid = document.getElementById("cardGrid");
  const noR = document.getElementById("noResults");
  if (!filtered.length) {
    if (grid) grid.innerHTML = "";
    if (noR) noR.style.display = "";
    return;
  }
  if (noR) noR.style.display = "none";

  if (grid) {
    grid.innerHTML = filtered
      .map(
        (r) => `
      <div class="col-lg-4 col-md-6">
        <div class="r-card">
          <div class="img-wrap">
            <img src="${r.image || restaurantImages[r.id] || restaurantImages.r1}" alt="${r.name}"/>
            <span class="badge badge-amber" style="position:absolute;top:.7rem;left:.7rem;">${r.cuisine || ""}</span>
          </div>
          <div class="body">
            <div class="rname">${r.name}</div>
            <div class="rmeta">
              <span class="stars">${"★".repeat(Math.floor(r.rating || 0))}<span class="dim">${"★".repeat(5 - Math.floor(r.rating || 0))}</span></span>
              <span class="dot"></span><span>${(r.rating || 0).toFixed(1)} · ${r.review_count || 0} reviews</span>
              <span class="dot"></span><span>${r.price || ""}</span>
            </div>
            <p class="rdesc">${r.bio || restaurantDescriptions[r.id] || ""}</p>
            <div class="rfoot">
              <span style="font-size:.75rem;color:var(--muted);">${r.city || ""}</span>
              <a href="${reviewLinkFor(r.id)}" class="btn btn-amber btn-sm">View &amp; Review</a>
            </div>
          </div>
        </div>
      </div>
    `,
      )
      .join("");
  }
}

function applyInitialSearchFromUrl() {
  const q = new URLSearchParams(window.location.search).get("q");
  if (!q) return;
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = q;
}

const filterInputs = [
  document.getElementById("searchInput"),
  document.getElementById("filterCuisine"),
  document.getElementById("filterPrice"),
];
filterInputs.forEach((input) => {
  if (input) input.addEventListener("input", renderCards);
});
