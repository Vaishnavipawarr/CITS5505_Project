// customer-dashboard.js
  /* AUTH */
  const user = requireAuth('customer');
  if(!user) throw 0;

  /* SET NAMES */
  document.getElementById('navName').textContent = user.name;
  document.getElementById('sbName').textContent   = user.name;
  document.getElementById('headName').textContent = user.name.split(' ')[0];

  let pendingDeleteId = null;

  /* POPULATE RESTAURANT DROPDOWN */
  const restSelect = document.getElementById('modalRest');
  const filterRest = document.getElementById('filterRest');
  DUMMY.restaurants.forEach(r => {
    restSelect.innerHTML += `<option value="${r.id}">${r.name}</option>`;
    filterRest.innerHTML += `<option value="${r.id}">${r.name}</option>`;
  });

  /* STAR PICKER */
  initStars('spWrap', null);

  /* TABS */
  function showTab(id, linkEl) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-'+id).classList.add('active');
    if(linkEl && linkEl.classList.contains('tab-btn')) linkEl.classList.add('active');
    else document.getElementById('tbtn-'+id) && document.getElementById('tbtn-'+id).classList.add('active');
    // Update sidebar active
    document.querySelectorAll('.sb-nav a').forEach(a => a.classList.remove('active'));
    if(id==='my-reviews') document.querySelectorAll('.sb-nav a')[0].classList.add('active');
    else if(id==='browse') document.querySelectorAll('.sb-nav a')[1].classList.add('active');
    if(id==='browse') renderBrowse();
  }

  /* RENDER MY REVIEWS */
  function renderMyReviews() {
    const reviews = getReviews().filter(r => r.customerId === user.id);
    const el = document.getElementById('myRevList');
    const all = getReviews();
    document.getElementById('myRevCount').textContent   = reviews.length;
    document.getElementById('totalRevCount').textContent = all.length;
    document.getElementById('replyCount').textContent    = reviews.filter(r=>r.ownerReply).length;

    if(!reviews.length) {
      el.innerHTML = `<div class="empty"><div class="icon">✍️</div><h3>No reviews yet</h3><p>Share your first dining experience!</p><button class="btn btn-amber mt-3" onclick="openWriteModal()"><i class="fas fa-plus"></i> Write Your First Review</button></div>`;
      return;
    }
    el.innerHTML = reviews.map(r => `
      <div class="rev-card">
        <div class="rev-rest-row">
          <img class="rev-rest-thumb" src="${r.restaurantImg}" alt=""/>
          <div>
            <div class="rev-rest-name">${r.restaurantName}</div>
            <div class="rev-rest-meta">${r.date}</div>
          </div>
          <div class="ms-auto d-flex gap-2">
            <button class="btn btn-ghost btn-sm" onclick="openEditModal(${r.id})"><i class="fas fa-pen"></i> Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteReview(${r.id})"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <div class="rev-stars-row">${renderStars(r.rating)}<span style="font-size:.8rem;font-weight:600;color:var(--amber)">${r.rating}.0</span></div>
        <div class="rev-body">${r.text}</div>
        ${r.tags&&r.tags.length?`<div class="rev-chips">${r.tags.map(t=>`<span class="rev-chip">${t}</span>`).join('')}</div>`:''}
        ${r.ownerReply?`<div class="owner-reply"><div class="lbl">✦ Owner's Reply · ${r.ownerReplyDate||''}</div><p>${r.ownerReply}</p></div>`:''}
      </div>
    `).join('');
  }

  /* RENDER BROWSE */
  function renderBrowse() {
    const search = (document.getElementById('searchInput')?.value||'').toLowerCase();
    const rFilter = document.getElementById('filterRating')?.value||'all';
    const restFilter = document.getElementById('filterRest')?.value||'all';
    let reviews = getReviews();
    if(search) reviews = reviews.filter(r => r.restaurantName.toLowerCase().includes(search)||r.text.toLowerCase().includes(search)||r.customerName.toLowerCase().includes(search));
    if(rFilter!=='all') reviews = reviews.filter(r => r.rating >= parseInt(rFilter));
    if(restFilter!=='all') reviews = reviews.filter(r => r.restaurantId===restFilter);

    const el = document.getElementById('browseList');
    if(!reviews.length) { el.innerHTML=`<div class="empty"><div class="icon">🔍</div><h3>No reviews found</h3><p>Try adjusting your filters.</p></div>`; return; }
    el.innerHTML = reviews.map(r => `
      <div class="pub-rev">
        <div class="d-flex align-items-center gap-3 mb-3">
          <img class="pub-av" src="${r.customerAvatar}" alt=""/>
          <div class="flex-1">
            <div style="font-weight:600;font-size:.88rem;color:var(--cream)">${r.customerName}</div>
            <div style="font-size:.72rem;color:var(--muted)">Reviewed ${r.restaurantName} · ${r.date}</div>
          </div>
          <div class="ms-auto">${renderStars(r.rating)}</div>
        </div>
        <div style="display:inline-flex;align-items:center;gap:.5rem;background:var(--surface);border-radius:var(--r-sm);padding:.28rem .7rem;margin-bottom:.8rem;font-size:.76rem;color:var(--text);">
          <img src="${r.restaurantImg}" style="width:20px;height:20px;border-radius:4px;object-fit:cover;" alt=""/>
          ${r.restaurantName}
        </div>
        <p style="font-size:.86rem;line-height:1.72;color:var(--text);margin-bottom:.75rem;">${r.text}</p>
        ${r.tags&&r.tags.length?`<div class="rev-chips">${r.tags.map(t=>`<span class="rev-chip">${t}</span>`).join('')}</div>`:''}
        ${r.ownerReply?`<div class="owner-reply"><div class="lbl">✦ Owner's Reply</div><p>${r.ownerReply}</p></div>`:''}
      </div>
    `).join('');
  }

  /* WRITE MODAL */
  function openWriteModal() {
    document.getElementById('editId').value='';
    document.getElementById('modalTitle').textContent='Write a Review';
    document.getElementById('submitLabel').textContent='Post Review';
    document.getElementById('modalText').value='';
    document.getElementById('modalRest').value='';
    const sp=document.getElementById('spWrap');
    sp.dataset.v=0;
    sp.querySelectorAll('.sp').forEach(s=>s.classList.remove('on'));
    openModal('writeModal');
  }

  /* EDIT MODAL */
  function openEditModal(id) {
    const rev = getReviews().find(r=>r.id===id);
    if(!rev) return;
    document.getElementById('editId').value=id;
    document.getElementById('modalTitle').textContent='Edit Your Review';
    document.getElementById('submitLabel').textContent='Save Changes';
    document.getElementById('modalText').value=rev.text;
    document.getElementById('modalRest').value=rev.restaurantId;
    const sp=document.getElementById('spWrap');
    sp.dataset.v=rev.rating;
    sp.querySelectorAll('.sp').forEach((s,i)=>s.classList.toggle('on',i<rev.rating));
    openModal('writeModal');
  }

  /* SUBMIT REVIEW */
  function submitReview() {
    const editId   = document.getElementById('editId').value;
    const restId   = document.getElementById('modalRest').value;
    const text     = document.getElementById('modalText').value.trim();
    const rating   = parseInt(document.getElementById('spWrap').dataset.v||0);
    if(!restId){toast('Please select a restaurant','⚠️');return;}
    if(!rating){toast('Please select a rating','⚠️');return;}
    if(!text){toast('Please write your review','⚠️');return;}
    const rest = DUMMY.restaurants.find(r=>r.id===restId);
    let reviews = getReviews();
    if(editId) {
      reviews = reviews.map(r => r.id===parseInt(editId)?{...r,text,rating,restaurantId:restId,restaurantName:rest.name,restaurantImg:rest.img}:r);
      toast('Review updated!','✓');
    } else {
      const newRev = {id:Date.now(),customerId:user.id,customerName:user.name,customerAvatar:user.avatar||'https://i.pravatar.cc/80?img=47',restaurantId:restId,restaurantName:rest.name,restaurantImg:rest.img,rating,text,tags:[],date:'Just now',ownerReply:null};
      reviews.unshift(newRev);
      toast('Review posted!','🌟');
    }
    saveReviews(reviews);
    closeModal('writeModal');
    renderMyReviews();
  }

  /* DELETE */
  function deleteReview(id) { pendingDeleteId=id; openModal('deleteModal'); }
  function confirmDelete() {
    if(!pendingDeleteId) return;
    const reviews = getReviews().filter(r=>r.id!==pendingDeleteId);
    saveReviews(reviews);
    pendingDeleteId=null;
    closeModal('deleteModal');
    toast('Review deleted','🗑️');
    renderMyReviews();
  }

  /* INIT */
  renderMyReviews();
