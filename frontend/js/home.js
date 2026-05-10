// home.js - Home page interactions
  // Redirect if already logged in
  const u = Session.load();
  if(u) {
    const logInBtn = document.querySelector('.nav-right');
    if(logInBtn) logInBtn.innerHTML = `<a href="${u.role==='customer'?'customer-dashboard.html':'/owner-dashboard'}" class="btn btn-amber btn-sm">Dashboard</a>`;
  }
  // Category filter
  document.querySelectorAll('.cat-pill').forEach(p => {
    p.addEventListener('click', function(){
      document.querySelectorAll('.cat-pill').forEach(x=>x.classList.remove('active'));
      this.classList.add('active');
      const f = this.dataset.f;
      document.querySelectorAll('#rGrid [data-cat]').forEach(c => {
        c.style.display = f==='all'||c.dataset.cat===f ? '' : 'none';
      });
    });
  });
