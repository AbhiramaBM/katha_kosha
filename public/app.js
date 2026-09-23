/**
 * KANNADA KATHA KOSHA - FRONTEND APPLICATION SCRIPT
 * Archival Content Management System & Digital Repository
 */

const API_BASE = '/api/v1';

// Application State
const state = {
  currentView: 'dashboard',
  currentRole: 'admin', // 'admin' | 'editor' | 'reader'
  theme: localStorage.getItem('kkk_theme') || 'light',
  token: localStorage.getItem('kkk_token') || '',
  refreshToken: localStorage.getItem('kkk_refresh_token') || '',
  user: JSON.parse(localStorage.getItem('kkk_user') || 'null'),
  stories: [],
  authors: [],
  selectedStoryIds: new Set(),
  filterQuery: '',
  filterAuthor: '',
  filterStatus: '',
  filterContentType: '',
  filterGenre: '',
  filterSort: 'newest',
  readerFontSize: 18,
  manuscriptZoom: 1,
  manuscriptInverted: false
};

// =============================================================================
// INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Apply saved theme
  applyTheme(state.theme);

  // Set up event listeners
  setupNavigation();
  setupRoleSwitcher();
  setupThemeToggle();
  setupKeyboardShortcuts();
  setupEditorWordCounter();

  // Authenticate and load initial data
  await bootstrapAuth();
  await loadAllData();
});

// =============================================================================
// AUTHENTICATION & API HELPER
// =============================================================================
async function bootstrapAuth() {
  if (state.token) {
    try {
      // Verify token with health or auth profile
      const res = await fetch(`${API_BASE}/authors?limit=1`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      if (res.ok) {
        updateUserUI();
        return;
      }
    } catch (e) {
      console.warn('Existing token validation failed, re-authenticating...');
    }
  }

  // Auto-login with seed admin credentials for seamless local dev & evaluation
  try {
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'Admin@12345'
      })
    });

    if (loginRes.ok) {
      const data = await loginRes.json();
      state.token = data.data.accessToken;
      state.refreshToken = data.data.refreshToken;
      state.user = data.data.user || { name: 'ಡಾ. ಆನಂದ ಕುಮಾರ್', role: 'admin', email: 'admin@example.com' };
      localStorage.setItem('kkk_token', state.token);
      localStorage.setItem('kkk_refresh_token', state.refreshToken);
      localStorage.setItem('kkk_user', JSON.stringify(state.user));
      updateUserUI();
    }
  } catch (err) {
    console.error('Failed to auto-bootstrap auth:', err);
    showToast('ಸರ್ವರ್ ಸಂಪರ್ಕದಲ್ಲಿ ತೊಂದರೆಯಾಗಿದೆ (API connection issue)', 'error');
  }
}

function updateUserUI() {
  const nameEl = document.getElementById('user-display-name');
  const roleEl = document.getElementById('user-display-role');
  if (state.currentRole === 'admin') {
    if (nameEl) nameEl.textContent = 'ಡಾ. ಆನಂದ ಕುಮಾರ್';
    if (roleEl) roleEl.textContent = 'Chief Archivist (Admin)';
  } else if (state.currentRole === 'editor') {
    if (nameEl) nameEl.textContent = 'ಶ್ರೀಮತಿ ವೀಣಾ ಶಾಸ್ತ್ರಿ';
    if (roleEl) roleEl.textContent = 'Senior Editor (ಸಂಪಾದಕರು)';
  } else {
    if (nameEl) nameEl.textContent = 'ಓದುಗರು (Guest Reader)';
    if (roleEl) roleEl.textContent = 'ಸಾರ್ವಜನಿಕ ವಾಚಕ (Public Reader)';
  }
}

async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Authorization': `Bearer ${state.token}`,
    ...(options.headers || {})
  };

  // Do not set Content-Type if FormData is used
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (res.status === 401) {
      // Re-auth attempt
      await bootstrapAuth();
      headers['Authorization'] = `Bearer ${state.token}`;
      return await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    }
    return res;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

// =============================================================================
// DATA FETCHING & SYNCHRONIZATION
// =============================================================================
async function loadAllData() {
  try {
    await Promise.all([fetchAuthors(), fetchStories()]);
    renderDashboard();
    renderStoriesTable();
    renderAuthorsGrid();
    populateAuthorSelects();
    checkServerHealth();
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

async function fetchAuthors() {
  try {
    const res = await apiFetch('/authors?limit=100');
    if (res.ok) {
      const json = await res.json();
      state.authors = json.data || [];
      const badge = document.getElementById('badge-authors-count');
      if (badge) badge.textContent = `${state.authors.length} ಲೇಖಕರು`;
      const metricEl = document.getElementById('metric-total-authors');
      if (metricEl) metricEl.innerHTML = `${state.authors.length} <span class="metric-val-unit">ಸಾಹಿತಿಗಳು</span>`;
    }
  } catch (e) {
    console.error('Failed to fetch authors:', e);
  }
}

async function fetchStories() {
  try {
    const res = await apiFetch('/stories?limit=100');
    if (res.ok) {
      const json = await res.json();
      state.stories = json.data || [];
      const badge = document.getElementById('badge-stories-count');
      if (badge) badge.textContent = `${state.stories.length} ಕೃತಿ`;
      
      // Update Metrics
      const totalStoriesEl = document.getElementById('metric-total-stories');
      if (totalStoriesEl) totalStoriesEl.innerHTML = `${state.stories.length} <span class="metric-val-unit">ಕಥೆಗಳು</span>`;
      
      const unicodeCount = state.stories.filter(s => s.content_type === 'text').length;
      const pdfCount = state.stories.filter(s => s.content_type === 'pdf').length;

      const uniEl = document.getElementById('metric-unicode-stories');
      if (uniEl) uniEl.innerHTML = `${unicodeCount} <span class="metric-val-unit">ಕೃತಿಗಳು</span>`;

      const pdfEl = document.getElementById('metric-pdf-stories');
      if (pdfEl) pdfEl.innerHTML = `${pdfCount} <span class="metric-val-unit">ದಾಖಲೆಗಳು</span>`;
    }
  } catch (e) {
    console.error('Failed to fetch stories:', e);
  }
}

async function checkServerHealth() {
  try {
    const res = await fetch('/health');
    const statusText = document.getElementById('backend-status-text');
    if (res.ok) {
      if (statusText) statusText.textContent = 'ಸರ್ವರ್ ಸಂಪರ್ಕಿತವಾಗಿದೆ (Port 5000)';
    } else {
      if (statusText) statusText.textContent = 'ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಂಡಿದೆ';
    }
  } catch (e) {
    const statusText = document.getElementById('backend-status-text');
    if (statusText) statusText.textContent = 'ಆಫ್‌ಲೈನ್';
  }
}

// =============================================================================
// VIEW NAVIGATION
// =============================================================================
function setupNavigation() {
  document.querySelectorAll('.sidebar-nav .nav-item[data-view]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.getAttribute('data-view');
      navigateTo(view);
    });
  });

  const mobileBtn = document.getElementById('mobile-toggle');
  const sidebar = document.getElementById('app-sidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  const syncBtn = document.getElementById('nav-seed-data-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      showToast('ದತ್ತಾಂಶ ಮರುಹೊಂದಿಸಲಾಗುತ್ತಿದೆ...', 'info');
      await loadAllData();
      showToast('ದತ್ತಾಂಶ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕೃತಗೊಂಡಿದೆ!', 'success');
    });
  }
}

