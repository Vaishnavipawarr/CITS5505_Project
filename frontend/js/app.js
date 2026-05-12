/* ════════════════════════════════════
   FORK & FLAME — app.js
   ════════════════════════════════════ */

/* ── LOADER ── */
window.addEventListener("load", () => {
  const l = document.getElementById("loader");
  if (l) setTimeout(() => l.classList.add("done"), 700);
});

/* ── NAVBAR SCROLL ── */
(function () {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const fn = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", fn, { passive: true });
  fn();
})();

/* ── SCROLL REVEAL ── */
(function () {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
  );
  els.forEach((el) => io.observe(el));
})();

/* ── TOAST ── */
function toast(msg, icon) {
  icon = icon || "✓";
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.innerHTML = `<span style="color:var(--amber-light)">${icon}</span> ${msg}`;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 3000);
}

/* ── MODAL ── */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.remove("open");
    document.body.style.overflow = "";
  }
}
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-bg")) {
    e.target.classList.remove("open");
    document.body.style.overflow = "";
  }
});

/* ── COUNTER ANIMATION ── */
function animCount(el, to, dur) {
  dur = dur || 1400;
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent =
      Math.round(ease * to).toLocaleString() + (el.dataset.suffix || "");
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
(function () {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animCount(e.target, +e.target.dataset.count);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 },
  );
  counters.forEach((c) => io.observe(c));
})();

/* ── HERO PARALLAX ── */
(function () {
  const bg = document.querySelector(".hero-bg");
  if (!bg || window.innerWidth < 768) return;
  window.addEventListener(
    "scroll",
    () => {
      bg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    },
    { passive: true },
  );
})();

/* ══════════════════════════════════════
   SESSION  (server-backed)
   ══════════════════════════════════════ */

const Session = {
  user: null,
  save(user) {
    this.user = user;
  },
  load() {
    return this.user;
  },
  clear() {
    this.user = null;
  },
  get role() {
    return this.user ? this.user.role : null;
  },
  get name() {
    return this.user ? this.user.name : "";
  },
  async refresh() {
    try {
      const response = await fetch("/api/auth/status", {
        credentials: "same-origin",
      });
      const data = await response.json();
      if (data.authenticated) {
        this.user = data.user;
        return this.user;
      }
    } catch (error) {
      console.error("Auth refresh failed:", error);
    }
    this.user = null;
    return null;
  },
};

window.appReady = Session.refresh();

async function getRestaurants() {
  try {
    const response = await fetch("/api/restaurants");
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Failed to load restaurants:", error);
    return [];
  }
}

async function getReviews(query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const url =
    "/api/reviews" + (params.toString() ? `?${params.toString()}` : "");
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Failed to load reviews:", error);
    return [];
  }
}

async function createReview(review) {
  const response = await fetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(review),
  });
  return await response.json();
}

async function updateReview(id, payload) {
  const response = await fetch(`/api/reviews/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  return await response.json();
}

async function deleteReview(id) {
  const response = await fetch(`/api/reviews/${id}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  return response.ok;
}

async function replyReview(id, ownerReply) {
  const response = await fetch(`/api/reviews/${id}/reply`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ ownerReply }),
  });
  return await response.json();
}

/* ── STAR PICKER ── */
function initStars(wrapId, hiddenId) {
  const wrap = document.getElementById(wrapId);
  const input = document.getElementById(hiddenId);
  if (!wrap) return;
  const stars = wrap.querySelectorAll(".sp");
  stars.forEach((s, i) => {
    s.addEventListener("mouseenter", () =>
      stars.forEach((x, j) => x.classList.toggle("on", j <= i)),
    );
    s.addEventListener("mouseleave", () => {
      const v = parseInt(wrap.dataset.v || 0);
      stars.forEach((x, j) => x.classList.toggle("on", j < v));
    });
    s.addEventListener("click", () => {
      wrap.dataset.v = i + 1;
      if (input) input.value = i + 1;
      stars.forEach((x, j) => x.classList.toggle("on", j <= i));
    });
  });
}

/* ── RENDER STARS ── */
function renderStars(n) {
  let s = "";
  for (let i = 1; i <= 5; i++)
    s += `<span class="${i <= n ? "" : "dim"}">★</span>`;
  return `<span class="stars">${s}</span>`;
}

/* ── HTML ESCAPE ── */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ── AUTH CHECK (redirect if not logged in) ── */
function requireAuth(role) {
  const user = Session.load();
  if (!user) {
    window.location.href = "/login";
    return null;
  }
  if (role && user.role !== role) {
    window.location.href =
      user.role === "customer" ? "/customer-dashboard" : "/owner-dashboard";
    return null;
  }
  return user;
}

/* ── LOGOUT ── */
async function logout() {
  Session.clear();

  try {
    await fetch("/logout", {
      method: "GET",
      credentials: "same-origin",
    });
  } catch (error) {
    console.error("Logout failed:", error);
  }

  window.location.href = "/login";
}
