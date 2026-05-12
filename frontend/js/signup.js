// signup.js

let selectedRole = 'customer';

function selectRole(role) {

    selectedRole = role;

    console.log('Selected role:', selectedRole);

    const customerTab =
        document.getElementById('tab-c');

    const ownerTab =
        document.getElementById('tab-o');

    const ownerFields =
        document.getElementById('ownerFields');

    if (role === 'customer') {

        customerTab.classList.add('active');

        ownerTab.classList.remove('active');

        ownerFields.classList.remove('show');

    } else {

        ownerTab.classList.add('active');

        customerTab.classList.remove('active');

        ownerFields.classList.add('show');
    }
}


// Password strength bar
function checkStr(value) {

    const bar = document.getElementById('pwBar');

    const strength =
        value.length > 9 &&
        /[A-Z]/.test(value) &&
        /[0-9]/.test(value)
            ? 3
            : value.length > 5
                ? 2
                : value.length > 0
                    ? 1
                    : 0;

    bar.style.width = ['0%', '33%', '66%', '100%'][strength];

    bar.style.background =
        ['', '#c04a2e', '#d4a853', '#5a8c52'][strength] || '';
}


async function doSignup() {

    // Basic fields
    const name =
        document.getElementById('name')?.value.trim() || '';

    const username =
        document.getElementById('email')?.value.trim() || '';

    const password =
        document.getElementById('pw')?.value || '';

    // FIXED CONFIRM PASSWORD ID
    const confirmPassword =
        document.getElementById('pw2')?.value || '';

    // Optional owner fields
    const restaurantName =
        document.getElementById('restaurantName')?.value.trim() || '';

    const cuisine =
        document.getElementById('cuisine')?.value.trim() || '';

    const city =
        document.getElementById('city')?.value.trim() || '';

    // Error UI
    const errBox = document.getElementById('errMsg');

    const errTxt = document.getElementById('errTxt');

    // Validation
    if (!name || !username || !password) {

        errTxt.textContent =
            'Please fill in all required fields';

        errBox.classList.add('show');

        return;
    }

    if (password !== confirmPassword) {

        errTxt.textContent =
            'Passwords do not match';

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

                name,
                username,
                password,
                role: selectedRole,

                restaurant_name: restaurantName,
                cuisine,
                city
            })
        });

        const data = await response.json();

        if (!data.success) {

            errTxt.textContent = data.message;

            errBox.classList.add('show');

            return;
        }

        // Save session locally
        Session.save(data.user);

        // Redirect based on role
        if (data.user.role === 'owner') {

            window.location.href =
                '/owner-dashboard';

        } else {

            window.location.href =
                '/customer-dashboard';
        }

    } catch (error) {

        console.error(error);

        errTxt.textContent = 'Server error';

        errBox.classList.add('show');
    }
}