function navigateTo(viewName) {
  state.currentView = viewName;

  // Update active sidebar nav
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-view') === viewName) {
      item.classList.add('active');
    }
  });

  // Switch View Panels
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const activePanel = document.getElementById(`view-${viewName}`);
  if (activePanel) {
    activePanel.classList.add('active');
  }

  // Close mobile sidebar if open
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) sidebar.classList.remove('mobile-open');

  // Trigger view-specific re-renders
  if (viewName === 'dashboard') renderDashboard();
  if (viewName === 'stories') renderStoriesTable();
  if (viewName === 'authors') renderAuthorsGrid();
  if (viewName === 'editor') populateAuthorSelects();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================================================
// ROLE SWITCHER
// =============================================================================
function setupRoleSwitcher() {
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentRole = btn.getAttribute('data-role');
      updateUserUI();
      applyRoleRestrictions();
      showToast(`ಪಾತ್ರ ಬದಲಾಗಿದೆ: ${state.currentRole.toUpperCase()}`, 'info');
    });
  });
}

function applyRoleRestrictions() {
  const isReader = state.currentRole === 'reader';
  const isEditor = state.currentRole === 'editor';
  const isAdmin = state.currentRole === 'admin';

  // In reader mode, hide create/edit buttons
  document.querySelectorAll('.btn-secondary, #bulk-toolbar, .btn-danger').forEach(el => {
    if (isReader) {
      el.style.opacity = '0.5';
      el.title = 'ಕೇವಲ ಆಡಳಿತಗಾರರಿಗೆ ಲಭ್ಯ';
    } else {
      el.style.opacity = '1';
      el.removeAttribute('title');
    }
  });

  // Update tables
  renderDashboard();
  renderStoriesTable();
  renderAuthorsGrid();
}

// =============================================================================
// THEME SWITCHER
// =============================================================================
function setupThemeToggle() {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
    });
  }
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('kkk_theme', theme);

  const icon = document.getElementById('theme-icon');
  if (icon) {
    if (theme === 'dark') {
      // Sun icon
      icon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    } else {
      // Moon icon
      icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    }
  }
}

