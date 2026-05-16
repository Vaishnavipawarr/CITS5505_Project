// customer-dashboard.js
let currentUser = null;
let currentRestaurants = [];
let pendingDeleteId = null;

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

window.appReady.then(initCustomerDashboard);

async function initCustomerDashboard() {
  await window.appReady;
  const user = requireAuth("customer");
  if (!user) return;
  currentUser = user;
  if (window.location.hash === "#write") {
    openWriteModal();
    history.replaceState(null, "", window.location.pathname);
  }

  document.getElementById("navName").textContent = user.name;
  document.getElementById("sbName").textContent = user.name;
  document.getElementById("headName").textContent = user.name.split(" ")[0];
  if (user.profilePic) {
    document.getElementById("sbAvatar").src = user.profilePic;
    document.getElementById("navAvatar").src = user.profilePic;
  }
  const restSelect = document.getElementById("modalRest");
  const filterRest = document.getElementById("filterRest");
  currentRestaurants = await getRestaurants();
  if (restSelect) {
    restSelect.innerHTML = '<option value="">Select restaurant</option>';
    currentRestaurants.forEach((r) => {
      restSelect.innerHTML += `<option value="${r.id}">${r.name}</option>`;
    });
  }
  if (filterRest) {
    filterRest.innerHTML = '<option value="all">All restaurants</option>';
    currentRestaurants.forEach((r) => {
      filterRest.innerHTML += `<option value="${r.id}">${r.name}</option>`;
    });
  }

  initStars("spWrap");
  renderMyReviews();
}

function showTab(id, linkEl) {
  document
    .querySelectorAll(".tab-pane")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById("tab-" + id).classList.add("active");
  if (linkEl && linkEl.classList.contains("tab-btn"))
    linkEl.classList.add("active");
  else
    document.getElementById("tbtn-" + id) &&
      document.getElementById("tbtn-" + id).classList.add("active");
  document
    .querySelectorAll(".sb-nav a")
    .forEach((a) => a.classList.remove("active"));
  if (id === "my-reviews")
    document.querySelectorAll(".sb-nav a")[0].classList.add("active");
  else if (id === "browse")
    document.querySelectorAll(".sb-nav a")[1].classList.add("active");
  if (id === "browse") renderBrowse();
}

