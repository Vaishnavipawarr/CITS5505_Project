// reviews.js — Public review list with search and rating filters
function writeReviewHref() {
  const user = Session.load();
  if (user?.role === "customer") {
    return "/customer-dashboard?write=1";
  }
  if (user?.role === "owner") {
    return "/owner-dashboard";
  }
  return "/login";
}

function applyInitialRestaurantFromUrl() {
  const restaurantId = new URLSearchParams(window.location.search).get(
    "restaurant",
  );
  if (!restaurantId) return;
  const filterRest = document.getElementById("filterRest");
  if (!filterRest) return;
  const hasOption = [...filterRest.options].some(
    (o) => o.value === restaurantId,
  );
  if (hasOption) filterRest.value = restaurantId;
}

window.appReady.then(async () => {
  const user = Session.load();
  if (user) {
    const navRight = document.getElementById("navRight");
    if (navRight) {
      navRight.innerHTML = `<a href="${user.role === "customer" ? "/customer-dashboard" : "/owner-dashboard"}" class="btn btn-amber btn-sm">Dashboard</a>`;
    }
  }

  const writeBtn = document.getElementById("reviewsWriteBtn");
  if (writeBtn) {
    writeBtn.href = writeReviewHref();
    if (user?.role === "owner") {
      writeBtn.innerHTML = '<i class="fas fa-store"></i> My Dashboard';
    }
  }

  const restaurants = await getRestaurants();
  const fr = document.getElementById("filterRest");
  if (fr) {
    fr.innerHTML = `<option value="all">All restaurants</option>`;
    restaurants.forEach((r) => {
      fr.innerHTML += `<option value="${r.id}">${r.name}</option>`;
    });
  }

  applyInitialRestaurantFromUrl();
  renderRevs();
});

async function renderRevs() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const rFilter = document.getElementById("filterRating").value;
  const restFilt = document.getElementById("filterRest").value;
  let reviews = await getReviews();

  if (search)
    reviews = reviews.filter(
      (r) =>
        r.customer_name.toLowerCase().includes(search) ||
        r.restaurant_name.toLowerCase().includes(search) ||
        r.text.toLowerCase().includes(search),
    );
  if (rFilter !== "all")
    reviews = reviews.filter((r) => r.rating >= parseInt(rFilter));
  if (restFilt !== "all")
    reviews = reviews.filter((r) => r.restaurant_id === restFilt);

  const el = document.getElementById("revList");
  if (!reviews.length) {
    if (el) {
      el.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--muted)"><i class="fas fa-search" style="font-size:2rem;margin-bottom:.8rem;opacity:.4;display:block;"></i>No reviews match your search.</div>`;
    }
    return;
  }

  if (el) {
    el.innerHTML = reviews
      .map(
        (r) => `
      <div class="rev-card">
        <div class="d-flex align-items-center gap-3 mb-3">
          <img class="reviewer-av" src="${r.customer_avatar}" alt=""/>
          <div class="flex-1">
            <div style="font-weight:600;font-size:.9rem;color:var(--cream)">${escapeHtml(r.customer_name)}</div>
            <div style="font-size:.72rem;color:var(--muted)">${escapeHtml(r.date)}</div>
          </div>
          <div class="ms-auto"><span class="stars">${"★".repeat(r.rating)}<span class="dim">${"★".repeat(5 - r.rating)}</span></span></div>
        </div>
        <div class="rev-rest-tag">
          <img src="${r.restaurant_img}" alt=""/>
          ${escapeHtml(r.restaurant_name)}
        </div>
        <p class="rev-body">${escapeHtml(r.text)}</p>
        ${(r.tags || []).length ? `<div style="margin-bottom:.8rem">${r.tags.map((t) => `<span class="rev-chip">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
        ${r.owner_reply ? `<div class="owner-reply"><div class="lbl">✦ Owner's Reply</div><p>${escapeHtml(r.owner_reply)}</p></div>` : ""}
      </div>
    `,
      )
      .join("");
  }
}

const reviewInput = document.getElementById("searchInput");
if (reviewInput) reviewInput.addEventListener("input", renderRevs);
const reviewFilter = document.getElementById("filterRating");
if (reviewFilter) reviewFilter.addEventListener("change", renderRevs);
const reviewRestaurantFilter = document.getElementById("filterRest");
if (reviewRestaurantFilter)
  reviewRestaurantFilter.addEventListener("change", renderRevs);
