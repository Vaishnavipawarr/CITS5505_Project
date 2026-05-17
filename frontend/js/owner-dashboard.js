// owner-dashboard.js
let currentUser = null;
let ownerRestId = null;

// Setup Global Fetch Interceptor for CSRF Protection
const originalFetch = window.fetch;
window.fetch = async function (resource, config) {
  if (
    config &&
    ["POST", "PUT", "DELETE", "PATCH"].includes(
      (config.method || "").toUpperCase(),
    )
  ) {
    if (!window.csrfToken) {
      try {
        const res = await originalFetch("/api/csrf-token");
        const data = await res.json();
        window.csrfToken = data.csrfToken;
      } catch (e) {
        console.error("Failed to fetch CSRF token");
      }
    }
    config.headers = config.headers || {};
    config.headers["X-CSRFToken"] = window.csrfToken;
  }
  return originalFetch(resource, config);
};

window.appReady.then(initOwnerDashboard);

async function initOwnerDashboard() {
  await window.appReady;
  const user = requireAuth("owner");
  if (!user) return;
  currentUser = user;
  ownerRestId = user.restaurantId;

  const restaurants = await getRestaurants();
  const ownerRest = restaurants.find((r) => r.id === ownerRestId) ||
    restaurants[0] || { name: "Your Restaurant" };

  if (user.profilePic) {
    const ownerAv = document.getElementById("ownerAvatar");
    if (ownerAv) ownerAv.src = user.profilePic;
  }

  const bioEl = document.getElementById("restBio");
  if (bioEl)
    bioEl.textContent =
      ownerRest.bio || "No bio yet. Click Edit Bio to add one.";
  const cuisine = ownerRest.cuisine || "Restaurant";
  const city = ownerRest.city || "Location not set";
  document.getElementById("sbRestType").textContent = `${cuisine} · ${city}`;
  document.getElementById("navName").textContent = ownerRest.name;
  document.getElementById("sbRestName").textContent = ownerRest.name;
  document.getElementById("ownerHead").innerHTML =
    `${ownerRest.name} <em>Dashboard</em>`;
  document.getElementById("ownerSubhead").textContent =
    `Manage and respond to customer reviews for ${ownerRest.name}.`;

  loadKPIs();
}

function showTab(id, el) {
  document
    .querySelectorAll(".tab-pane")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".sb-nav a")
    .forEach((a) => a.classList.remove("active"));
  document.getElementById("tab-" + id).classList.add("active");
  if (el && el.classList.contains("tab-btn")) el.classList.add("active");
  document.getElementById("tbtn-" + id)?.classList.add("active");
  if (id === "overview")
    document.querySelectorAll(".sb-nav a")[0].classList.add("active");
  if (id === "reviews") {
    document.querySelectorAll(".sb-nav a")[1].classList.add("active");
    renderReviews();
  }
}

async function getMyReviews() {
  if (!ownerRestId) return [];
  return await getReviews({ restaurant_id: ownerRestId });
}

async function loadKPIs() {
  const reviews = await getMyReviews();
  const total = reviews.length;
  const avg = total
    ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
    : "0";
  const replied = reviews.filter((r) => r.owner_reply).length;
  const pending = total - replied;
  document.getElementById("kpiTotal").textContent = total;
  document.getElementById("kpiAvg").textContent = avg;
  document.getElementById("kpiReplied").textContent = replied;
  document.getElementById("kpiPending").textContent = pending;

  document.getElementById("ovAvg").textContent = avg;
  document.getElementById("ovCount").textContent =
    `based on ${total} review${total !== 1 ? "s" : ""}`;
  const full = Math.round(+avg);
  document.getElementById("ovStars").textContent =
    "★".repeat(full) + "☆".repeat(5 - full);

  const bars = document.getElementById("ovBars");
  if (bars) {
    bars.innerHTML = [5, 4, 3, 2, 1]
      .map((n) => {
        const cnt = reviews.filter((r) => r.rating === n).length;
        const pct = total ? Math.round((cnt / total) * 100) : 0;
        return `<div class="rb-row"><span style="min-width:22px">${n}★</span><div class="rb-track"><div class="rb-fill" style="width:${pct}%"></div></div><span style="min-width:24px;font-size:.74rem;color:var(--ot-mu)">${cnt}</span></div>`;
      })
      .join("");
  }

  const tagCount = {};
  reviews.forEach((r) =>
    (r.tags || []).forEach((t) => (tagCount[t] = (tagCount[t] || 0) + 1)),
  );
  const sorted = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxT = sorted[0]?.[1] || 1;
  const tagBars = document.getElementById("tagBars");
  if (tagBars) {
    tagBars.innerHTML = sorted.length
      ? sorted
          .map(
            ([t, c]) =>
              `<div class="rb-row"><span style="min-width:110px;font-size:.78rem">${t}</span><div class="rb-track"><div class="rb-fill" style="width:${Math.round((c / maxT) * 100)}%"></div></div><span style="font-size:.72rem;color:var(--ot-mu)">${c}</span></div>`,
          )
          .join("")
      : '<p style="font-size:.82rem;color:var(--ot-mu);">No tags yet.</p>';
  }
}

