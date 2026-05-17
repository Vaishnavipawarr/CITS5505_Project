// home.js — Home page only (/): search, category filter, nav/button links

function dashboardHref(role) {
  return role === "customer" ? "/customer-dashboard" : "/owner-dashboard";
}

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

window.appReady.then(() => {
  const u = Session.load();
  if (!u) return;

  const dash = dashboardHref(u.role);

  const navRight = document.querySelector(".nav-right");
  if (navRight) {
    navRight.innerHTML = `<a href="${dash}" class="btn btn-amber btn-sm">Dashboard</a>`;
  }

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

  document.querySelectorAll(".rest-view-btn").forEach((btn) => {
    const restaurantId = btn.dataset.restaurantId;
    btn.href = restaurantViewLink(u, restaurantId);
    btn.textContent = restaurantViewLabel(u, restaurantId);
  });

  const footerAccount = document.getElementById("footerAccount");
  if (footerAccount) {
    footerAccount.innerHTML = `<li><a href="${dash}">Dashboard</a></li>`;
  }
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
