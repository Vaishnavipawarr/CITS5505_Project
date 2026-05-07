// owner-dashboard.js
  /* AUTH */
  const user = requireAuth('owner');
  if(!user) throw 0;

  /* For demo: match owner to restaurant r1 (Ember & Oak) */
  const ownerRestId = user.restaurantId || 'r1';
  const ownerRest   = DUMMY.restaurants.find(r => r.id === ownerRestId) || DUMMY.restaurants[0];

  /* SET UI */
  document.getElementById('navName').textContent     = ownerRest.name;
  document.getElementById('sbRestName').textContent  = ownerRest.name;
  document.getElementById('ownerHead').innerHTML     = `${ownerRest.name} <em>Dashboard</em>`;
  document.getElementById('ownerSubhead').textContent= `Manage and respond to customer reviews for ${ownerRest.name}.`;

  /* TABS */
  function showTab(id, el) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.sb-nav a').forEach(a => a.classList.remove('active'));
    document.getElementById('tab-'+id).classList.add('active');
    if(el && el.classList.contains('tab-btn')) el.classList.add('active');
    document.getElementById('tbtn-'+id)?.classList.add('active');
    if(id==='overview') document.querySelectorAll('.sb-nav a')[0].classList.add('active');
    if(id==='reviews')  { document.querySelectorAll('.sb-nav a')[1].classList.add('active'); renderReviews(); }
  }

  /* GET THIS RESTAURANT'S REVIEWS */
  function getMyReviews() {
    return getReviews().filter(r => r.restaurantId === ownerRestId);
  }

  /* LOAD KPIs */
  function loadKPIs() {
    const reviews = getMyReviews();
    const total    = reviews.length;
    const avg      = total ? (reviews.reduce((s,r)=>s+r.rating,0)/total).toFixed(1) : '0';
    const replied  = reviews.filter(r=>r.ownerReply).length;
    const pending  = total - replied;
    document.getElementById('kpiTotal').textContent   = total;
    document.getElementById('kpiAvg').textContent     = avg;
    document.getElementById('kpiReplied').textContent = replied;
    document.getElementById('kpiPending').textContent = pending;

    /* Rating summary */
    document.getElementById('ovAvg').textContent   = avg;
    document.getElementById('ovCount').textContent = `based on ${total} review${total!==1?'s':''}`;
    const full = Math.round(+avg);
    document.getElementById('ovStars').textContent = '★'.repeat(full)+'☆'.repeat(5-full);

    /* Rating bars */
    const bars = document.getElementById('ovBars');
    bars.innerHTML = [5,4,3,2,1].map(n => {
      const cnt = reviews.filter(r=>r.rating===n).length;
      const pct = total ? Math.round(cnt/total*100) : 0;
      return `<div class="rb-row"><span style="min-width:22px">${n}★</span><div class="rb-track"><div class="rb-fill" style="width:${pct}%"></div></div><span style="min-width:24px;font-size:.74rem;color:var(--ot-mu)">${cnt}</span></div>`;
    }).join('');

    /* Tag bars */
    const tagCount = {};
    reviews.forEach(r => (r.tags||[]).forEach(t => tagCount[t]=(tagCount[t]||0)+1));
    const sorted = Object.entries(tagCount).sort((a,b)=>b[1]-a[1]).slice(0,6);
    const maxT = sorted[0]?.[1]||1;
    document.getElementById('tagBars').innerHTML = sorted.length
      ? sorted.map(([t,c]) => `<div class="rb-row"><span style="min-width:110px;font-size:.78rem">${t}</span><div class="rb-track"><div class="rb-fill" style="width:${Math.round(c/maxT*100)}%"></div></div><span style="font-size:.72rem;color:var(--ot-mu)">${c}</span></div>`).join('')
      : '<p style="font-size:.82rem;color:var(--ot-mu);">No tags yet.</p>';
  }

  /* RENDER REVIEWS */
  function renderReviews() {
    const search   = (document.getElementById('revSearch')?.value||'').toLowerCase();
    const rFilter  = document.getElementById('revFilterRating')?.value||'all';
    const stFilter = document.getElementById('revFilterStatus')?.value||'all';

    let reviews = getMyReviews();
    if(search)         reviews = reviews.filter(r=>r.customerName.toLowerCase().includes(search)||r.text.toLowerCase().includes(search));
    if(rFilter!=='all') reviews = reviews.filter(r => rFilter==='1' ? r.rating<=2 : r.rating===parseInt(rFilter));
    if(stFilter==='pending') reviews = reviews.filter(r=>!r.ownerReply);
    if(stFilter==='replied') reviews = reviews.filter(r=>!!r.ownerReply);

    const el = document.getElementById('revList');
    if(!reviews.length) {
      el.innerHTML=`<div class="empty"><div class="icon">💬</div><h3>No reviews found</h3><p>Adjust your filters or wait for customers to leave reviews.</p></div>`;
      return;
    }

    el.innerHTML = reviews.map(r => `
      <div class="orev ${r.ownerReply?'has-reply':'needs-reply'}" id="orev-${r.id}">
        <div class="d-flex align-items-center gap-3 mb-2">
          <img class="reviewer-av" src="${r.customerAvatar}" alt=""/>
          <div class="flex-1">
            <div class="reviewer-name">${r.customerName}</div>
            <div class="reviewer-meta">${r.date}</div>
          </div>
          <div class="ms-auto d-flex align-items-center gap-2">
            ${renderStars(r.rating)}
            <span class="status-pill ${r.ownerReply?'status-replied':'status-pending'}">${r.ownerReply?'✓ Replied':'⏳ Pending'}</span>
          </div>
        </div>
        <p class="rev-body">${r.text}</p>
        ${(r.tags||[]).length?`<div style="margin-bottom:.85rem">${r.tags.map(t=>`<span class="rev-tag">${t}</span>`).join('')}</div>`:''}

        ${r.ownerReply ? `
          <div class="reply-display" id="reply-display-${r.id}">
            <div class="lbl">
              <span>✦ Your Reply · ${r.ownerReplyDate||''}</span>
              <button class="btn btn-teal-outline btn-sm" style="font-size:.7rem;padding:.2rem .6rem;" onclick="editReply(${r.id})">Edit</button>
            </div>
            <p id="reply-text-${r.id}">${r.ownerReply}</p>
          </div>
        ` : ''}

        <div class="reply-compose ${r.ownerReply?'':'open'}" id="compose-${r.id}">
          <textarea id="replyInput-${r.id}" placeholder="Write a professional, helpful reply to this review…">${r.ownerReply||''}</textarea>
          <div class="d-flex gap-2 mt-2">
            ${r.ownerReply?`<button class="btn btn-ghost-ot btn-sm" onclick="cancelEdit(${r.id})">Cancel</button>`:''}
            <button class="btn btn-teal btn-sm ms-auto" onclick="submitReply(${r.id})"><i class="fas fa-reply"></i> ${r.ownerReply?'Update Reply':'Post Reply'}</button>
          </div>
        </div>

        ${!r.ownerReply?`
          <div class="d-flex mt-2" id="reply-btn-row-${r.id}">
            <!-- compose already open for no-reply cards -->
          </div>
        `:(!document.getElementById(`compose-${r.id}`)?.classList.contains('open')?`
          <div class="mt-2" id="reply-btn-row-${r.id}"></div>
        `:'')}
      </div>
    `).join('');
  }

  /* SUBMIT REPLY */
  function submitReply(id) {
    const text = document.getElementById(`replyInput-${id}`).value.trim();
    if(!text){toast('Please write a reply first','⚠️');return;}
    const reviews = getReviews().map(r => r.id===id ? {...r, ownerReply:text, ownerReplyDate:'Just now'} : r);
    saveReviews(reviews);
    toast('Reply posted!','✓');
    loadKPIs();
    renderReviews();
  }

  /* EDIT REPLY */
  function editReply(id) {
    const comp = document.getElementById(`compose-${id}`);
    const disp = document.getElementById(`reply-display-${id}`);
    if(comp) comp.classList.add('open');
    if(disp) disp.style.display='none';
  }
  function cancelEdit(id) {
    const comp = document.getElementById(`compose-${id}`);
    const disp = document.getElementById(`reply-display-${id}`);
    if(comp) comp.classList.remove('open');
    if(disp) disp.style.display='';
  }

  /* FILTER PENDING SHORTCUT */
  function filterPending() {
    showTab('reviews', document.getElementById('tbtn-reviews'));
    document.getElementById('revFilterStatus').value='pending';
    renderReviews();
  }

  /* INIT */
  loadKPIs();