async function renderReviews() {
  const search = (
    document.getElementById("revSearch")?.value || ""
  ).toLowerCase();
  const rFilter = document.getElementById("revFilterRating")?.value || "all";
  const stFilter = document.getElementById("revFilterStatus")?.value || "all";

  let reviews = await getMyReviews();
  if (search)
    reviews = reviews.filter(
      (r) =>
        r.customer_name.toLowerCase().includes(search) ||
        r.text.toLowerCase().includes(search),
    );
  if (rFilter !== "all")
    reviews = reviews.filter((r) =>
      rFilter === "1" ? r.rating <= 2 : r.rating === parseInt(rFilter),
    );
  if (stFilter === "pending") reviews = reviews.filter((r) => !r.owner_reply);
  if (stFilter === "replied") reviews = reviews.filter((r) => !!r.owner_reply);

  const el = document.getElementById("revList");
  if (!reviews.length) {
    if (el) {
      el.innerHTML = `<div class="empty"><div class="icon">💬</div><h3>No reviews found</h3><p>Adjust your filters or wait for customers to leave reviews.</p></div>`;
    }
    return;
  }

  if (el) {
    el.innerHTML = reviews
      .map(
        (r) => `
      <div class="orev ${r.owner_reply ? "has-reply" : "needs-reply"}" id="orev-${r.id}">
        <div class="d-flex align-items-center gap-3 mb-2">
          <img class="reviewer-av" src="${escapeHtml(r.customer_avatar)}" alt=""/>
          <div class="flex-1">
            <div class="reviewer-name">${escapeHtml(r.customer_name)}</div>
            <div class="reviewer-meta">${escapeHtml(r.date)}</div>
          </div>
          <div class="ms-auto d-flex align-items-center gap-2">
            ${renderStars(r.rating)}
            <span class="status-pill ${r.owner_reply ? "status-replied" : "status-pending"}">${r.owner_reply ? "✓ Replied" : "⏳ Pending"}</span>
          </div>
        </div>
        <p class="rev-body">${escapeHtml(r.text)}</p>
        ${(r.tags || []).length ? `<div style="margin-bottom:.85rem">${r.tags.map((t) => `<span class="rev-tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}

        ${
          r.owner_reply
            ? `
          <div class="reply-display" id="reply-display-${r.id}">
            <div class="lbl">
              <span>✦ Your Reply · ${escapeHtml(r.owner_reply_date || "")}</span>
              <button class="btn btn-teal-outline btn-sm" style="font-size:.7rem;padding:.2rem .6rem;" onclick="editReply(${r.id})">Edit</button>
            </div>
            <p id="reply-text-${r.id}">${escapeHtml(r.owner_reply)}</p>
          </div>
        `
            : ""
        }

        <div class="reply-compose ${r.owner_reply ? "" : "open"}" id="compose-${r.id}">
          <textarea id="replyInput-${r.id}" placeholder="Write a professional, helpful reply to this review…">${escapeHtml(r.owner_reply || "")}</textarea>
          <div class="d-flex gap-2 mt-2">
            ${r.owner_reply ? `<button class="btn btn-ghost-ot btn-sm" onclick="cancelEdit(${r.id})">Cancel</button>` : ""}
            <button class="btn btn-teal btn-sm ms-auto" onclick="submitReply(${r.id})"><i class="fas fa-reply"></i> ${r.owner_reply ? "Update Reply" : "Post Reply"}</button>
          </div>
        </div>

        ${
          !r.owner_reply
            ? `
          <div class="d-flex mt-2" id="reply-btn-row-${r.id}">
            <!-- compose already open for no-reply cards -->
          </div>
        `
            : !document
                  .getElementById(`compose-${r.id}`)
                  ?.classList.contains("open")
              ? `
          <div class="mt-2" id="reply-btn-row-${r.id}"></div>
        `
              : ""
        }
      </div>
    `,
      )
      .join("");
  }
}

async function submitReply(id) {
  const text = document.getElementById(`replyInput-${id}`).value.trim();
  if (!text) {
    toast("Please write a reply first", "⚠️");
    return;
  }

  const response = await replyReview(id, text);
  if (!response.success) {
    toast(response.message || "Unable to post reply", "⚠️");
    return;
  }

  toast("Reply posted!", "✓");
  await loadKPIs();
  renderReviews();
}

function editReply(id) {
  const comp = document.getElementById(`compose-${id}`);
  const disp = document.getElementById(`reply-display-${id}`);
  if (comp) comp.classList.add("open");
  if (disp) disp.style.display = "none";
}

function cancelEdit(id) {
  const comp = document.getElementById(`compose-${id}`);
  const disp = document.getElementById(`reply-display-${id}`);
  if (comp) comp.classList.remove("open");
  if (disp) disp.style.display = "";
}

function filterPending() {
  showTab("reviews", document.getElementById("tbtn-reviews"));
  const statusFilter = document.getElementById("revFilterStatus");
  if (statusFilter) statusFilter.value = "pending";
  renderReviews();
}

function showAvatarUrlInput() {
  document.getElementById("avatarOptionsMode").style.display = "none";
  document.getElementById("avatarUrlMode").style.display = "block";
  document.getElementById("avatarUrlInput").value = "";
  document.getElementById("avatarUrlInput").focus();
}

function hideAvatarUrlInput() {
  document.getElementById("avatarOptionsMode").style.display = "block";
  document.getElementById("avatarUrlMode").style.display = "none";
}

async function submitAvatarUrl() {
  const url = document.getElementById("avatarUrlInput").value.trim();
  if (!url) {
    toast("Please enter a valid URL", "⚠️");
    return;
  }

  try {
    const res = await fetch("/api/auth/upload-avatar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ avatar_url: url }),
    });

    if (!res.ok) {
      toast("Update failed — server error", "❌");
      return;
    }

    const data = await res.json();
    if (data.success) {
      const ownerAv = document.getElementById("ownerAvatar");
      if (ownerAv) ownerAv.src = data.profilePic;
      if (currentUser) currentUser.profilePic = data.profilePic;
      toast("Avatar updated!", "✅");
      closeModal("avatarModal");
    } else {
      toast(data.message || "Failed to update avatar", "❌");
    }
  } catch (err) {
    console.error(err);
    toast("An error occurred", "❌");
  }
}

async function uploadAvatar(input) {
  const file = input.files[0];
  if (!file) return;

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    toast("Only JPG, PNG, GIF or WEBP images are allowed", "❌");
    input.value = "";
    return;
  }

  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    toast("Image must be smaller than 2MB", "❌");
    input.value = "";
    return;
  }

  const form = new FormData();
  form.append("avatar", file);

  try {
    const res = await fetch("/api/auth/upload-avatar", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      toast("Upload failed — server error", "❌");
      return;
    }

    const data = await res.json();
    if (data.success) {
      const ownerAv = document.getElementById("ownerAvatar");
      if (ownerAv) ownerAv.src = data.profilePic;

      if (data.profilePic && data.profilePic.startsWith("/uploads/")) {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        stored.profilePic = data.profilePic;
        localStorage.setItem("user", JSON.stringify(stored));
      }

      // Update Session object in memory
      if (currentUser) currentUser.profilePic = data.profilePic;

      toast("Profile picture updated!", "✅");
    } else {
      toast(data.message || "Upload failed", "❌");
    }
  } catch (err) {
    toast("Upload failed — please check your connection", "❌");
  } finally {
    input.value = "";
  }
}

