// Kľúč pre ukladanie dát do localStorage
const dataKey = 'spravaDokumentovData';

// Načítanie dát z localStorage alebo prednastavené prázdne pole
let data = {
  PASS1: [],
  PASS2: [],
  PASS3: []
};

const savedData = localStorage.getItem(dataKey);
if (savedData) {
  try {
    data = JSON.parse(savedData);
  } catch (e) {
    console.error('Chyba pri načítaní dát z localStorage:', e);
  }
}

let currentProfile = 'user';
let currentPass = null;
let selectedModelIndex = null; // index aktuálne vybraného modelu

const correctPassword = 'admin123';

// Zmena profilu (user/admin)
function changeProfile(profile) {
  if (profile === 'admin') {
    document.getElementById('password-modal').style.display = 'flex';
  } else {
    setProfile(profile);
  }
}

function setProfile(profile) {
  currentProfile = profile;
  currentPass = null;
  selectedModelIndex = null;

  document.getElementById('add-model-btn').style.display = profile === 'admin' ? 'inline-block' : 'none';
  document.getElementById('model-list').innerHTML = '';
  document.getElementById('model-list').style.display = 'none';
  document.getElementById('content-area').style.display = 'none';
  document.getElementById('content-area').innerHTML = '';
  document.getElementById('model-header').style.display = 'none';

  document.getElementById('profile').value = profile;
}

function verifyPassword() {
  const input = document.getElementById('password-input').value;
  if (input === correctPassword) {
    document.getElementById('password-modal').style.display = 'none';
    document.getElementById('password-input').value = '';
    setProfile('admin');
  } else {
    alert('Nesprávne heslo! Skús to znova.');
    document.getElementById('password-input').value = '';
  }
}

function closeModal() {
  document.getElementById('password-modal').style.display = 'none';
  document.getElementById('profile').value = 'user';
}

document.getElementById('close-modal').onclick = closeModal;

// Zobraziť modely pre zvolený PASS
function showModels(pass) {
  currentPass = pass;
  selectedModelIndex = null;

  const modelList = document.getElementById('model-list');
  const contentArea = document.getElementById('content-area');

  modelList.innerHTML = '';
  contentArea.innerHTML = '';
  contentArea.style.display = 'none';

  document.getElementById('model-header').style.display = 'flex';
  modelList.style.display = 'block';
  document.getElementById('add-model-btn').style.display = currentProfile === 'admin' ? 'inline-block' : 'none';

  const models = data[pass] || [];

  models.forEach((model, index) => {
    if (!model.urls) model.urls = model.docUrl ? [model.docUrl] : [];

    const modelRow = document.createElement('div');
    modelRow.style.display = 'flex';
    modelRow.style.alignItems = 'center';
    modelRow.style.marginBottom = '10px';

    if (currentProfile === 'admin') {
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '−';
      deleteBtn.style.backgroundColor = '#dc3545';
      deleteBtn.style.color = 'white';
      deleteBtn.style.border = 'none';
      deleteBtn.style.borderRadius = '50%';
      deleteBtn.style.width = '28px';
      deleteBtn.style.height = '28px';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.style.marginRight = '10px';
      deleteBtn.title = 'Vymazať model';

      deleteBtn.onclick = () => {
        if (confirm(`Naozaj chcete vymazať model "${model.name}"?`)) {
          data[pass].splice(index, 1);
          saveData();
          showModels(pass);
          if (selectedModelIndex === index) {
            selectedModelIndex = null;
            contentArea.style.display = 'none';
            contentArea.innerHTML = '';
          }
        }
      };
      modelRow.appendChild(deleteBtn);
    }

    const button = document.createElement('button');
    button.className = 'model-item';
    button.textContent = model.name;
    button.style.flexGrow = '1';

    button.onclick = () => {
      selectedModelIndex = index;
      renderDocContent(model);
    };

    modelRow.appendChild(button);
    modelList.appendChild(modelRow);
  });
}

// Zobrazenie dokumentácie a URL pre zvolený model
function renderDocContent(model) {
  const contentArea = document.getElementById('content-area');

  contentArea.innerHTML = `
    <div id="doc-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h3>${model.docTitle}</h3>
        <ul id="doc-links" style="list-style: none; padding-left: 0;">
          ${model.urls.map((url, idx) => `
            <li data-index="${idx}" style="display: flex; align-items: center; margin-bottom: 5px;">
              <a href="${url}" target="_blank" style="flex-grow: 1;">${url}</a>
              ${currentProfile === 'admin' ? `<button class="delete-url-btn" data-url="${url}" title="Vymazať URL" style="background-color: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; margin-left: 10px;">−</button>` : ''}
            </li>`).join('')}
        </ul>
      </div>
      ${currentProfile === 'admin' ? `<button id="add-url-button" style="background: #28a745; color: white; border: none; border-radius: 50%; font-size: 22px; width: 36px; height: 36px; cursor: pointer;">＋</button>` : ''}
    </div>
  `;

  contentArea.style.display = 'block';

  if (currentProfile === 'admin') {
    document.getElementById('add-url-button').onclick = () => {
      const newUrl = prompt("Zadajte novú URL dokumentácie:");
      if (newUrl && newUrl.trim()) {
        model.urls.push(newUrl.trim());
        saveData();
        renderDocContent(model); // Prekresli obsah, zachová výber modelu
      }
    };

    const deleteButtons = contentArea.querySelectorAll('.delete-url-btn');
    deleteButtons.forEach(btn => {
      btn.onclick = () => {
        const url = btn.dataset.url;
        if (confirm(`Naozaj chcete vymazať túto URL?\n${url}`)) {
          const idx = model.urls.indexOf(url);
          if (idx > -1) {
            model.urls.splice(idx, 1);
            saveData();
            renderDocContent(model); // Prekresli obsah
          }
        }
      };
    });
  }
}

// Uloženie dát do localStorage
function saveData() {
  localStorage.setItem(dataKey, JSON.stringify(data));
}

// Otvoriť modálne okno na pridanie modelu
function openModelModal() {
  document.getElementById('model-modal').style.display = 'flex';
}

// Zavrieť modálne okno na pridanie modelu
function closeModelModal() {
  document.getElementById('model-modal').style.display = 'none';
  document.getElementById('new-model-name').value = '';
}

// Pridať nový model
function submitNewModel(event) {
  event.preventDefault();

  const modelName = document.getElementById('new-model-name').value.trim();

  if (!modelName) {
    alert('Zadajte názov modelu.');
    return false;
  }
  if (!currentPass) {
    alert('Vyberte PASS.');
    return false;
  }

  if (data[currentPass].some(m => m.name === modelName)) {
    alert(`Model s názvom "${modelName}" už existuje.`);
    return false;
  }

  const docTitle = `Dokumentácia ${modelName}`;
  const docUrl = `https://example.com/${modelName}`;

  data[currentPass].push({ name: modelName, docTitle, urls: [docUrl] });
  saveData();

  showModels(currentPass);

  // Automaticky vybrať nový model a zobraziť dokumentáciu
  selectedModelIndex = data[currentPass].length - 1;
  renderDocContent(data[currentPass][selectedModelIndex]);

  closeModelModal();

  return false;
}

// Pripojiť eventy na tlačidlá
document.getElementById('add-model-btn').onclick = openModelModal;
document.getElementById('model-form').onsubmit = submitNewModel;
document.getElementById('verify-password-btn').onclick = verifyPassword;
document.getElementById('profile').onchange = (e) => changeProfile(e.target.value);