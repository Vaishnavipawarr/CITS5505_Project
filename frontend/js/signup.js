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

async function doSignup() {

    const username = document.getElementById('email').value.trim();

    const password = document.getElementById('pw').value;

    const errBox = document.getElementById('errMsg');

    const errTxt = document.getElementById('errTxt');

    if (!username || !password) {

        errTxt.textContent = 'Please fill in all fields';

        errBox.classList.add('show');

        return;
    }

    try {

        const response = await fetch('/api/auth/register', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            credentials: 'same-origin',

            body: JSON.stringify({
                username,
                password,
                role: selectedRole
            })
        });

        const data = await response.json();

        if (!data.success) {

            errTxt.textContent = data.message;

            errBox.classList.add('show');

            return;
        }

        // SAVE USER LOCALLY
        Session.save(data.user);

        // Redirect to dashboard
        window.location.href = '/customer-dashboard';

    } catch (error) {

        errTxt.textContent = 'Server error';

        errBox.classList.add('show');

        console.error(error);
    }
}
