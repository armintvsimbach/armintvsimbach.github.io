
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
