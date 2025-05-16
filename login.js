document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();

    fetch("https://tcs-manager-backend.onrender.com/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        })
    }).then(res => {
        if (!res.ok) throw new Error("Login fehlgeschlagen");
        return res.json();
    }).then(data => {
        localStorage.setItem("token", data.token);
        window.location.href = "index.html";
    }).catch(err => {
        document.getElementById('error').innerText = err.message;
    });
});
