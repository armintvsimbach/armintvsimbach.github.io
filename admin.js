const apiUsers = 'https://tcs-manager-backend.onrender.com/api/users';
const apiResetPassword = 'https://tcs-manager-backend.onrender.com/api/reset-password';

function loadUsers() {
    fetch(apiUsers, {
        headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    })
    .then(res => res.json())
    .then(data => renderUsersTable(data));
}

function renderUsersTable(data) {
    const tbody = document.querySelector('#user-table tbody');
    const cardsContainer = document.querySelector('.user-cards');
    tbody.innerHTML = '';
    cardsContainer.innerHTML = '';

    data.forEach(user => {
        // Tabellenansicht (Desktop)
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.status}</td>
            <td>
                <button onclick='editUser(${JSON.stringify(user)})'>Bearbeiten</button>
                <button onclick='resetPassword(${user.id})'>Passwort</button>
                <button onclick='toggleUserStatus(${user.id}, "${user.status}")'>${user.status === "Aktiv" ? "Sperren" : "Aktivieren"}</button>
            </td>
        `;
        tbody.appendChild(tr);

        // Kartenansicht (Mobil)
        const card = document.createElement('div');
        card.className = "user-card";
        card.innerHTML = `
            <h3>${user.username}</h3>
            <p>Email: ${user.email}</p>
            <p>Rolle: ${user.role}</p>
            <p>Status: ${user.status}</p>
            <button onclick='editUser(${JSON.stringify(user)})'>Bearbeiten</button>
            <button onclick='resetPassword(${user.id})'>Passwort</button>
            <button onclick='toggleUserStatus(${user.id}, "${user.status}")'>${user.status === "Aktiv" ? "Sperren" : "Aktivieren"}</button>
        `;
        cardsContainer.appendChild(card);
    });
}

function openAddUserModal() {
    document.getElementById('modal-title').innerText = "Neuen Benutzer hinzufügen";
    document.getElementById('user-form').reset();
    document.getElementById('u-id').value = '';
    document.getElementById('password-row').style.display = 'block';
    document.getElementById('userModal').style.display = 'flex';
}

function editUser(user) {
    document.getElementById('modal-title').innerText = "Benutzer bearbeiten";
    document.getElementById('u-id').value = user.id;
    document.getElementById('u-username').value = user.username;
    document.getElementById('u-email').value = user.email;
    document.getElementById('u-role').value = user.role;
    document.getElementById('password-row').style.display = 'none';
    document.getElementById('userModal').style.display = 'flex';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

function closePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
}

document.getElementById('user-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const user = {
        username: document.getElementById('u-username').value,
        email: document.getElementById('u-email').value,
        role: document.getElementById('u-role').value
    };

    const password = document.getElementById('u-password').value;
    if (password) {
        user.password = password;
    }

    const id = document.getElementById('u-id').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${apiUsers}/${id}` : apiUsers;

    fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("token") },
        body: JSON.stringify(user)
    }).then(() => {
        closeUserModal();
        loadUsers();
    });
});

function resetPassword(userId) {
    const password = prompt("Neues Passwort eingeben:");
    if (!password) return;

    fetch(apiResetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("token") },
        body: JSON.stringify({ id: userId, password })
    }).then(() => {
        alert("Passwort wurde zurückgesetzt");
    });
}

function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === "Aktiv" ? "Gesperrt" : "Aktiv";

    fetch(`${apiUsers}/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("token") },
        body: JSON.stringify({ status: newStatus })
    }).then(() => {
        loadUsers();
    });
}

document.getElementById('password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('p-id').value;
    const password = document.getElementById('p-password').value;

    fetch(apiResetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("token") },
        body: JSON.stringify({ id, password })
    }).then(() => {
        closePasswordModal();
        loadUsers();
    });
});

document.addEventListener('DOMContentLoaded', loadUsers);
