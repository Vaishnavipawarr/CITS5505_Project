// Like Button
document.querySelectorAll(".like-btn").forEach(btn=>{
    btn.addEventListener("click", function(){
        this.classList.toggle("liked");
    });
});

// Search Filter
document.getElementById("searchInput")?.addEventListener("keyup", function(){
    let value = this.value.toLowerCase();
    document.querySelectorAll(".restaurant-card").forEach(card=>{
        let name = card.dataset.name.toLowerCase();
        card.style.display = name.includes(value) ? "block" : "none";
    });
});