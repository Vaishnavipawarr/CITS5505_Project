// reviews.js
  const user = Session.load();
  if(user) document.getElementById('navRight').innerHTML=`<a href="${user.role==='customer'?'customer-dashboard.html':'/owner-dashboard'}" class="btn btn-amber btn-sm">Dashboard</a>`;

  // Populate rest filter
  const fr = document.getElementById('filterRest');
  DUMMY.restaurants.forEach(r => fr.innerHTML+=`<option value="${r.id}">${r.name}</option>`);

  function renderRevs(){
    const search   = document.getElementById('searchInput').value.toLowerCase();
    const rFilter  = document.getElementById('filterRating').value;
    const restFilt = document.getElementById('filterRest').value;
    let reviews = getReviews();
    if(search)        reviews = reviews.filter(r=>r.customerName.toLowerCase().includes(search)||r.restaurantName.toLowerCase().includes(search)||r.text.toLowerCase().includes(search));
    if(rFilter!=='all') reviews = reviews.filter(r => r.rating >= parseInt(rFilter));
    if(restFilt!=='all') reviews = reviews.filter(r => r.restaurantId===restFilt);

    const el = document.getElementById('revList');
    if(!reviews.length){el.innerHTML=`<div style="text-align:center;padding:3rem;color:var(--muted)"><i class="fas fa-search" style="font-size:2rem;margin-bottom:.8rem;opacity:.4;display:block;"></i>No reviews match your search.</div>`;return;}
    el.innerHTML = reviews.map(r=>`
      <div class="rev-card">
        <div class="d-flex align-items-center gap-3 mb-3">
          <img class="reviewer-av" src="${r.customerAvatar}" alt=""/>
          <div class="flex-1">
            <div style="font-weight:600;font-size:.9rem;color:var(--cream)">${r.customerName}</div>
            <div style="font-size:.72rem;color:var(--muted)">${r.date}</div>
          </div>
          <div class="ms-auto"><span class="stars">${'★'.repeat(r.rating)}<span class="dim">${'★'.repeat(5-r.rating)}</span></span></div>
        </div>
        <div class="rev-rest-tag">
          <img src="${r.restaurantImg}" alt=""/>
          ${r.restaurantName}
        </div>
        <p class="rev-body">${r.text}</p>
        ${(r.tags||[]).length?`<div style="margin-bottom:.8rem">${r.tags.map(t=>`<span class="rev-chip">${t}</span>`).join('')}</div>`:''}
        ${r.ownerReply?`<div class="owner-reply"><div class="lbl">✦ Owner's Reply</div><p>${r.ownerReply}</p></div>`:''}
      </div>
    `).join('');
  }
  renderRevs();
