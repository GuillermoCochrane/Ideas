window.addEventListener('load', () => {
  const STORAGE_KEY = 'antygravity_tracking';
  const THEME_KEY = 'theme_preference';

  let entries = [];
  let currentEditId = null;
  let currentConfirmAction = null;
  let pendingDeleteId = null;
  let pendingImportFile = null;

  const tableBody = document.getElementById('tableBody');
  const emptyState = document.getElementById('emptyState');
  const modal = document.getElementById('modal');
  const formSection = document.getElementById('formSection');
  const confirmSection = document.getElementById('confirmSection');
  const modalTitle = document.getElementById('modalTitle');
  const entryForm = document.getElementById('entryForm');
  const emailInput = document.getElementById('email');
  const geminiDateInput = document.getElementById('geminiDate');
  const claudeDateInput = document.getElementById('claudeDate');
  const btnAdd = document.getElementById('btnAdd');
  const btnExport = document.getElementById('btnExport');
  const btnImport = document.getElementById('btnImport');
  const importFile = document.getElementById('importFile');
  const btnCancel = document.getElementById('btnCancel');
  const btnSave = document.getElementById('btnSave');
  const confirmTitle = document.getElementById('confirmTitle');
  const confirmMessage = document.getElementById('confirmMessage');
  const btnConfirmCancel = document.getElementById('btnConfirmCancel');
  const btnConfirmOk = document.getElementById('btnConfirmOk');
  const themeToggle = document.getElementById('themeToggle');

  // Obtener siguiente ID
  function getNextId() {
    if (entries.length === 0) return 1;
    return Math.max(...entries.map(e => e.id)) + 1;
  }

  // Cargar/guardar localStorage
  function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        entries = JSON.parse(raw);
        if (!Array.isArray(entries)) entries = [];
      } catch {
        entries = [];
      }
    } else {
      entries = [];
    }
    // Normalizar IDs
    entries.forEach((e, i) => {
      if (typeof e.id !== 'number' || isNaN(e.id)) {
        e.id = i + 1;
      }
    });
    entries.sort((a, b) => a.id - b.id);
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  // Devuelve la clase del puntito según los días restantes
  function getDateDotClass(dateStr) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(dateStr + 'T00:00:00');
    target.setHours(0,0,0,0);
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'dot-green';        // Ya pasó → disponible
    if (diffDays >= 5 && diffDays <= 7) return 'dot-red'; // Próximo (5-7 días)
    return 'dot-yellow';                          // Resto
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, ch => map[ch]);
  }

  function renderTable() {
    if (entries.length === 0) {
      tableBody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';
    tableBody.innerHTML = entries.map(entry => {
      const gDot = getDateDotClass(entry.geminiDate);
      const cDot = getDateDotClass(entry.claudeDate);
      return `
        <tr>
          <td>${entry.id}</td>
          <td>${escapeHtml(entry.email)}</td>
          <td><span class="status-dot ${gDot}"></span>${formatDate(entry.geminiDate)}</td>
          <td><span class="status-dot ${cDot}"></span>${formatDate(entry.claudeDate)}</td>
          <td>
            <button class="btn-edit" data-id="${entry.id}" title="Editar">✏️</button>
            <button class="btn-delete btn-danger" data-id="${entry.id}" title="Eliminar">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Modal
  function showFormSection() {
    formSection.classList.add('active');
    confirmSection.classList.remove('active');
  }

  function showConfirmSection(title, message) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    formSection.classList.remove('active');
    confirmSection.classList.add('active');
  }

  function openModalForAdd() {
    currentEditId = null;
    modalTitle.textContent = 'Nueva entrada';
    entryForm.reset();
    btnSave.textContent = 'Guardar';
    showFormSection();
    modal.showModal();
    emailInput.focus();
  }

  function openModalForEdit(entry) {
    currentEditId = entry.id;
    modalTitle.textContent = 'Editar entrada';
    emailInput.value = entry.email;
    geminiDateInput.value = entry.geminiDate;
    claudeDateInput.value = entry.claudeDate;
    btnSave.textContent = 'Actualizar';
    showFormSection();
    modal.showModal();
    emailInput.focus();
  }

  function closeModal() {
    modal.close();
    currentEditId = null;
    pendingDeleteId = null;
    pendingImportFile = null;
    currentConfirmAction = null;
    entryForm.reset();
  }

  // Validación con email duplicado
  function isEmailDuplicate(email, excludeId = null) {
    return entries.some(e => e.email === email && e.id !== excludeId);
  }

  function validateForm() {
    const email = emailInput.value.trim();
    const gemini = geminiDateInput.value;
    const claude = claudeDateInput.value;

    if (!email || !gemini || !claude) {
      alert('Todos los campos son obligatorios.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Ingresá un email válido.');
      return false;
    }
    if (isEmailDuplicate(email, currentEditId)) {
      alert('Ya existe una cuenta con ese email.');
      return false;
    }
    return true;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const email = emailInput.value.trim();
    const geminiDate = geminiDateInput.value;
    const claudeDate = claudeDateInput.value;

    if (currentEditId !== null) {
      const entry = entries.find(e => e.id === currentEditId);
      if (entry) {
        entry.email = email;
        entry.geminiDate = geminiDate;
        entry.claudeDate = claudeDate;
      }
    } else {
      entries.push({
        id: getNextId(),
        email,
        geminiDate,
        claudeDate
      });
    }

    entries.sort((a, b) => a.id - b.id);
    saveToStorage();
    renderTable();
    closeModal();
  }

  // Eliminar
  function requestDelete(id) {
    pendingDeleteId = id;
    currentConfirmAction = 'delete';
    showConfirmSection('Eliminar cuenta', '¿Estás seguro de eliminar esta cuenta? Esta acción no se puede deshacer.');
    modal.showModal();
  }

  function executeDelete() {
    if (pendingDeleteId) {
      entries = entries.filter(e => e.id !== pendingDeleteId);
      saveToStorage();
      renderTable();
    }
    closeModal();
  }

  // Exportar
  function exportData() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracking_capas_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Importar
  function requestImport(file) {
    pendingImportFile = file;
    currentConfirmAction = 'import';
    showConfirmSection('Importar datos', 'Se perderán todos los datos actuales y serán reemplazados por los del archivo. ¿Desea continuar?');
    modal.showModal();
  }

  function executeImport() {
    if (!pendingImportFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) {
          alert('El archivo no contiene un arreglo válido.');
          return;
        }
        const valid = imported.every(item => item.email && item.geminiDate && item.claudeDate);
        if (!valid) {
          alert('Algunos registros no tienen email, geminiDate o claudeDate.');
          return;
        }
        entries = imported.map((item, index) => ({
          id: index + 1,
          email: item.email,
          geminiDate: item.geminiDate,
          claudeDate: item.claudeDate
        }));
        saveToStorage();
        renderTable();
        alert('Datos importados correctamente.');
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      } finally {
        closeModal();
      }
    };
    reader.readAsText(pendingImportFile);
  }

  function handleConfirmOk() {
    if (currentConfirmAction === 'delete') executeDelete();
    else if (currentConfirmAction === 'import') executeImport();
  }

  // Tema
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark');
      themeToggle.textContent = '☀️';
    } else {
      document.body.classList.remove('dark');
      themeToggle.textContent = '🌙';
    }
  }

  function detectSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved || detectSystemTheme();
    applyTheme(theme);
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Event listeners
  btnAdd.addEventListener('click', openModalForAdd);
  btnCancel.addEventListener('click', closeModal);
  modal.addEventListener('close', closeModal);
  entryForm.addEventListener('submit', handleFormSubmit);

  document.body.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');
    if (editBtn) {
      const id = Number(editBtn.getAttribute('data-id'));
      const entry = entries.find(e => e.id === id);
      if (entry) openModalForEdit(entry);
    }
    if (deleteBtn) {
      const id = Number(deleteBtn.getAttribute('data-id'));
      requestDelete(id);
    }
  });

  btnExport.addEventListener('click', exportData);
  btnImport.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      requestImport(e.target.files[0]);
      importFile.value = '';
    }
  });

  btnConfirmCancel.addEventListener('click', closeModal);
  btnConfirmOk.addEventListener('click', handleConfirmOk);
  themeToggle.addEventListener('click', toggleTheme);

  loadFromStorage();
  renderTable();
  loadTheme();
});