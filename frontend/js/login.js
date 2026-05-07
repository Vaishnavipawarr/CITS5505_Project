// login.js

let selectedRole = 'customer';

function selectRole(role) {
    selectedRole = role;

    document.getElementById('tab-customer')
        .classList.toggle('active', role === 'customer');

    document.getElementById('tab-owner')
        .classList.toggle('active', role === 'owner');
}


function togglePw() {

    const inp = document.getElementById('password');

    if (inp.type === 'password') {
        inp.type = 'text';
    } else {
        inp.type = 'password';
    }
}


async function doLogin() {

    const username = document.getElementById('email').value.trim();

    const password = document.getElementById('password').value;

    const errBox = document.getElementById('errMsg');

    const errTxt = document.getElementById('errTxt');


    // Validation
    if (!username || !password) {

        errTxt.textContent = 'Please fill in all fields';

        errBox.classList.add('show');

        return;
    }

    try {

        const response = await fetch('/api/auth/login', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            credentials: 'same-origin',

            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        // Login failed
        if (!data.success) {

            errTxt.textContent = data.message;

            errBox.classList.add('show');

            return;
        }

        // Hide error
        errBox.classList.remove('show');

        // Redirect after login
        if (selectedRole === 'customer') {

            window.location.href = '/customer-dashboard';

        } else {

            window.location.href = '/owner-dashboard';
        }

    } catch (error) {

        errTxt.textContent = 'Server error';

        errBox.classList.add('show');

        console.error(error);
    }
}


// Enter key support
document.addEventListener('keydown', function (e) {

    if (e.key === 'Enter') {
        doLogin();
    }
});