async function renderMyReviews() {
  if (!currentUser) return;
  const reviews = await getReviews({ customer_id: currentUser.id });
  const all = await getReviews();
  const el = document.getElementById("myRevList");
  const countEl = document.getElementById("myRevCount");
  const totalEl = document.getElementById("totalRevCount");
  const replyEl = document.getElementById("replyCount");

  if (countEl) countEl.textContent = reviews.length;
  if (totalEl) totalEl.textContent = all.length;
  if (replyEl)
    replyEl.textContent = reviews.filter((r) => r.owner_reply).length;

  if (!reviews.length) {
    if (el) {
      el.innerHTML = `<div class="empty"><div class="icon">✍️</div><h3>No reviews yet</h3><p>Share your first dining experience!</p><button class="btn btn-amber mt-3" onclick="openWriteModal()"><i class="fas fa-plus"></i> Write Your First Review</button></div>`;
    }
    return;
  }

  if (el) {
    el.innerHTML = reviews
      .map(
        (r) => `
      <div class="rev-card">
        <div class="rev-rest-row">
          <img class="rev-rest-thumb" src="${escapeHtml(r.restaurant_img)}" alt=""/>
          <div>
            <div class="rev-rest-name">${escapeHtml(r.restaurant_name)}</div>
            <div class="rev-rest-meta">${escapeHtml(r.date)}</div>
          </div>
          <div class="ms-auto d-flex gap-2">
            <button class="btn btn-ghost btn-sm" onclick="openEditModal(${r.id})"><i class="fas fa-pen"></i> Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteReview(${r.id})"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <div class="rev-stars-row">${renderStars(r.rating)}<span style="font-size:.8rem;font-weight:600;color:var(--amber)">${r.rating}.0</span></div>
        <div class="rev-body">${escapeHtml(r.text)}</div>
        ${(r.tags || []).length ? `<div class="rev-chips">${r.tags.map((t) => `<span class="rev-chip">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
        ${r.owner_reply ? `<div class="owner-reply"><div class="lbl">✦ Owner's Reply · ${escapeHtml(r.owner_reply_date || "")}</div><p>${escapeHtml(r.owner_reply)}</p></div>` : ""}
      </div>
    `,
      )
      .join("");
  }
}

async function renderBrowse() {
  const search = (
    document.getElementById("searchInput")?.value || ""
  ).toLowerCase();
  const rFilter = document.getElementById("filterRating")?.value || "all";
  const restFilter = document.getElementById("filterRest")?.value || "all";
  let reviews = await getReviews();

  if (search)
    reviews = reviews.filter(
      (r) =>
        r.restaurant_name.toLowerCase().includes(search) ||
        r.text.toLowerCase().includes(search) ||
        r.customer_name.toLowerCase().includes(search),
    );

  if (rFilter !== "all")
    reviews = reviews.filter((r) => r.rating >= parseInt(rFilter));
  if (restFilter !== "all")
    reviews = reviews.filter((r) => r.restaurant_id === restFilter);

  const el = document.getElementById("browseList");
  if (!reviews.length) {
    if (el) {
      el.innerHTML = `<div class="empty"><div class="icon">🔍</div><h3>No reviews found</h3><p>Try adjusting your filters.</p></div>`;
    }
    return;
  }

  if (el) {
    el.innerHTML = reviews
      .map(
        (r) => `
      <div class="pub-rev">
        <div class="d-flex align-items-center gap-3 mb-3">
          <img class="pub-av" src="${escapeHtml(r.customer_avatar)}" alt=""/>
          <div class="flex-1">
            <div style="font-weight:600;font-size:.88rem;color:var(--cream)">${escapeHtml(r.customer_name)}</div>
            <div style="font-size:.72rem;color:var(--muted)">Reviewed ${escapeHtml(r.restaurant_name)} · ${escapeHtml(r.date)}</div>
          </div>
          <div class="ms-auto">${renderStars(r.rating)}</div>
        </div>
        <div class="rev-rest-tag">
          <img src="${escapeHtml(r.restaurant_img)}" alt=""/>
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

function openWriteModal() {
  const editIdInput = document.getElementById("editId");
  if (editIdInput) editIdInput.value = "";
  document.getElementById("modalTitle").textContent = "Write a Review";
  document.getElementById("submitLabel").textContent = "Post Review";
  document.getElementById("modalText").value = "";
  document.getElementById("modalRest").value = "";
  const sp = document.getElementById("spWrap");
  sp.dataset.v = 0;
  sp.querySelectorAll(".sp").forEach((s) => s.classList.remove("on"));
  openModal("writeModal");
}

async function openEditModal(id) {
  const reviews = await getReviews({ customer_id: currentUser?.id });
  const rev = reviews.find((r) => r.id === id);
  if (!rev) return;
  document.getElementById("editId").value = id;
  document.getElementById("modalTitle").textContent = "Edit Your Review";
  document.getElementById("submitLabel").textContent = "Save Changes";
  document.getElementById("modalText").value = rev.text;
  document.getElementById("modalRest").value = rev.restaurant_id;
  const sp = document.getElementById("spWrap");
  sp.dataset.v = rev.rating;
  sp.querySelectorAll(".sp").forEach((s, i) =>
    s.classList.toggle("on", i < rev.rating),
  );
  openModal("writeModal");
}

async function submitReview() {
  const editId = document.getElementById("editId").value;
  const restId = document.getElementById("modalRest").value;
  const text = document.getElementById("modalText").value.trim();
  const rating = parseInt(document.getElementById("spWrap").dataset.v || 0);

  if (!restId) {
    toast("Please select a restaurant", "⚠️");
    return;
  }
  if (!rating) {
    toast("Please select a rating", "⚠️");
    return;
  }
  if (!text) {
    toast("Please write your review", "⚠️");
    return;
  }

  const rest = currentRestaurants.find((r) => r.id === restId);
  if (!rest) {
    toast("Restaurant not found", "⚠️");
    return;
  }

  if (editId) {
    const result = await updateReview(parseInt(editId), {
      restaurant_id: restId,
      rating,
      text,
      tags: [],
    });
    if (!result.success) {
      toast(result.message || "Unable to update review", "⚠️");
      return;
    }
    toast("Review updated!", "✓");
  } else {
    const result = await createReview({
      restaurantId: restId,
      rating,
      text,
      tags: [],
    });
    if (!result.success) {
      toast(result.message || "Unable to post review", "⚠️");
      return;
    }
    toast("Review posted!", "🌟");
  }

  closeModal("writeModal");
  renderMyReviews();
}

function deleteReview(id) {
  pendingDeleteId = id;
  openModal("deleteModal");
}

async function confirmDelete() {
  if (!pendingDeleteId) return;
  const success = await deleteReview(pendingDeleteId);
  if (!success) {
    toast("Failed to delete review", "⚠️");
    return;
  }
  pendingDeleteId = null;
  closeModal("deleteModal");
  toast("Review deleted", "🗑️");
  renderMyReviews();
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
      document.getElementById("sbAvatar").src = data.profilePic;
      document.getElementById("navAvatar").src = data.profilePic;
      if (data.profilePic && data.profilePic.startsWith("/uploads/")) {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        stored.profilePic = data.profilePic;
        localStorage.setItem("user", JSON.stringify(stored));
      }
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
