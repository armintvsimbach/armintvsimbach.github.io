
function getToken() {
    return localStorage.getItem("token");
}

function authorizedFetch(url, options = {}) {
    if (!options.headers) options.headers = {};
    options.headers["Authorization"] = "Bearer " + getToken();
    return fetch(url, options).then(response => {
        if (response.status === 401 || response.status === 403) {
            window.location.href = "login.html";
        }
        return response;
    });
}

function checkLogin() {
    if (!getToken()) {
        window.location.href = "login.html";
    }
}

function getUserInfo() {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload; // { id, username, role, iat, exp }
}

function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    return fetch(url, { ...options, headers })
        .then(async response => {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                alert("Deine Sitzung ist abgelaufen. Du wirst zum Login weitergeleitet.");
                window.location.href = "/login.html"; // Passe ggf. an
                throw new Error("Session expired");
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            return response.json();
        });
}

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

function setupTokenExpiryWatcher() {
    const token = localStorage.getItem("token");
    const payload = parseJwt(token);
    if (payload && payload.exp) {
        const expiresAt = payload.exp * 1000;
        const timeLeft = expiresAt - Date.now();

        if (timeLeft < 0) {
            localStorage.removeItem("token");
            window.location.href = "/login.html";
        } else {
            setTimeout(() => {
                alert("Deine Sitzung ist abgelaufen.");
                localStorage.removeItem("token");
                window.location.href = "login.html";
            }, timeLeft);
        }
    }
}
