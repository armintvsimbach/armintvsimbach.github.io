const apiUsers = 'http://localhost:3000/api/users';
const apiResetPassword = 'http://localhost:3000/api/reset-password';

let users = [];

function fetchUsers() {
    authorizedFetch(apiUsers)
    .then(res => res.json())
    .then(data => {
        users = data;
        renderUserTable();
    });
}

function renderUserTable() {
    const tbody = document.querySelector('#user-table tbody');
    tbody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.active ? 'Aktiv' : 'Gesperrt'}</td>
            <td>
                <button onclick='openEditUserModal(${JSON.stringify(user)})'>✏️ Bearbeiten</button>
                <button onclick='openPasswordModal(${user.id})'>🔑 Passwort</button>
                <button onclick='toggleUserStatus(${user.id}, ${user.active})'>${user.active ? '🚫 Sperren' : '✅ Aktivieren'}</button>
                <button onclick='deleteUser(${user.id})'>🗑️ Löschen</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openAddUserModal() {
    document.getElementById('modal-title').innerText = "Neuen Benutzer hinzufügen";
    document.getElementById('user-form').reset();
    document.getElementById('u-id').value = '';

    // Passwortfeld anzeigen bei NEU
    document.getElementById('password-row').style.display = 'block';

    document.getElementById('userModal').style.display = 'flex';
}

function openEditUserModal(user) {
    openAddUserModal();
    document.getElementById('modal-title').innerText = "Benutzer bearbeiten";
    document.getElementById('u-id').value = user.id;
    document.getElementById('u-username').value = user.username;
    document.getElementById('u-email').value = user.email;
    document.getElementById('u-role').value = user.role;

    // Passwortfeld ausblenden beim Bearbeiten
    document.getElementById('password-row').style.display = 'none';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
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
        user.password = password; // Nur wenn eingegeben → wird gesendet
    }

    const id = document.getElementById('u-id').value;

    authorizedFetch(id ? `${apiUsers}/${id}` : apiUsers, {
        method: id ? 'PUT' : 'POST',
        headers: { 
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    }).then(() => {
        closeUserModal();
        fetchUsers();
    });
});

function openPasswordModal(id) {
    document.getElementById('p-id').value = id;
    document.getElementById('password-form').reset();
    document.getElementById('passwordModal').style.display = 'flex';
}

function closePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
}

document.getElementById('password-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('p-id').value;
    const password = document.getElementById('p-password').value;

    authorizedFetch(apiResetPassword, {
        method: 'POST',
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, password })
    }).then(() => {
        closePasswordModal();
        alert("Passwort wurde geändert.");
    });
});

function toggleUserStatus(id, active) {
    authorizedFetch(`${apiUsers}/${id}/status`, {
        method: 'PUT',
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ active: !active })
    }).then(() => fetchUsers());
}

function deleteUser(id) {
    if (confirm("Willst du diesen Benutzer wirklich löschen?")) {
        authorizedFetch(`${apiUsers}/${id}`, {
            method: 'DELETE',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        }).then(() => fetchUsers());
    }
}

document.addEventListener('DOMContentLoaded', fetchUsers);
