// home.js - Home page interactions
// Redirect if already logged in
window.appReady.then(() => {
  const u = Session.load();
  if (u) {
    // Update nav buttons
    const navRight = document.querySelector(".nav-right");
    if (navRight)
      navRight.innerHTML = `<a href="${u.role === "customer" ? "/customer-dashboard" : "/owner-dashboard"}" class="btn btn-amber btn-sm">Dashboard</a>`;

    // Fix "Write a Review" button — send logged-in users to their dashboard
    const writeBtn = document.getElementById("writeReviewBtn");
    if (writeBtn) {
      if (u.role === "customer") {
        writeBtn.href = "/customer-dashboard#write";
      } else {
        writeBtn.style.display = "none";
      }
    }

    // Fix all "View" buttons on restaurant cards
    document.querySelectorAll(".rest-view-btn").forEach(btn => {
      btn.href = u.role === "customer" ? "/customer-dashboard" : "/owner-dashboard";
    });
  }
});
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
