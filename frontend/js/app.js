/* ════════════════════════════════════
   FORK & FLAME — app.js
   ════════════════════════════════════ */

/* ── LOADER ── */
window.addEventListener('load', () => {
  const l = document.getElementById('loader');
  if (l) setTimeout(() => l.classList.add('done'), 700);
});

/* ── NAVBAR SCROLL ── */
(function(){
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const fn = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', fn, {passive:true}); fn();
})();

/* ── SCROLL REVEAL ── */
(function(){
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);} });
  }, {threshold:.1, rootMargin:'0px 0px -40px 0px'});
  els.forEach(el => io.observe(el));
})();

/* ── TOAST ── */
function toast(msg, icon) {
  icon = icon || '✓';
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
  t.innerHTML = `<span style="color:var(--amber-light)">${icon}</span> ${msg}`;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── MODAL ── */
function openModal(id)  { const m=document.getElementById(id); if(m){m.classList.add('open'); document.body.style.overflow='hidden';} }
function closeModal(id) { const m=document.getElementById(id); if(m){m.classList.remove('open'); document.body.style.overflow='';} }
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-bg')) { e.target.classList.remove('open'); document.body.style.overflow=''; }
});

/* ── COUNTER ANIMATION ── */
function animCount(el, to, dur) {
  dur = dur||1400; let start=null;
  const step = ts => {
    if(!start) start=ts;
    const p = Math.min((ts-start)/dur,1);
    const ease = 1-Math.pow(1-p,3);
    el.textContent = Math.round(ease*to).toLocaleString()+(el.dataset.suffix||'');
    if(p<1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
(function(){
  const counters = document.querySelectorAll('[data-count]');
  if(!counters.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){animCount(e.target,+e.target.dataset.count);io.unobserve(e.target);} });
  },{threshold:.5});
  counters.forEach(c => io.observe(c));
})();

/* ── HERO PARALLAX ── */
(function(){
  const bg = document.querySelector('.hero-bg');
  if(!bg||window.innerWidth<768) return;
  window.addEventListener('scroll', () => { bg.style.transform=`translateY(${window.scrollY*.3}px)`; }, {passive:true});
})();

/* ══════════════════════════════════════
   SESSION  (localStorage simulation)
   ══════════════════════════════════════ */

const Session = {
  save(user) { localStorage.setItem('fnf_user', JSON.stringify(user)); },
  load()     { try{ return JSON.parse(localStorage.getItem('fnf_user')); }catch(e){return null;} },
  clear()    { localStorage.removeItem('fnf_user'); },
  get role() { const u=this.load(); return u?u.role:null; },
  get name() { const u=this.load(); return u?u.name:''; },
};

/* ══════════════════════════════════════
   DUMMY DATA
   ══════════════════════════════════════ */
