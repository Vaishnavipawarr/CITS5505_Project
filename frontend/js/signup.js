// signup.js
  let selectedRole = 'customer';

  function selectRole(r){
    selectedRole = r;
    document.getElementById('tab-c').classList.toggle('active', r==='customer');
    document.getElementById('tab-o').classList.toggle('active', r==='owner');
    document.getElementById('ownerFields').classList.toggle('show', r==='owner');
  }

  function checkStr(v){
    const bar = document.getElementById('pwBar');
    const s = v.length>9&&/[A-Z]/.test(v)&&/[0-9]/.test(v)?3:v.length>5?2:v.length>0?1:0;
    bar.style.width=['0%','33%','66%','100%'][s];
    bar.style.background=['','#c04a2e','#d4a853','#5a8c52'][s]||'';
  }

  function doSignup(){
    const name=document.getElementById('name').value.trim();
    const email=document.getElementById('email').value.trim();
    const pw=document.getElementById('pw').value;
    const pw2=document.getElementById('pw2').value;
    const errBox=document.getElementById('errMsg');
    const errTxt=document.getElementById('errTxt');

    if(!name||!email||!pw){ errTxt.textContent='Please fill in all fields.'; errBox.classList.add('show'); return; }
    if(pw.length<6){ errTxt.textContent='Password must be at least 6 characters.'; errBox.classList.add('show'); return; }
    if(pw!==pw2){ errTxt.textContent='Passwords do not match.'; errBox.classList.add('show'); return; }
    if(selectedRole==='owner'&&!document.getElementById('restName').value.trim()){ errTxt.textContent='Please enter your restaurant name.'; errBox.classList.add('show'); return; }

    errBox.classList.remove('show');

    // Save new account to localStorage and log in
    const newUser = {
      email, password:pw, role:selectedRole,
      name: selectedRole==='owner' ? document.getElementById('restName').value.trim() : name,
      id: 'u_'+Date.now(),
      ...(selectedRole==='owner' && {restaurantId:'r_'+Date.now()})
    };
    Session.save(newUser);
    window.location.href = selectedRole==='customer'?'customer-dashboard.html':'owner-dashboard.html';
  }