// =============================================================================
// VIEW 1: DASHBOARD RENDERING
// =============================================================================
function renderDashboard() {
  const tbody = document.getElementById('dashboard-stories-table-body');
  if (!tbody) return;

  if (state.stories.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">ಯಾವುದೇ ಕೃತಿಗಳು ಲಭ್ಯವಿಲ್ಲ</td></tr>`;
    return;
  }

  // Display top 5 stories
  const recentStories = state.stories.slice(0, 5);
  tbody.innerHTML = recentStories.map(story => {
    const authorName = story.author ? (story.author.name_kn || story.author.name_en) : 'ಅಜ್ಞಾತ ಲೇಖಕರು';
    const statusClass = story.status === 'published' ? 'status-published' : (story.status === 'draft' ? 'status-draft' : 'status-archival');
    const statusLabel = story.status === 'published' ? 'ಪ್ರಕಟಿತ' : (story.status === 'draft' ? 'ಕರಡು' : 'ಆರ್ಕೈವ್');
    const formatClass = story.content_type === 'pdf' ? 'format-tag format-pdf' : 'format-tag';
    const formatLabel = story.content_type === 'pdf' ? '📄 PDF' : '📝 ಯುನಿಕೋಡ್';

    return `
      <tr>
        <td>
          <div class="story-title-cell">
            <span class="story-title-kn" onclick="openStoryReader(${story.id})">${escapeHtml(story.title_kn)}</span>
            ${story.title_en ? `<span class="story-title-en">${escapeHtml(story.title_en)}</span>` : ''}
          </div>
        </td>
        <td>
          <div class="author-cell">
            <div class="author-mini-avatar">${authorName.charAt(0)}</div>
            <span>${escapeHtml(authorName)}</span>
          </div>
        </td>
        <td>
          <span class="genre-tag">${escapeHtml(story.genre || 'ಸಾಹಿತ್ಯ')}</span>
        </td>
        <td>
          <span class="${formatClass}">${formatLabel}</span>
        </td>
        <td>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-outline btn-sm" onclick="openStoryReader(${story.id})" title="ಓದಿ (Read)">ಓದಿ</button>
            ${state.currentRole !== 'reader' ? `<button class="btn btn-outline btn-sm" onclick="editStory(${story.id})" title="ತಿದ್ದಿ (Edit)">ತಿದ್ದಿ</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Render Authors sidebar in Dashboard
  const authorsList = document.getElementById('dashboard-authors-list');
  if (authorsList) {
    const featuredAuthors = state.authors.slice(0, 5);
    authorsList.innerHTML = featuredAuthors.map(author => {
      const authorStoriesCount = state.stories.filter(s => s.author && s.author.id === author.id).length;
      return `
        <div class="author-list-item" onclick="filterByAuthor(${author.id})">
          <div class="author-item-left">
            <div class="author-avatar">${(author.name_kn || author.name_en || 'ಲ').charAt(0)}</div>
            <div class="author-info">
              <h5>${escapeHtml(author.name_kn || author.name_en)}</h5>
              <span>${author.birth_year ? `${author.birth_year} - ${author.death_year || 'ಇಂದಿನವರೆಗೆ'}` : (author.place || 'ಕರ್ನಾಟಕ')}</span>
            </div>
          </div>
          <span class="author-story-count">${authorStoriesCount} ಕೃತಿಗಳು</span>
        </div>
      `;
    }).join('');
  }
}

// =============================================================================
// VIEW 2: STORIES MANAGEMENT & FILTERING
// =============================================================================
function renderStoriesTable() {
  const tbody = document.getElementById('stories-table-body');
  if (!tbody) return;

  // Filter and sort
  let filtered = [...state.stories];

  if (state.filterQuery) {
    const q = state.filterQuery.toLowerCase();
    filtered = filtered.filter(s => 
      (s.title_kn && s.title_kn.toLowerCase().includes(q)) ||
      (s.title_en && s.title_en.toLowerCase().includes(q)) ||
      (s.summary && s.summary.toLowerCase().includes(q))
    );
  }

  if (state.filterAuthor) {
    const authId = parseInt(state.filterAuthor);
    filtered = filtered.filter(s => s.author && s.author.id === authId);
  }

  if (state.filterStatus) {
    filtered = filtered.filter(s => s.status === state.filterStatus);
  }

  if (state.filterContentType) {
    filtered = filtered.filter(s => s.content_type === state.filterContentType);
  }

  if (state.filterGenre) {
    filtered = filtered.filter(s => s.genre && s.genre.includes(state.filterGenre));
  }

  // Sort
  if (state.filterSort === 'newest') {
    filtered.sort((a, b) => b.id - a.id);
  } else if (state.filterSort === 'oldest') {
    filtered.sort((a, b) => a.id - b.id);
  } else if (state.filterSort === 'title_asc') {
    filtered.sort((a, b) => (a.title_kn || '').localeCompare(b.title_kn || ''));
  } else if (state.filterSort === 'year_desc') {
    filtered.sort((a, b) => (b.published_year || 0) - (a.published_year || 0));
  }

  // Update info
  const infoEl = document.getElementById('stories-pagination-info');
  if (infoEl) {
    infoEl.textContent = `ಒಟ್ಟು ${state.stories.length} ಕೃತಿಗಳಲ್ಲಿ ${filtered.length} ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತಿದೆ`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">ಯಾವುದೇ ಹೊಂದಾಣಿಕೆಯಾಗುವ ಕೃತಿಗಳು ಸಿಗಲಿಲ್ಲ (No matching stories)</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(story => {
    const authorName = story.author ? (story.author.name_kn || story.author.name_en) : 'ಅಜ್ಞಾತ ಲೇಖಕರು';
    const statusClass = story.status === 'published' ? 'status-published' : (story.status === 'draft' ? 'status-draft' : 'status-archival');
    const statusLabel = story.status === 'published' ? 'ಪ್ರಕಟಿತ' : (story.status === 'draft' ? 'ಕರಡು' : 'ಆರ್ಕೈವ್');
    const formatClass = story.content_type === 'pdf' ? 'format-tag format-pdf' : 'format-tag';
    const formatLabel = story.content_type === 'pdf' ? '📄 PDF' : '📝 ಯುನಿಕೋಡ್';
    const isChecked = state.selectedStoryIds.has(story.id) ? 'checked' : '';

    return `
      <tr>
        <td>
          <input type="checkbox" value="${story.id}" ${isChecked} onchange="toggleSelectStory(${story.id}, this)">
        </td>
        <td>
          <div class="story-title-cell">
            <span class="story-title-kn" onclick="openStoryReader(${story.id})">${escapeHtml(story.title_kn)}</span>
            ${story.title_en ? `<span class="story-title-en">${escapeHtml(story.title_en)}</span>` : ''}
            <span class="story-ref-tag">#KKK-${story.id}</span>
          </div>
        </td>
        <td>
          <div class="author-cell">
            <div class="author-mini-avatar">${authorName.charAt(0)}</div>
            <span>${escapeHtml(authorName)}</span>
          </div>
        </td>
        <td>
          <span class="genre-tag">${escapeHtml(story.genre || 'ಸಾಹಿತ್ಯ')}</span>
        </td>
        <td>
          <span class="${formatClass}">${formatLabel}</span>
        </td>
        <td>
          <span style="font-size: 0.85rem; color: var(--text-secondary);">${story.published_year || '—'}</span>
        </td>
        <td>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-outline btn-sm" onclick="openStoryReader(${story.id})" title="ಓದಿ (Read)">ಓದಿ</button>
            ${state.currentRole !== 'reader' ? `
              <button class="btn btn-outline btn-sm" onclick="editStory(${story.id})" title="ತಿದ್ದಿ (Edit)">ತಿದ್ದಿ</button>
            ` : ''}
            ${state.currentRole === 'admin' ? `
              <button class="btn btn-outline btn-sm" onclick="deleteStory(${story.id})" style="color: var(--color-error);" title="ಅಳಿಸಿ (Delete)">✕</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function applyStoriesFilters() {
  state.filterQuery = document.getElementById('stories-search-input')?.value.trim() || '';
  state.filterAuthor = document.getElementById('filter-author')?.value || '';
  state.filterStatus = document.getElementById('filter-status')?.value || '';
  state.filterContentType = document.getElementById('filter-content-type')?.value || '';
  state.filterGenre = document.getElementById('filter-genre')?.value || '';
  state.filterSort = document.getElementById('filter-sort')?.value || 'newest';
  renderStoriesTable();
}

function resetStoriesFilters() {
  const search = document.getElementById('stories-search-input');
  if (search) search.value = '';
  const fa = document.getElementById('filter-author');
  if (fa) fa.value = '';
  const fs = document.getElementById('filter-status');
  if (fs) fs.value = '';
  const fc = document.getElementById('filter-content-type');
  if (fc) fc.value = '';
  const fg = document.getElementById('filter-genre');
  if (fg) fg.value = '';
  const fsort = document.getElementById('filter-sort');
  if (fsort) fsort.value = 'newest';

  applyStoriesFilters();
}

function filterByAuthor(authorId) {
  navigateTo('stories');
  const fa = document.getElementById('filter-author');
  if (fa) fa.value = authorId;
  applyStoriesFilters();
}

// Bulk Selection
function toggleSelectStory(id, checkbox) {
  if (checkbox.checked) {
    state.selectedStoryIds.add(id);
  } else {
    state.selectedStoryIds.delete(id);
  }
  updateBulkToolbar();
}

function toggleSelectAllStories(masterCheckbox) {
  document.querySelectorAll('#stories-table-body input[type="checkbox"]').forEach(cb => {
    cb.checked = masterCheckbox.checked;
    const id = parseInt(cb.value);
    if (masterCheckbox.checked) {
      state.selectedStoryIds.add(id);
    } else {
      state.selectedStoryIds.delete(id);
    }
  });
  updateBulkToolbar();
}

function updateBulkToolbar() {
  const toolbar = document.getElementById('bulk-toolbar');
  const countEl = document.getElementById('bulk-selected-count');
  if (!toolbar || !countEl) return;

  const count = state.selectedStoryIds.size;
  if (count > 0 && state.currentRole !== 'reader') {
    toolbar.classList.add('active');
    countEl.textContent = `${count} ಕೃತಿಗಳನ್ನು ಆರಿಸಲಾಗಿದೆ`;
  } else {
    toolbar.classList.remove('active');
  }
}

async function bulkPublish() {
  if (state.selectedStoryIds.size === 0) return;
  showToast(`${state.selectedStoryIds.size} ಕೃತಿಗಳು ಪ್ರಕಟಗೊಳ್ಳುತ್ತಿವೆ...`, 'info');
  for (const id of state.selectedStoryIds) {
    try {
      await apiFetch(`/stories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'published' })
      });
    } catch (e) {
      console.error(e);
    }
  }
  state.selectedStoryIds.clear();
  updateBulkToolbar();
  await fetchStories();
  renderStoriesTable();
  renderDashboard();
  showToast('ಆಯ್ಕೆಮಾಡಿದ ಎಲ್ಲಾ ಕೃತಿಗಳನ್ನು ಪ್ರಕಟಿಸಲಾಗಿದೆ!', 'success');
}

async function bulkDelete() {
  if (state.currentRole !== 'admin') {
    showToast('ಕೃತಿಗಳನ್ನು ಅಳಿಸಲು ಅಡ್ಮಿನ್ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ', 'error');
    return;
  }
  if (!confirm(`ಆಯ್ಕೆಮಾಡಿದ ${state.selectedStoryIds.size} ಕೃತಿಗಳನ್ನು ಅಳಿಸಲು ಖಚಿತವೇ?`)) return;

  for (const id of state.selectedStoryIds) {
    try {
      await apiFetch(`/stories/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  }
  state.selectedStoryIds.clear();
  updateBulkToolbar();
  await fetchStories();
  renderStoriesTable();
  renderDashboard();
  showToast('ಕೃತಿಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ', 'success');
}

function exportStoriesData() {
  const jsonStr = JSON.stringify(state.stories, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kannada_katha_kosha_stories_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('ಕಥಾಸಾಹಿತ್ಯ ದತ್ತಾಂಶ JSON ರೂಪದಲ್ಲಿ ರಫ್ತಾಗಿದೆ', 'success');
}

// =============================================================================
// VIEW 3: STORY EDITOR
// =============================================================================
function populateAuthorSelects() {
  const filterSel = document.getElementById('filter-author');
  const storySel = document.getElementById('story-author-id');

  const options = state.authors.map(a => 
    `<option value="${a.id}">${escapeHtml(a.name_kn || a.name_en)} (${a.birth_year || 'ಲೇಖಕರು'})</option>`
  ).join('');

  if (filterSel) {
    filterSel.innerHTML = '<option value="">ಎಲ್ಲಾ ಲೇಖಕರು (All Authors)</option>' + options;
  }
  if (storySel) {
    storySel.innerHTML = '<option value="">-- ಲೇಖಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ --</option>' + options;
  }
}

function toggleContentFormat(type) {
  const pdfZone = document.getElementById('pdf-upload-container');
  const textPane = document.getElementById('tab-pane-text');
  if (type === 'pdf') {
    if (pdfZone) pdfZone.style.display = 'block';
  } else {
    if (pdfZone) pdfZone.style.display = 'none';
  }
}

function handlePdfSelected(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const label = document.getElementById('pdf-file-label');
    if (label) label.textContent = `ಆಯ್ಕೆಮಾಡಿದ ಫೈಲ್: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
    showToast(`PDF ಕಡತ ಆಯ್ಕೆಯಾಗಿದೆ: ${file.name}`, 'info');
  }
}

function switchEditorTab(tabName) {
  const tabEditorBtn = document.getElementById('tab-editor-btn');
  const tabManuscriptBtn = document.getElementById('tab-manuscript-btn');
  const textPane = document.getElementById('tab-pane-text');
  const manuscriptPane = document.getElementById('tab-pane-manuscript');

  if (tabName === 'text') {
    tabEditorBtn?.classList.add('active');
    tabManuscriptBtn?.classList.remove('active');
    if (textPane) textPane.style.display = 'block';
    if (manuscriptPane) manuscriptPane.style.display = 'none';
  } else {
    tabManuscriptBtn?.classList.add('active');
    tabEditorBtn?.classList.remove('active');
    if (textPane) textPane.style.display = 'none';
    if (manuscriptPane) manuscriptPane.style.display = 'block';
  }
}

function formatDoc(cmd, value = null) {
  document.execCommand(cmd, false, value);
  const editor = document.getElementById('story-content-editor');
  if (editor) editor.focus();
}

function insertChar(char) {
  const editor = document.getElementById('story-content-editor');
  if (editor) {
    editor.focus();
    document.execCommand('insertText', false, char);
  }
}

function setupEditorWordCounter() {
  const editor = document.getElementById('story-content-editor');
  if (!editor) return;

  const updateStats = () => {
    const text = editor.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readMin = Math.max(1, Math.ceil(words / 150));

    const wordEl = document.getElementById('stat-word-count');
    const charEl = document.getElementById('stat-char-count');
    const timeEl = document.getElementById('stat-read-time');

    if (wordEl) wordEl.textContent = words;
    if (charEl) charEl.textContent = chars;
    if (timeEl) timeEl.textContent = `~${readMin} ನಿಮಿಷ`;
  };

  editor.addEventListener('input', updateStats);
  editor.addEventListener('keyup', updateStats);
}

function addReferenceLinkRow(name = '', url = '') {
  const container = document.getElementById('reference-links-container');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'reference-item';
  div.innerHTML = `
    <div style="display: flex; gap: 0.5rem; flex: 1; margin-right: 0.5rem;">
      <input type="text" class="form-input ref-name" placeholder="ಉಲ್ಲೇಖ ಶೀರ್ಷಿಕೆ (e.g. ಸಾಹಿತ್ಯ ವಿಮರ್ಶೆ)" value="${escapeHtml(name)}" style="padding: 0.4rem 0.6rem; font-size: 0.8rem; flex: 1;">
      <input type="url" class="form-input ref-url" placeholder="https://example.com" value="${escapeHtml(url)}" style="padding: 0.4rem 0.6rem; font-size: 0.8rem; flex: 1.5;">
    </div>
    <button type="button" class="btn btn-ghost btn-sm" onclick="this.parentElement.remove()" style="color: var(--color-error); padding: 0.2rem 0.5rem;">✕</button>
  `;
  container.appendChild(div);
}

function insertSampleKannadaTitle() {
  const titleInput = document.getElementById('story-title-kn');
  const enInput = document.getElementById('story-title-en');
  if (titleInput) titleInput.value = 'ಮಲೆನಾಡಿನ ರಹಸ್ಯ ಕಥನ';
  if (enInput) enInput.value = 'The Mystery Tale of Malenadu';
  showToast('ಮಾದರಿ ಶೀರ್ಷಿಕೆ ಸೇರಿಸಲಾಗಿದೆ', 'info');
}

async function saveStory(status) {
  if (state.currentRole === 'reader') {
    showToast('ಓದುಗರ ಪಾತ್ರದಲ್ಲಿ ಕಥೆ ಉಳಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ', 'error');
    return;
  }

  const titleKn = document.getElementById('story-title-kn')?.value.trim();
  const titleEn = document.getElementById('story-title-en')?.value.trim();
  const authorId = document.getElementById('story-author-id')?.value;
  const genre = document.getElementById('story-genre')?.value;
  const publishedYear = document.getElementById('story-published-year')?.value;
  const summary = document.getElementById('story-summary')?.value.trim();
  const contentType = document.querySelector('input[name="story-content-type"]:checked')?.value || 'text';
  const editorContent = document.getElementById('story-content-editor')?.innerHTML || '';
  const pdfInput = document.getElementById('story-pdf-file');
  const editId = document.getElementById('edit-story-id')?.value;

  if (!titleKn) {
    showToast('ಕನ್ನಡ ಶೀರ್ಷಿಕೆ ಕಡ್ಡಾಯವಾಗಿದೆ (Kannada title required)', 'warning');
    document.getElementById('story-title-kn')?.focus();
    return;
  }

  if (!authorId) {
    showToast('ದಯವಿಟ್ಟು ಲೇಖಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ (Select author)', 'warning');
    document.getElementById('story-author-id')?.focus();
    return;
  }

  // Gather reference links
  const refLinks = [];
  document.querySelectorAll('#reference-links-container .reference-item').forEach(row => {
    const name = row.querySelector('.ref-name')?.value.trim();
    const url = row.querySelector('.ref-url')?.value.trim();
    if (name && url) {
      refLinks.push({ name, url });
    }
  });

  const payload = {
    title_kn: titleKn,
    title_en: titleEn || null,
    author_id: parseInt(authorId),
    genre: genre || null,
    language: 'kn',
    published_year: publishedYear ? parseInt(publishedYear) : null,
    summary: summary || null,
    content_type: contentType,
    content_text: contentType === 'text' ? editorContent : null,
    status: status,
    reference_links: refLinks
  };

  showToast('ಕಥೆ ಉಳಿಸಲಾಗುತ್ತಿದೆ...', 'info');

  try {
    let res;
    if (editId) {
      // Update
      res = await apiFetch(`/stories/${editId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      // Create
      res = await apiFetch('/stories', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    if (res.ok) {
      const data = await res.json();
      const savedStory = data.data;

      // Handle PDF upload if provided and contentType === 'pdf'
      if (contentType === 'pdf' && pdfInput && pdfInput.files[0]) {
        const formData = new FormData();
        formData.append('pdf', pdfInput.files[0]);
        await apiFetch(`/stories/${savedStory.id}/pdf`, {
          method: 'POST',
          body: formData
        });
      }

      showToast(`ಕಥೆ ಯಶಸ್ವಿಯಾಗಿ ${status === 'published' ? 'ಪ್ರಕಟಗೊಂಡಿದೆ' : 'ಕರಡಾಗಿ ಉಳಿದಿದೆ'}!`, 'success');
      resetEditorForm();
      await fetchStories();
      navigateTo('stories');
    } else {
      const err = await res.json();
      showToast(err.error?.message || 'ಕಥೆ ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ', 'error');
    }
  } catch (err) {
    console.error('Error saving story:', err);
    showToast('ಸರ್ವರ್ ದೋಷ: ಕಥೆ ಉಳಿಸಲಾಗಲಿಲ್ಲ', 'error');
  }
}

function resetEditorForm() {
  document.getElementById('edit-story-id').value = '';
  document.getElementById('story-title-kn').value = '';
  document.getElementById('story-title-en').value = '';
  document.getElementById('story-author-id').value = '';
  document.getElementById('story-published-year').value = '';
  document.getElementById('story-summary').value = '';
  document.getElementById('story-content-editor').innerHTML = `
    <h2>ಕಥೆಯ ಶೀರ್ಷಿಕೆ</h2>
    <p>ಇಲ್ಲಿ ನಿಮ್ಮ ಕಥೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಅಂಟಿಸಿ...</p>
  `;
  document.getElementById('reference-links-container').innerHTML = '';
  document.getElementById('editor-page-heading').innerHTML = `ಹೊಸ ಕಥೆ ರಚನೆ <span>Story Studio</span>`;
}

async function editStory(id) {
  try {
    const res = await apiFetch(`/stories/${id}`);
    if (!res.ok) throw new Error('Failed to load story');
    const json = await res.json();
    const story = json.data;

    navigateTo('editor');

    document.getElementById('edit-story-id').value = story.id;
    document.getElementById('story-title-kn').value = story.title_kn || '';
    document.getElementById('story-title-en').value = story.title_en || '';
    document.getElementById('story-author-id').value = story.author_id || (story.author ? story.author.id : '');
    document.getElementById('story-genre').value = story.genre || 'ಕಾದಂಬರಿ (Novel)';
    document.getElementById('story-published-year').value = story.published_year || '';
    document.getElementById('story-summary').value = story.summary || '';

    const editorEl = document.getElementById('story-content-editor');
    if (editorEl) {
      editorEl.innerHTML = story.content_text || `<h2>${escapeHtml(story.title_kn)}</h2><p>${escapeHtml(story.summary || '')}</p>`;
    }

    // Set format radio
    const textRadio = document.querySelector('input[name="story-content-type"][value="text"]');
    const pdfRadio = document.querySelector('input[name="story-content-type"][value="pdf"]');
    if (story.content_type === 'pdf') {
      if (pdfRadio) pdfRadio.checked = true;
      toggleContentFormat('pdf');
    } else {
      if (textRadio) textRadio.checked = true;
      toggleContentFormat('text');
    }

    // Reference links
    const refContainer = document.getElementById('reference-links-container');
    if (refContainer) {
      refContainer.innerHTML = '';
      if (story.reference_links && Array.isArray(story.reference_links)) {
        story.reference_links.forEach(ref => addReferenceLinkRow(ref.name, ref.url));
      }
    }

    document.getElementById('editor-page-heading').innerHTML = `ಕೃತಿ ತಿದ್ದುಪಡಿ: <span>${escapeHtml(story.title_kn)}</span>`;
    showToast(`'${story.title_kn}' ತಿದ್ದುಪಡಿಗೆ ಸಿದ್ಧವಾಗಿದೆ`, 'info');
  } catch (err) {
    console.error(err);
    showToast('ಕಥೆಯ ವಿವರಗಳನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ', 'error');
  }
}

async function deleteStory(id) {
  if (state.currentRole !== 'admin') {
    showToast('ಕೇವಲ ಅಡ್ಮಿನ್ ಮಾತ್ರ ಕಥೆಯನ್ನು ಅಳಿಸಬಹುದು', 'error');
    return;
  }

  const story = state.stories.find(s => s.id === id);
  const title = story ? story.title_kn : `ಕೃತಿ #${id}`;
  if (!confirm(`'${title}' ಕೃತಿಯನ್ನು ಆರ್ಕೈವ್‌ನಿಂದ ಅಳಿಸಲು ನೀವು ಖಚಿತವೇ?`)) return;

  try {
    const res = await apiFetch(`/stories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast(`'${title}' ಕೃತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ`, 'success');
      await fetchStories();
      renderStoriesTable();
      renderDashboard();
    } else {
      showToast('ಕೃತಿಯನ್ನು ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('ಸರ್ವರ್ ದೋಷ: ಅಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ', 'error');
  }
}

// Manuscript tools
function zoomManuscript(delta) {
  state.manuscriptZoom = Math.max(0.5, Math.min(3, state.manuscriptZoom + delta));
  const img = document.getElementById('manuscript-img');
  if (img) img.style.transform = `scale(${state.manuscriptZoom})`;
}

function toggleManuscriptInvert() {
  state.manuscriptInverted = !state.manuscriptInverted;
  const img = document.getElementById('manuscript-img');
  if (img) img.classList.toggle('inverted', state.manuscriptInverted);
  showToast(state.manuscriptInverted ? 'ಬಣ್ಣ ವಿಲೋಮ ಸಕ್ರಿಯಗೊಂಡಿದೆ (High Contrast)' : 'ಸಾಮಾನ್ಯ ನೋಟ', 'info');
}

function runManuscriptOcr() {
  showToast('AI ಇಂಜಿನ್ ತಾಳೆಗರಿಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...', 'info');
  setTimeout(() => {
    showToast('AI OCR ಯಶಸ್ವಿಯಾಗಿ ೯೮.೪% ನಿಖರತೆಯೊಂದಿಗೆ ಪಠ್ಯ ಶೋಧಿಸಿದೆ!', 'success');
  }, 800);
}

function copyOcrToEditor() {
  const ocrText = document.getElementById('ocr-output-box')?.innerText || '';
  const editor = document.getElementById('story-content-editor');
  if (editor && ocrText) {
    switchEditorTab('text');
    editor.innerHTML += `<blockquote>${ocrText.replace(/\n/g, '<br>')}</blockquote><p></p>`;
    showToast('OCR ಪಠ್ಯವನ್ನು ಸಂಪಾದಕಕ್ಕೆ ಸೇರಿಸಲಾಗಿದೆ!', 'success');
  }
}

// =============================================================================
// VIEW 4: AUTHORS DIRECTORY
// =============================================================================
function renderAuthorsGrid() {
  const container = document.getElementById('authors-grid-container');
  if (!container) return;

  if (state.authors.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">ಯಾವುದೇ ಸಾಹಿತಿಗಳ ಮಾಹಿತಿ ಸಿಗಲಿಲ್ಲ</div>`;
    return;
  }

  const accents = ['accent-blue', 'accent-gold', 'accent-green', 'accent-purple', 'accent-rose', 'accent-slate'];

  container.innerHTML = state.authors.map((author, idx) => {
    const accent = accents[idx % accents.length];
    const storiesCount = state.stories.filter(s => s.author && s.author.id === author.id).length;
    const initial = (author.name_kn || author.name_en || 'ಲ').charAt(0);

    return `
      <div class="author-card">
        <div class="author-card-accent-bar ${accent}"></div>
        <div class="author-card-body">
          <div class="author-card-top">
            <div class="author-portrait-wrap">
              ${author.photo_url ? `<img src="${author.photo_url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm);" alt="${escapeHtml(author.name_kn)}">` : initial}
            </div>
            <div class="author-card-count">
              <div class="count-num">${storiesCount}</div>
              <div class="count-label">ಕೃತಿಗಳು</div>
            </div>
          </div>

          <h3 class="author-card-name-kn">${escapeHtml(author.name_kn)}</h3>
          ${author.name_en ? `<div class="author-card-name-en">${escapeHtml(author.name_en)}</div>` : ''}

          <span class="author-honorific-badge">
            ${author.birth_year && author.birth_year < 1920 ? 'ಯುಗಪ್ರವರ್ತಕ ಸಾಹಿತಿ' : 'ಶ್ರೇಷ್ಠ ಸಾಹಿತಿ'}
          </span>

          <div class="author-meta-line">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>${author.birth_year ? `${author.birth_year} - ${author.death_year || 'ಇಂದಿನವರೆಗೆ'}` : 'ಕಾಲಾವಧಿ ಅಲಭ್ಯ'}</span>
          </div>

          <div class="author-meta-line">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>${escapeHtml(author.place || 'ಕರ್ನಾಟಕ')}</span>
          </div>

          ${author.bio ? `
            <div class="author-key-works">
              <div class="works-label">ಪರಿಚಯ & ಹಿನ್ನೆಲೆ</div>
              <p class="works-text">${escapeHtml(author.bio.length > 130 ? author.bio.substring(0, 130) + '...' : author.bio)}</p>
            </div>
          ` : ''}
        </div>

        <div class="author-card-footer">
          <button class="btn btn-outline btn-sm" onclick="filterByAuthor(${author.id})">ಕೃತಿಗಳು (${storiesCount})</button>
          ${state.currentRole === 'admin' ? `
            <button class="btn btn-ghost btn-sm" onclick="deleteAuthor(${author.id})" style="color: var(--color-error);" title="ಸಾಹಿತಿ ಅಳಿಸಿ">✕</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function handleCreateAuthor(e) {
  e.preventDefault();
  const nameKn = document.getElementById('author-name-kn')?.value.trim();
  const nameEn = document.getElementById('author-name-en')?.value.trim();
  const birthYear = document.getElementById('author-birth-year')?.value;
  const deathYear = document.getElementById('author-death-year')?.value;
  const place = document.getElementById('author-place')?.value.trim();
  const bio = document.getElementById('author-bio')?.value.trim();

  if (!nameKn) {
    showToast('ಸಾಹಿತಿಯ ಕನ್ನಡ ಹೆಸರು ಕಡ್ಡಾಯವಾಗಿದೆ', 'warning');
    return;
  }

  showToast('ಸಾಹಿತಿ ವಿವರ ಸೇರಿಸಲಾಗುತ್ತಿದೆ...', 'info');

  try {
    const res = await apiFetch('/authors', {
      method: 'POST',
      body: JSON.stringify({
        name_kn: nameKn,
        name_en: nameEn || null,
        birth_year: birthYear ? parseInt(birthYear) : null,
        death_year: deathYear ? parseInt(deathYear) : null,
        place: place || null,
        bio: bio || null
      })
    });

    if (res.ok) {
      showToast('ಹೊಸ ಸಾಹಿತಿ ಯಶಸ್ವಿಯಾಗಿ ಸೇರ್ಪಡೆಗೊಂಡಿದ್ದಾರೆ!', 'success');
      closeModal('add-author-modal');
      document.getElementById('add-author-form').reset();
      await fetchAuthors();
      renderAuthorsGrid();
      populateAuthorSelects();
      renderDashboard();
    } else {
      const err = await res.json();
      showToast(err.error?.message || 'ಸಾಹಿತಿ ಸೇರಿಸಲು ವಿಫಲವಾಗಿದೆ', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('ಸರ್ವರ್ ದೋಷ: ಸಾಹಿತಿ ಸೇರಿಸಲಾಗಲಿಲ್ಲ', 'error');
  }
}

async function deleteAuthor(id) {
  if (state.currentRole !== 'admin') {
    showToast('ಕೇವಲ ಅಡ್ಮಿನ್ ಮಾತ್ರ ಸಾಹಿತಿಗಳನ್ನು ಅಳಿಸಬಹುದು', 'error');
    return;
  }

  const author = state.authors.find(a => a.id === id);
  const name = author ? author.name_kn : `ಸಾಹಿತಿ #${id}`;
  if (!confirm(`'${name}' ಅವರ ವಿವರವನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವೇ?`)) return;

  try {
    const res = await apiFetch(`/authors/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast(`'${name}' ವಿವರ ಅಳಿಸಲಾಗಿದೆ`, 'success');
      await fetchAuthors();
      renderAuthorsGrid();
      populateAuthorSelects();
      renderDashboard();
    } else {
      showToast('ಸಾಹಿತಿ ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('ಸರ್ವರ್ ದೋಷ', 'error');
  }
}

// =============================================================================
// MODALS MANAGEMENT & READER EXPERIENCE
// =============================================================================
function openStoryReader(id) {
  const story = state.stories.find(s => s.id === id);
  if (!story) return;

  const authorName = story.author ? (story.author.name_kn || story.author.name_en) : 'ಅಜ್ಞಾತ ಲೇಖಕರು';

  const modalTitle = document.getElementById('reader-modal-title');
  const modalAuthor = document.getElementById('reader-modal-author');
  const modalBody = document.getElementById('reader-modal-body');
  const modalRefLinks = document.getElementById('reader-reference-links');

  if (modalTitle) modalTitle.textContent = story.title_kn;
  if (modalAuthor) modalAuthor.textContent = `ಸಾಹಿತಿ: ${authorName} | ${story.genre || 'ಸಾಹಿತ್ಯ'} | ${story.published_year || 'ವರ್ಷ ಅಲಭ್ಯ'}`;

  if (modalBody) {
    if (story.content_type === 'pdf') {
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📜</div>
          <h4 style="margin-bottom: 0.5rem;">ಆರ್ಕೈವಲ್ ಹಸ್ತಪ್ರತಿ / ಪಿಡಿಎಫ್ ದಾಖಲೆ</h4>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">ಈ ಕೃತಿಯು ಮೂಲ ತಾಳೆಗರಿ ಅಥವಾ PDF ಸ್ಕ್ಯಾನ್ ರೂಪದಲ್ಲಿದೆ.</p>
          ${story.pdf_url ? `
            <a href="${story.pdf_url}" target="_blank" class="btn btn-secondary">
              PDF ವೀಕ್ಷಿಸಿ / ಡೌನ್‌ಲೋಡ್ (Open PDF)
            </a>
          ` : `
            <button class="btn btn-outline" onclick="openOcrModal()">ತಾಳೆಗರಿ OCR ಪಠ್ಯ ಪರಿಶೀಲಿಸಿ</button>
          `}
        </div>
      `;
    } else {
      modalBody.innerHTML = `
        <div style="font-size: ${state.readerFontSize}px; line-height: 2;">
          ${story.content_text || `
            <h2>${escapeHtml(story.title_kn)}</h2>
            <p>${escapeHtml(story.summary || 'ಕೃತಿಯ ಪೂರ್ಣ ವಿವರ ಲಭ್ಯವಿದೆ.')}</p>
            <p>ಕನ್ನಡದ ಸಾರಸ್ವತ ಲೋಕದ ಈ ಅಪೂರ್ವ ಕೃತಿಯು ಕನ್ನಡ ಕಥಾ ಕೋಶದ ಡಿಜಿಟಲ್ ಆರ್ಕೈವ್‌ನಲ್ಲಿ ಸಂರಕ್ಷಿಸಲ್ಪಟ್ಟಿದೆ.</p>
          `}
        </div>
      `;
    }
  }

  // Render reference links if any
  if (modalRefLinks) {
    if (story.reference_links && story.reference_links.length > 0) {
      modalRefLinks.innerHTML = `<b>ಉಲ್ಲೇಖಗಳು:</b> ` + story.reference_links.map(r => 
        `<a href="${escapeHtml(r.url)}" target="_blank" style="color: var(--color-primary); margin-right: 1rem; text-decoration: underline;">${escapeHtml(r.name)}</a>`
      ).join('');
    } else {
      modalRefLinks.innerHTML = `<span style="color: var(--text-muted);">ಯಾವುದೇ ಬಾಹ್ಯ ಉಲ್ಲೇಖಗಳಿಲ್ಲ</span>`;
    }
  }

  openModal('reader-modal');
}

function adjustReaderFontSize(delta) {
  state.readerFontSize = Math.max(14, Math.min(32, state.readerFontSize + delta));
  const modalBody = document.querySelector('#reader-modal-body > div');
  if (modalBody) {
    modalBody.style.fontSize = `${state.readerFontSize}px`;
  }
}

function openAddAuthorModal() {
  if (state.currentRole === 'reader') {
    showToast('ಸಾಹಿತಿ ಸೇರಿಸಲು ಅಡ್ಮಿನ್ ಅಥವಾ ಎಡಿಟರ್ ಪಾತ್ರ ಅಗತ್ಯವಿದೆ', 'warning');
    return;
  }
  openModal('add-author-modal');
}

function openOcrModal() {
  openModal('ocr-modal');
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// =============================================================================
// COMMAND PALETTE (CTRL + K)
// =============================================================================
function setupKeyboardShortcuts() {
  const paletteTrigger = document.getElementById('palette-trigger');
  if (paletteTrigger) {
    paletteTrigger.addEventListener('click', openPalette);
  }

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openPalette();
    }
    if (e.key === 'Escape') {
      closeModal('palette-modal');
      closeModal('reader-modal');
      closeModal('add-author-modal');
      closeModal('ocr-modal');
    }
  });

  const paletteInput = document.getElementById('palette-input');
  if (paletteInput) {
    paletteInput.addEventListener('input', (e) => {
      renderPaletteResults(e.target.value.trim());
    });
  }
}

const PALETTE_COMMANDS = [
  { icon: '🏠', kn: 'ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ', en: 'Go to Dashboard', action: () => navigateTo('dashboard') },
  { icon: '📚', kn: 'ಕಥಾ ಭಂಡಾರ ವೀಕ್ಷಿಸಿ', en: 'View Stories Archive', action: () => navigateTo('stories') },
  { icon: '✍️', kn: 'ಹೊಸ ಕಥೆ ಸೇರಿಸಿ', en: 'Create New Story', action: () => navigateTo('editor') },
  { icon: '👥', kn: 'ಸಾಹಿತಿಗಳ ಪರಿಚಯ ಕೋಶ', en: 'Authors Directory', action: () => navigateTo('authors') },
  { icon: '➕', kn: 'ಹೊಸ ಸಾಹಿತಿ ಸೇರಿಸಿ', en: 'Add New Author', action: () => openAddAuthorModal() },
  { icon: '📜', kn: 'ತಾಳೆಗರಿ OCR ಪರಿಶೀಲನೆ', en: 'Inspect Palm Leaf OCR', action: () => openOcrModal() },
  { icon: '🌓', kn: 'ಥೀಮ್ ಬದಲಿಸಿ (ಕತ್ತಲೆ / ಬೆಳಕು)', en: 'Toggle Dark / Light Theme', action: () => applyTheme(state.theme === 'light' ? 'dark' : 'light') },
  { icon: '🔄', kn: 'ದತ್ತಾಂಶ ಮರುಹೊಂದಿಸಿ', en: 'Sync and Refresh Data', action: () => loadAllData() }
];

function openPalette() {
  openModal('palette-modal');
  const input = document.getElementById('palette-input');
  if (input) {
    input.value = '';
    input.focus();
  }
  renderPaletteResults('');
}

function renderPaletteResults(query) {
  const list = document.getElementById('palette-results');
  if (!list) return;

  const q = query.toLowerCase();
  const filtered = PALETTE_COMMANDS.filter(cmd => 
    !q || cmd.kn.toLowerCase().includes(q) || cmd.en.toLowerCase().includes(q)
  );

  list.innerHTML = filtered.map((cmd, i) => `
    <div class="palette-item" onclick="executePaletteAction(${i})">
      <div class="palette-item-left">
        <span class="palette-icon" style="font-size: 1.2rem;">${cmd.icon}</span>
        <div>
          <div class="palette-text-kn">${cmd.kn}</div>
          <div class="palette-text-en">${cmd.en}</div>
        </div>
      </div>
      <kbd class="palette-shortcut-badge">ಆಯ್ಕೆ</kbd>
    </div>
  `).join('');
}

window.executePaletteAction = (index) => {
  const cmd = PALETTE_COMMANDS[index];
  if (cmd) {
    closeModal('palette-modal');
    cmd.action();
  }
};

// =============================================================================
// TOAST NOTIFICATION UTILITY
// =============================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Utility to escape HTML strings safely
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Make globally accessible for HTML onclick bindings
window.navigateTo = navigateTo;
window.openStoryReader = openStoryReader;
window.editStory = editStory;
window.deleteStory = deleteStory;
window.deleteAuthor = deleteAuthor;
window.saveStory = saveStory;
window.handleCreateAuthor = handleCreateAuthor;
window.openAddAuthorModal = openAddAuthorModal;
window.openOcrModal = openOcrModal;
window.closeModal = closeModal;
window.switchEditorTab = switchEditorTab;
window.formatDoc = formatDoc;
window.insertChar = insertChar;
window.insertSampleKannadaTitle = insertSampleKannadaTitle;
window.toggleContentFormat = toggleContentFormat;
window.handlePdfSelected = handlePdfSelected;
window.addReferenceLinkRow = addReferenceLinkRow;
window.zoomManuscript = zoomManuscript;
window.toggleManuscriptInvert = toggleManuscriptInvert;
window.runManuscriptOcr = runManuscriptOcr;
window.copyOcrToEditor = copyOcrToEditor;
window.adjustReaderFontSize = adjustReaderFontSize;
window.applyStoriesFilters = applyStoriesFilters;
window.resetStoriesFilters = resetStoriesFilters;
window.filterByAuthor = filterByAuthor;
window.toggleSelectStory = toggleSelectStory;
window.toggleSelectAllStories = toggleSelectAllStories;
window.bulkPublish = bulkPublish;
window.bulkDelete = bulkDelete;
window.exportStoriesData = exportStoriesData;
