// const apiEquipment = 'http://localhost:3000/api/equipment';
// const apiCategories = 'http://localhost:3000/api/categories';
const apiEquipment = 'http://localhost:3000/api/equipment';
const apiCategories = 'http://localhost:3000/api/categories';
let equipmentData = [];
let categories = [];

// Equipment und Kategorien laden
function fetchEquipmentAndCategories() {
  Promise.all([
    fetch(apiEquipment).then(res => res.json()),
    fetch(apiCategories).then(res => res.json())
  ]).then(([equipment, cats]) => {
    equipmentData = equipment;
    categories = cats;
    renderEquipmentTable();
    populateCategoryFilters();
  });
}

function renderEquipmentTable() {
  const tbody = document.querySelector('#equipment-table tbody');
  tbody.innerHTML = '';

  equipmentData.forEach(eq => {
    const nextMaintenance = calculateNextMaintenance(eq.letzte_wartung, eq.wartungsintervall);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${eq.bild || 'placeholder.jpg'}" alt="Bild" style="width:50px;height:auto;"></td>
      <td>${eq.name}</td>
      <td>${eq.kategorie}</td>
      <td>${eq.beschreibung}</td>
      <td>${eq.groesse}</td>
      <td>${eq.letzte_wartung ? eq.letzte_wartung.substring(0,10) : '-'}</td>
      <td>${eq.wartungsintervall || '-'}</td>
      <td>${nextMaintenance || '-'}</td>
      <td>${eq.status}</td>
      <td><button onclick='openEditEquipmentModal(${JSON.stringify(eq)})'>✏️ Bearbeiten</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function calculateNextMaintenance(last, interval) {
  if (!last || !interval) return null;
  const date = new Date(last);
  date.setMonth(date.getMonth() + parseInt(interval));
  return date.toISOString().substring(0,10);
}

// Filter und Suche
document.getElementById('search-equipment').addEventListener('input', () => {
  const query = document.getElementById('search-equipment').value.toLowerCase();
  const filtered = equipmentData.filter(eq =>
    eq.name.toLowerCase().includes(query) ||
    (eq.kategorie && eq.kategorie.toLowerCase().includes(query)) ||
    (eq.status && eq.status.toLowerCase().includes(query))
  );
  renderFilteredEquipment(filtered);
});

document.getElementById('filter-category').addEventListener('change', filterEquipment);
document.getElementById('filter-status').addEventListener('change', filterEquipment);

function filterEquipment() {
  const cat = document.getElementById('filter-category').value;
  const status = document.getElementById('filter-status').value;
  const filtered = equipmentData.filter(eq => {
    return (!cat || eq.kategorie === cat) && (!status || eq.status === status);
  });
  renderFilteredEquipment(filtered);
}

function renderFilteredEquipment(data) {
  const tbody = document.querySelector('#equipment-table tbody');
  tbody.innerHTML = '';
  data.forEach(eq => {
    const nextMaintenance = calculateNextMaintenance(eq.letzte_wartung, eq.wartungsintervall);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${eq.bild || 'placeholder.jpg'}" alt="Bild" style="width:50px;height:auto;"></td>
      <td>${eq.name}</td>
      <td>${eq.kategorie}</td>
      <td>${eq.beschreibung}</td>
      <td>${eq.groesse}</td>
      <td>${eq.letzte_wartung ? eq.letzte_wartung.substring(0,10) : '-'}</td>
      <td>${eq.wartungsintervall || '-'}</td>
      <td>${nextMaintenance || '-'}</td>
      <td>${eq.status}</td>
      <td><button onclick='openEditEquipmentModal(${JSON.stringify(eq)})'>✏️ Bearbeiten</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Modalsteuerung
function openAddEquipmentModal() {
  document.getElementById('modal-title').innerText = "Neues Equipment";
  clearEquipmentForm();
  populateCategorySelect();
  document.getElementById('equipmentModal').style.display = 'flex';
}

function openEditEquipmentModal(eq) {
  document.getElementById('modal-title').innerText = "Equipment bearbeiten";
  document.getElementById('eq-id').value = eq.id;
  document.getElementById('eq-name').value = eq.name;
  document.getElementById('eq-bild').value = eq.bild;
  document.getElementById('eq-kategorie').value = eq.kategorie;
  document.getElementById('eq-beschreibung').value = eq.beschreibung;
  document.getElementById('eq-groesse').value = eq.groesse;
  document.getElementById('eq-letztewartung').value = eq.letzte_wartung ? eq.letzte_wartung.substring(0,10) : '';
  document.getElementById('eq-wartungsintervall').value = eq.wartungsintervall;
  document.getElementById('eq-status').value = eq.status;
  document.getElementById('equipmentModal').style.display = 'flex';
}

function closeEquipmentModal() {
  document.getElementById('equipmentModal').style.display = 'none';
}

// Kategorien in Auswahlbox
function populateCategorySelect() {
  const select = document.getElementById('eq-kategorie');
  select.innerHTML = '';
  categories.forEach(cat => {
    select.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
  });
}

function populateCategoryFilters() {
  const select = document.getElementById('filter-category');
  select.innerHTML = `<option value="">Alle Kategorien</option>`;
  categories.forEach(cat => {
    select.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
  });
}

// Formular absenden
document.getElementById('equipment-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const newEq = {
    name: document.getElementById('eq-name').value,
    bild: document.getElementById('eq-bild').value,
    kategorie: document.getElementById('eq-kategorie').value,
    beschreibung: document.getElementById('eq-beschreibung').value,
    groesse: document.getElementById('eq-groesse').value,
    letzte_wartung: document.getElementById('eq-letztewartung').value,
    wartungsintervall: document.getElementById('eq-wartungsintervall').value,
    status: document.getElementById('eq-status').value
  };
  const id = document.getElementById('eq-id').value;

  if (id) {
    fetch(`${apiEquipment}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEq)
    }).then(() => {
      closeEquipmentModal();
      fetchEquipmentAndCategories();
    });
  } else {
    fetch(apiEquipment, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEq)
    }).then(() => {
      closeEquipmentModal();
      fetchEquipmentAndCategories();
    });
  }
});

// Beim Start laden
fetchEquipmentAndCategories();