function openBioModal() {
  const bioEl = document.getElementById("restBio");
  const bioInput = document.getElementById("bioInput");
  if (bioInput && bioEl) {
    bioInput.value =
      bioEl.textContent === "No bio yet. Click Edit Bio to add one."
        ? ""
        : bioEl.textContent;
  }
  openModal("bioModal");
}

async function saveBio() {
  const bioText = document.getElementById("bioInput").value.trim();
  if (!bioText) {
    toast("Bio cannot be empty", "⚠️");
    return;
  }

  try {
    const res = await fetch(`/api/restaurants/${ownerRestId}/bio`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ bio: bioText }),
    });

    if (!res.ok) {
      toast("Failed to save bio", "❌");
      return;
    }

    const data = await res.json();
    if (data.success) {
      document.getElementById("restBio").textContent = bioText;
      toast("Bio updated successfully!", "✅");
      closeModal("bioModal");
    } else {
      toast(data.message || "Failed to save bio", "❌");
    }
  } catch (err) {
    toast("Error saving bio — check your connection", "❌");
  }
}

function openPriceModal() {
  openModal("priceModal");
}

async function submitPrice() {
  const newPrice = document.getElementById("priceSelect").value;

  if (!currentUser || !ownerRestId) {
    toast("Error: No restaurant linked to this owner", "⚠️");
    return;
  }

  try {
    const res = await fetch(`/api/restaurants/${ownerRestId}/price`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ price: newPrice }),
    });

    const data = await res.json();
    if (data.success) {
      toast("Budget updated successfully!", "✅");
      closeModal("priceModal");
    } else {
      toast(data.message || "Failed to update budget", "❌");
    }
  } catch (err) {
    console.error(err);
    toast("An error occurred. Please try again.", "❌");
  }
}