const DUMMY = {
  /* All reviews in the system */
  reviews: [
    {id:1, customerId:'c1', customerName:'Alexandra Chen', customerAvatar:'https://i.pravatar.cc/80?img=47',
     restaurantId:'r1', restaurantName:'Ember & Oak', restaurantImg:'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=80&q=70',
     rating:5, text:'A transcendent dining experience. The wagyu rib eye was brought tableside on smouldering embers — theatrical and delicious. The charcoal crust gave way to the most tender interior I\'ve ever tasted. Impeccable service throughout.',
     tags:['Exceptional Wagyu','Great Wine','Attentive Service'], date:'2 days ago',
     ownerReply:'Thank you so much, Alexandra! Our team reads every review — this made their week. Ask for the new dry-aged Tomahawk next time!', ownerReplyDate:'1 day ago'},
    {id:2, customerId:'c2', customerName:'James Thornton', customerAvatar:'https://i.pravatar.cc/80?img=33',
     restaurantId:'r2', restaurantName:'Spice Garden', restaurantImg:'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=80&q=70',
     rating:5, text:'I grew up in Chennai and finding food this authentic in Sydney is a miracle. The rasam tasted exactly like my grandmother\'s recipe. The lamb biryani was perfectly fragrant with layers of flavour that kept revealing themselves.',
     tags:['Authentic','Nostalgic','Best Biryani'], date:'5 days ago', ownerReply:null},
    {id:3, customerId:'c3', customerName:'Sophie Laurent', customerAvatar:'https://i.pravatar.cc/80?img=12',
     restaurantId:'r1', restaurantName:'Ember & Oak', restaurantImg:'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=80&q=70',
     rating:4, text:'Perfect for a business dinner. The private dining room has great acoustics, lighting is immaculate. My guest ordered the bone-in sirloin and couldn\'t stop talking about it. Slight deduction for the sparse bread course.',
     tags:['Business Dining','Great Ambience'], date:'1 week ago',
     ownerReply:'Glad you had a great time, Sophie! We\'ve already upgraded our bread service based on feedback like yours.', ownerReplyDate:'6 days ago'},
    {id:4, customerId:'c4', customerName:'Ryan O\'Brien', customerAvatar:'https://i.pravatar.cc/80?img=58',
     restaurantId:'r3', restaurantName:'Kyoto Ramen Bar', restaurantImg:'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=80&q=70',
     rating:5, text:'72-hour tonkotsu broth that has made grown adults weep with joy. The soft-boiled egg was perfectly jammy and marinated. Wait time is long but every minute is justified once seated.',
     tags:['Best Ramen','Rich Broth','Worth the Wait'], date:'1 week ago', ownerReply:null},
    {id:5, customerId:'c5', customerName:'Priya Mehta', customerAvatar:'https://i.pravatar.cc/80?img=25',
     restaurantId:'r2', restaurantName:'Spice Garden', restaurantImg:'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=80&q=70',
     rating:4, text:'Very good butter chicken and naan. The daal makhani was rich and comforting. Service was a bit slow on our visit but the food absolutely made up for it.',
     tags:['Great Curry','Good Naan'], date:'2 weeks ago', ownerReply:null},
  ],

  restaurants: [
    {id:'r1', name:'Ember & Oak', img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', cuisine:'Steakhouse', price:'$$$$', rating:4.7, reviews:312, city:'The Rocks, Sydney'},
    {id:'r2', name:'Spice Garden', img:'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&q=80', cuisine:'Indian', price:'$$$', rating:4.8, reviews:341, city:'Haymarket, Sydney'},
    {id:'r3', name:'Kyoto Ramen Bar', img:'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&q=80', cuisine:'Japanese', price:'$$', rating:4.9, reviews:287, city:'CBD, Sydney'},
    {id:'r4', name:'Pizza Palace', img:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', cuisine:'Italian', price:'$$', rating:4.5, reviews:208, city:'Surry Hills, Sydney'},
    {id:'r5', name:'Burger Hub', img:'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80', cuisine:'American', price:'$$', rating:4.3, reviews:176, city:'Newtown, Sydney'},
    {id:'r6', name:'Sea Salt & Citrus', img:'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80', cuisine:'Seafood', price:'$$$$', rating:4.6, reviews:129, city:'Manly, Sydney'},
  ],

  /* Demo accounts */
  accounts: [
    {email:'customer@demo.com', password:'demo123', role:'customer', name:'Alexandra Chen', id:'c1', avatar:'https://i.pravatar.cc/80?img=47'},
    {email:'owner@demo.com',    password:'demo123', role:'owner',    name:'Ember & Oak',   id:'r1', restaurantId:'r1'},
  ]
};

/* ── STAR PICKER ── */
function initStars(wrapId, hiddenId) {
  const wrap  = document.getElementById(wrapId);
  const input = document.getElementById(hiddenId);
  if(!wrap) return;
  const stars = wrap.querySelectorAll('.sp');
  stars.forEach((s,i) => {
    s.addEventListener('mouseenter', () => stars.forEach((x,j)=>x.classList.toggle('on',j<=i)));
    s.addEventListener('mouseleave', () => { const v=parseInt(wrap.dataset.v||0); stars.forEach((x,j)=>x.classList.toggle('on',j<v)); });
    s.addEventListener('click', () => {
      wrap.dataset.v = i+1;
      if(input) input.value = i+1;
      stars.forEach((x,j)=>x.classList.toggle('on',j<=i));
    });
  });
}

/* ── RENDER STARS ── */
function renderStars(n) {
  let s='';
  for(let i=1;i<=5;i++) s += `<span class="${i<=n?'':'dim'}">★</span>`;
  return `<span class="stars">${s}</span>`;
}

/* ── AUTH CHECK (redirect if not logged in) ── */
function requireAuth(role) {
  const user = Session.load();
  if(!user) { window.location.href='login.html'; return null; }
  if(role && user.role !== role) {
    window.location.href = user.role==='customer'?'customer-dashboard.html':'owner-dashboard.html';
    return null;
  }
  return user;
}

/* ── LOGOUT ── */
function logout() {
  Session.clear();
  window.location.href = 'login.html';
}

/* ── REVIEW STORAGE (localStorage) ── */
function getReviews() {
  try { return JSON.parse(localStorage.getItem('fnf_reviews')) || DUMMY.reviews; }
  catch(e) { return DUMMY.reviews; }
}
function saveReviews(reviews) { localStorage.setItem('fnf_reviews', JSON.stringify(reviews)); }
