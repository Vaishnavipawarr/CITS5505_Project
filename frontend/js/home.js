// home.js — Home page only (/): search, category filter, nav/button links

// Returns the correct dashboard URL based on user role
function dashboardHref(role) {
  return role === "customer" ? "/customer-dashboard" : "/owner-dashboard";
}

// Returns the correct href for a restaurant button based on user role and ownership
function restaurantViewLink(user, restaurantId) {
  if (!user) return "/login";
  if (user.role === "customer") {
    return restaurantId
      ? `/reviews?restaurant=${encodeURIComponent(restaurantId)}`
      : "/reviews";
  }
  if (user.role === "owner") {
    if (restaurantId && user.restaurantId === restaurantId) {
      return "/owner-dashboard";
    }
    if (restaurantId) {
      return `/reviews?restaurant=${encodeURIComponent(restaurantId)}`;
    }
    return dashboardHref("owner");
  }
  return "/login";
}

// Returns the button label text based on user role and restaurant ownership
function restaurantViewLabel(user, restaurantId) {
  if (user?.role === "owner") {
    return restaurantId && user.restaurantId === restaurantId
      ? "Manage"
      : "View Reviews";
  }
  if (user?.role === "customer") {
    return "View Reviews";
  }
  return "View";
}

// Runs after app is ready — updates nav, buttons and links for logged-in users
window.appReady.then(() => {
  const u = Session.load();
  if (!u) return;

  const dash = dashboardHref(u.role);

  // Update nav bar to show dashboard link
  const navRight = document.querySelector(".nav-right");
  if (navRight) {
    navRight.innerHTML = `<a href="${dash}" class="btn btn-amber btn-sm">Dashboard</a>`;
  }

  // Update write review button based on role
  const writeBtn = document.getElementById("writeReviewBtn");
  if (writeBtn) {
    writeBtn.style.display = "";
    if (u.role === "customer") {
      writeBtn.href = "/customer-dashboard?write=1";
      writeBtn.innerHTML =
        '<i class="fas fa-pen-nib"></i> Write a Review';
    } else {
      writeBtn.href = dash;
      writeBtn.innerHTML = '<i class="fas fa-store"></i> My Dashboard';
    }
  }

  // Update each restaurant view button with correct link and label
  document.querySelectorAll(".rest-view-btn").forEach((btn) => {
    const restaurantId = btn.dataset.restaurantId;
    btn.href = restaurantViewLink(u, restaurantId);
    btn.textContent = restaurantViewLabel(u, restaurantId);
  });

  // Update footer account link
  const footerAccount = document.getElementById("footerAccount");
  if (footerAccount) {
    footerAccount.innerHTML = `<li><a href="${dash}">Dashboard</a></li>`;
  }
});

// Redirects to restaurants page, passing search query if present
function goToRestaurantSearch() {
  const q = (document.getElementById("heroSearch")?.value || "").trim();
  window.location.href = q
    ? `/restaurants?q=${encodeURIComponent(q)}`
    : "/restaurants";
}

// Search button click handler
const heroSearchBtn = document.getElementById("heroSearchBtn");
if (heroSearchBtn) heroSearchBtn.addEventListener("click", goToRestaurantSearch);

// Search input enter key handler
const heroSearch = document.getElementById("heroSearch");
if (heroSearch) {
  heroSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goToRestaurantSearch();
    }
  });
}

// Category filter — shows/hides restaurant cards based on selected cuisine
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
