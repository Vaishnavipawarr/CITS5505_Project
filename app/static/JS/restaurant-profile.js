let isOpen = true;
let photos = [];

function switchTab(name, btn) {
  document
    .querySelectorAll(".tab-panel")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  btn.classList.add("active");
}

function toggleLike(el) {
  const icon = el.querySelector("i");
  const parts = el.textContent.trim().split(" ");
  let count = parseInt(parts[parts.length - 1], 10);
  if (Number.isNaN(count)) count = 0;

  if (el.classList.contains("liked")) {
    el.classList.remove("liked");
    icon.className = "bi bi-heart";
    count = Math.max(0, count - 1);
  } else {
    el.classList.add("liked");
    icon.className = "bi bi-heart-fill";
    count += 1;
  }
  el.innerHTML = `<i class="${icon.className}"></i> ${count}`;
  updateLikesTotal();
}

function updateLikesTotal() {
  const host = document.getElementById("statLikes");
  if (!host) return;
  let total = 0;
  document.querySelectorAll(".like-action").forEach((el) => {
    const parts = el.textContent.trim().split(" ");
    const n = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(n)) total += n;
  });
  host.textContent = String(total);
}

function showToast(msg) {
  document.getElementById("toastMsg").textContent = msg;
  const toast = bootstrap.Toast.getOrCreateInstance(
    document.getElementById("toastEl"),
    { delay: 2200 }
  );
  toast.show();
}

function toggleOpenClose(btn) {
  isOpen = !isOpen;
  document.getElementById("statOpen").textContent = isOpen ? "Open" : "Closed";

  if (isOpen) {
    btn.innerHTML = '<i class="bi bi-door-open me-1"></i>Open';
    showToast("Restaurant is now OPEN (demo).");
  } else {
    btn.innerHTML = '<i class="bi bi-door-closed me-1"></i>Closed';
    showToast("Restaurant is now CLOSED (demo).");
  }
}

function renderPhotos() {
  const wrap = document.getElementById("photosWrap");
  if (!wrap) return;
  wrap.innerHTML =
    photos
      .map(
        (p, idx) => `
        <div style="position: relative">
          <img
            src="${p.dataUrl}"
            alt="photo"
            style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;cursor:pointer"
          />
          <button
            class="btn btn-sm btn-dark"
            style="position:absolute;top:10px;right:10px"
            onclick="removePhoto(${idx})"
            title="Remove"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      `
      )
      .join("") || `<div class="text-muted">No photos yet.</div>`;

  document.getElementById("statPhotos").textContent = String(photos.length);
}

function removePhoto(idx) {
  photos.splice(idx, 1);
  renderPhotos();
  showToast("Removed photo.");
}

function addPhotosFromFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      photos.unshift({ name: file.name, dataUrl: String(reader.result) });
      renderPhotos();
    };
    reader.readAsDataURL(file);
  });

  showToast("Uploaded photos (demo).");
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("photoInput");
  if (input) {
    input.addEventListener("change", (e) => {
      addPhotosFromFiles(e.target.files);
      e.target.value = "";
    });
  }
  renderPhotos();
  updateLikesTotal();
});

