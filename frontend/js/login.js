// login.js
  let selectedRole = 'customer';

  // Redirect if already logged in
  const u = Session.load();
  if(u) window.location.href = u.role==='customer'?'customer-dashboard.html':'owner-dashboard.html';

  function selectRole(role) {
    selectedRole = role;
    document.getElementById('tab-customer').classList.toggle('active', role==='customer');
    document.getElementById('tab-owner').classList.toggle('active', role==='owner');
    document.getElementById('demoHint').innerHTML = role==='customer'
      ? 'Demo: <strong>customer@demo.com</strong> / <strong>demo123</strong>'
      : 'Demo: <strong>owner@demo.com</strong> / <strong>demo123</strong>';
  }

  function togglePw() {
    const inp = document.getElementById('password');
    const ico = document.getElementById('eyeIcon');
    inp.type = inp.type==='password'?'text':'password';
    ico.className = inp.type==='password'?'far fa-eye':'far fa-eye-slash';
  }

  function doLogin() {
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errBox   = document.getElementById('errMsg');
    const errTxt   = document.getElementById('errTxt');

    if(!email||!password){
      errTxt.textContent='Please fill in all fields.';
      errBox.classList.add('show'); return;
    }

    const account = DUMMY.accounts.find(a => a.email===email && a.password===password && a.role===selectedRole);
    if(!account){
      errTxt.textContent='Invalid credentials. Try the demo credentials shown above.';
      errBox.classList.add('show'); return;
    }

    errBox.classList.remove('show');
    Session.save(account);
    window.location.href = account.role==='customer'?'customer-dashboard.html':'owner-dashboard.html';
  }

  // Allow Enter key
  document.addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
