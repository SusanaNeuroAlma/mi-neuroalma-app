const home = document.getElementById('home');
const detail = document.getElementById('detail');
const ideaCard = document.getElementById('idea-card');
const detailTitle = document.getElementById('detail-title');
const detailIdea = document.getElementById('detail-idea');
const detailTags = document.getElementById('detail-tags');
const notes = document.getElementById('notes');
const guardado = document.getElementById('guardado');
const fechaEl = document.getElementById('fecha');
const toggleHistorial = document.getElementById('toggle-historial');
const historialEl = document.getElementById('historial');

let currentZone = null;
let saveTimeout = null;
let historyData = [];

fetch('data.json')
  .then((r) => r.json())
  .then((data) => {
    fechaEl.textContent = 'Ideas del ' + data.date;

    document.querySelectorAll('.zone-card').forEach((card) => {
      card.addEventListener('click', () => openZone(card.dataset.zone, data));
    });
  });

fetch('history.json')
  .then((r) => r.json())
  .then((data) => { historyData = data; })
  .catch(() => { historyData = []; });

function openZone(zone, data) {
  const info = data.zones[zone];
  currentZone = zone;

  ideaCard.className = 'idea-card zone-' + zone;
  detailTitle.textContent = info.title;
  detailIdea.textContent = info.idea;
  detailTags.innerHTML = '';
  info.tags.forEach((tag) => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = tag;
    detailTags.appendChild(span);
  });

  notes.value = localStorage.getItem('notas_' + zone) || '';
  guardado.textContent = '';
  historialEl.classList.add('hidden');
  historialEl.innerHTML = '';
  toggleHistorial.textContent = 'Ver ideas anteriores';

  home.classList.add('hidden');
  detail.classList.remove('hidden');
}

toggleHistorial.addEventListener('click', () => {
  const isHidden = historialEl.classList.contains('hidden');
  if (isHidden) {
    renderHistorial();
    historialEl.classList.remove('hidden');
    toggleHistorial.textContent = 'Ocultar ideas anteriores';
  } else {
    historialEl.classList.add('hidden');
    toggleHistorial.textContent = 'Ver ideas anteriores';
  }
});

function renderHistorial() {
  historialEl.innerHTML = '';
  const entries = historyData
    .filter((day) => day.zones[currentZone])
    .slice()
    .reverse();

  if (entries.length === 0) {
    const p = document.createElement('p');
    p.className = 'historial-vacio';
    p.textContent = 'Todavia no hay ideas anteriores guardadas.';
    historialEl.appendChild(p);
    return;
  }

  entries.forEach((day) => {
    const item = document.createElement('div');
    item.className = 'historial-item';
    const fecha = document.createElement('p');
    fecha.className = 'historial-fecha';
    fecha.textContent = day.date;
    const idea = document.createElement('p');
    idea.className = 'historial-idea';
    idea.textContent = day.zones[currentZone].idea;
    item.appendChild(fecha);
    item.appendChild(idea);
    historialEl.appendChild(item);
  });
}

document.getElementById('back').addEventListener('click', () => {
  detail.classList.add('hidden');
  home.classList.remove('hidden');
});

notes.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem('notas_' + currentZone, notes.value);
    guardado.textContent = 'Guardado';
    setTimeout(() => { guardado.textContent = ''; }, 1500);
  }, 500);
});
