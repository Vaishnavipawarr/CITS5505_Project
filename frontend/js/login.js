// login.js

// Tracks the currently selected role (customer or owner)
let selectedRole = "customer";

// Updates the active role tab when user clicks Customer or Owner
function selectRole(role) {
  selectedRole = role;

  document
    .getElementById("tab-customer")
    .classList.toggle("active", role === "customer");

  document
    .getElementById("tab-owner")
    .classList.toggle("active", role === "owner");
}

// Toggles password field between visible and hidden
function togglePw() {
  const inp = document.getElementById("password");

  if (inp.type === "password") {
    inp.type = "text";
  } else {
    inp.type = "password";
  }
}

// Sends login credentials to the API and redirects to dashboard on success
async function doLogin() {
  const username = document.getElementById("username").value.trim();

  const password = document.getElementById("password").value;
  const errBox = document.getElementById("errMsg");
  const errTxt = document.getElementById("errTxt");

  // Validate required fields are filled
  if (!username || !password) {
    errTxt.textContent = "Please fill in all fields";
    errBox.classList.add("show");
    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        username: username,
        password: password,
        role: selectedRole,
      }),
    });

    const data = await response.json();

    // Login failed — show error message
    if (!data.success) {
      errTxt.textContent = data.message;
      errBox.classList.add("show");
      return;
    }

    // Hide error on success
    errBox.classList.remove("show");

    // Redirect to the correct dashboard based on role
    if (data.user.role === "customer") {
      window.location.href = "/customer-dashboard";
    } else {
      window.location.href = "/owner-dashboard";
    }
  } catch (error) {
    // Handle network or server errors
    errTxt.textContent = "Server error";
    errBox.classList.add("show");
    console.error(error);
  }
}

// Enter key support — allows form submission without clicking the button
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    doLogin();
  }
});
