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
const extraContent = document.getElementById('extra-content');

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

  renderExtraContent(info);

  notes.value = localStorage.getItem('notas_' + zone) || '';
  guardado.textContent = '';
  historialEl.classList.add('hidden');
  historialEl.innerHTML = '';
  toggleHistorial.textContent = 'Ver ideas anteriores';

  home.classList.add('hidden');
  detail.classList.remove('hidden');
}

function renderExtraContent(info) {
  extraContent.innerHTML = '';

  if (info.aprendizaje) {
    const box = document.createElement('div');
    box.className = 'extra-box';
    const label = document.createElement('p');
    label.className = 'extra-label';
    label.textContent = 'Aprendizaje de hoy';
    const texto = document.createElement('p');
    texto.className = 'extra-texto';
    texto.textContent = info.aprendizaje;
    box.appendChild(label);
    box.appendChild(texto);
    extraContent.appendChild(box);
  }

  if (info.frase && info.frase.texto) {
    const box = document.createElement('div');
    box.className = 'extra-box extra-frase';
    const texto = document.createElement('p');
    texto.className = 'extra-frase-texto';
    texto.textContent = '"' + info.frase.texto + '"';
    const autor = document.createElement('p');
    autor.className = 'extra-frase-autor';
    autor.textContent = '— ' + (info.frase.autor || '');
    box.appendChild(texto);
    box.appendChild(autor);
    extraContent.appendChild(box);
  }

  if (info.noticia && info.noticia.titulo) {
    const box = document.createElement('div');
    box.className = 'extra-box';
    const label = document.createElement('p');
    label.className = 'extra-label';
    label.textContent = 'Noticia del dia';
    const titulo = document.createElement('p');
    titulo.className = 'extra-texto';
    titulo.textContent = info.noticia.titulo;
    box.appendChild(label);
    box.appendChild(titulo);
    if (info.noticia.resumen) {
      const resumen = document.createElement('p');
      resumen.className = 'extra-resumen';
      resumen.textContent = info.noticia.resumen;
      box.appendChild(resumen);
    }
    if (info.noticia.url) {
      const link = document.createElement('a');
      link.href = info.noticia.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.className = 'extra-link';
      link.textContent = 'Leer mas';
      box.appendChild(link);
    }
    extraContent.appendChild(box);
  }

  if (info.guion) {
    extraContent.appendChild(makeCopyBox('Guion para grabar', info.guion));
  }

  if (info.referente && info.referente.nombre) {
    const box = document.createElement('div');
    box.className = 'extra-box';
    const label = document.createElement('p');
    label.className = 'extra-label';
    label.textContent = 'Cuenta que te puede inspirar';
    const nombre = document.createElement('p');
    nombre.className = 'extra-texto';
    nombre.textContent = info.referente.nombre;
    box.appendChild(label);
    box.appendChild(nombre);
    if (info.referente.porque) {
      const porque = document.createElement('p');
      porque.className = 'extra-resumen';
      porque.textContent = info.referente.porque;
      box.appendChild(porque);
    }
    extraContent.appendChild(box);
  }

  if (info.mensajeWhatsapp) {
    extraContent.appendChild(makeCopyBox('Mensaje para tu grupo', info.mensajeWhatsapp));
  }
}

function makeCopyBox(label, texto) {
  const box = document.createElement('div');
  box.className = 'extra-box';
  const labelEl = document.createElement('p');
  labelEl.className = 'extra-label';
  labelEl.textContent = label;
  const textoEl = document.createElement('p');
  textoEl.className = 'extra-texto';
  textoEl.textContent = texto;
  const copyBtn = document.createElement('button');
  copyBtn.className = 'link-button';
  copyBtn.textContent = 'Copiar';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(texto).then(() => {
      copyBtn.textContent = 'Copiado';
      setTimeout(() => { copyBtn.textContent = 'Copiar'; }, 1500);
    });
  });
  box.appendChild(labelEl);
  box.appendChild(textoEl);
  box.appendChild(copyBtn);
  return box;
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
    const info = day.zones[currentZone];
    const item = document.createElement('div');
    item.className = 'historial-item';
    const fecha = document.createElement('p');
    fecha.className = 'historial-fecha';
    fecha.textContent = day.date;
    item.appendChild(fecha);

    const idea = document.createElement('p');
    idea.className = 'historial-idea';
    idea.textContent = info.idea;
    item.appendChild(idea);

    if (info.aprendizaje) {
      item.appendChild(historialLinea('Aprendizaje: ', info.aprendizaje));
    }
    if (info.frase && info.frase.texto) {
      item.appendChild(historialLinea('Frase: ', '"' + info.frase.texto + '" — ' + (info.frase.autor || '')));
    }
    if (info.noticia && info.noticia.titulo) {
      item.appendChild(historialLinea('Noticia: ', info.noticia.titulo));
    }
    if (info.guion) {
      item.appendChild(historialLinea('Guion: ', info.guion));
    }
    if (info.referente && info.referente.nombre) {
      item.appendChild(historialLinea('Referente: ', info.referente.nombre));
    }
    if (info.mensajeWhatsapp) {
      item.appendChild(historialLinea('Mensaje: ', info.mensajeWhatsapp));
    }

    historialEl.appendChild(item);
  });
}

function historialLinea(etiqueta, texto) {
  const p = document.createElement('p');
  p.className = 'historial-extra';
  const b = document.createElement('span');
  b.className = 'historial-extra-label';
  b.textContent = etiqueta;
  p.appendChild(b);
  p.appendChild(document.createTextNode(texto));
  return p;
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
