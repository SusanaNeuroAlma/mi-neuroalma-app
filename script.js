const home = document.getElementById('home');
const detail = document.getElementById('detail');
const ideaCard = document.getElementById('idea-card');
const detailTitle = document.getElementById('detail-title');
const detailIdea = document.getElementById('detail-idea');
const detailTags = document.getElementById('detail-tags');
const notes = document.getElementById('notes');
const guardado = document.getElementById('guardado');
const fechaEl = document.getElementById('fecha');

let currentZone = null;
let saveTimeout = null;

fetch('data.json')
  .then((r) => r.json())
  .then((data) => {
    fechaEl.textContent = 'Ideas del ' + data.date;

    document.querySelectorAll('.zone-card').forEach((card) => {
      card.addEventListener('click', () => openZone(card.dataset.zone, data));
    });
  });

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

  home.classList.add('hidden');
  detail.classList.remove('hidden');
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
