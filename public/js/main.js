const API_URL = '/api/entries';
const AUTH_URL = '/api/auth';

// Elements
const authSection = document.getElementById('authSection');
const mainContent = document.getElementById('mainContent');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authToggleBtn = document.getElementById('authToggleBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userDisplay = document.getElementById('userDisplay');

const entryForm = document.getElementById('entryForm');
const entriesList = document.getElementById('entriesList');
const searchBtn = document.getElementById('searchBtn');
const filterBtn = document.getElementById('filterBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const cancelBtn = document.getElementById('cancelBtn');

let isEditing = false;
let userToken = localStorage.getItem('token');
let userData = JSON.parse(localStorage.getItem('user'));

// --- AUTH LOGIC ---

function updateUI() {
    if (userToken) {
        authSection.classList.add('hidden');
        mainContent.classList.remove('hidden');
        userDisplay.innerText = `Привіт, ${userData.username}`;
        userDisplay.classList.remove('hidden');
        fetchEntries();
    } else {
        authSection.classList.remove('hidden');
        mainContent.classList.add('hidden');
        userDisplay.classList.add('hidden');
    }
}

authToggleBtn.addEventListener('click', () => {
    const isLoginVisible = !loginForm.classList.contains('hidden');
    if (isLoginVisible) {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        document.getElementById('authSubtitle').innerText = 'Створіть новий акаунт';
        document.getElementById('authToggleText').innerText = 'Вже є акаунт?';
        authToggleBtn.innerText = 'Увійти';
    } else {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        document.getElementById('authSubtitle').innerText = 'Будь ласка, увійдіть у свій акаунт';
        document.getElementById('authToggleText').innerText = 'Немає акаунту?';
        authToggleBtn.innerText = 'Зареєструватися';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            userToken = data.token;
            userData = data;
            updateUI();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Помилка входу');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const res = await fetch(`${AUTH_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            userToken = data.token;
            userData = data;
            updateUI();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Помилка реєстрації');
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    userToken = null;
    userData = null;
    updateUI();
});

// --- API HELPER ---

async function apiRequest(url, options = {}) {
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${userToken}`
    };
    const res = await fetch(url, options);
    if (res.status === 401) {
        logoutBtn.click();
        throw new Error('Unauthorized');
    }
    return res;
}

// --- DIARY LOGIC ---

async function fetchEntries(query = '') {
    try {
        const res = await apiRequest(`${API_URL}${query}`);
        const entries = await res.json();
        renderEntries(entries);
    } catch (error) {
        console.error('Помилка завантаження:', error);
    }
}

function renderEntries(entries) {
    if (entries.length === 0) {
        entriesList.innerHTML = '<div class="text-gray-500 text-center py-10 bg-white rounded-xl">Записів ще немає. Створіть свій перший запис!</div>';
        return;
    }

    entriesList.innerHTML = entries.map(entry => `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 entry-card">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="text-lg font-bold text-gray-800">${entry.title}</h3>
                    <p class="text-xs text-gray-400">${new Date(entry.date).toLocaleDateString('uk-UA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div class="flex space-x-1">
                    <button onclick="editEntry('${entry._id}')" class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteEntry('${entry._id}')" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p class="text-gray-600 mb-4 whitespace-pre-wrap">${entry.content}</p>
            <div class="flex flex-wrap gap-2">
                ${entry.tags.map(tag => `<span class="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-semibold cursor-pointer hover:bg-indigo-100" onclick="filterByTag('${tag}')">#${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

entryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('entryId').value;
    const data = {
        title: document.getElementById('title').value,
        content: document.getElementById('content').value,
        tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t),
        date: document.getElementById('date').value || new Date()
    };

    try {
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/${id}` : API_URL;
        
        const res = await apiRequest(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            resetForm();
            fetchEntries();
        } else {
            const err = await res.json();
            alert(`Помилка: ${err.message}`);
        }
    } catch (error) {
        alert('Помилка при збереженні');
    }
});

async function editEntry(id) {
    try {
        const res = await apiRequest(`${API_URL}/${id}`);
        const entry = await res.json();
        
        document.getElementById('entryId').value = entry._id;
        document.getElementById('title').value = entry.title;
        document.getElementById('content').value = entry.content;
        document.getElementById('tags').value = entry.tags.join(', ');
        document.getElementById('date').value = new Date(entry.date).toISOString().split('T')[0];
        
        isEditing = true;
        document.getElementById('formTitle').innerText = 'Редагувати запис';
        document.getElementById('submitBtn').innerText = 'Оновити';
        cancelBtn.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        alert('Помилка завантаження запису');
    }
}

async function deleteEntry(id) {
    if (!confirm('Видалити цей запис?')) return;
    try {
        const res = await apiRequest(`${API_URL}/${id}`, { method: 'DELETE' });
        if (res.ok) fetchEntries();
    } catch (error) {
        alert('Помилка при видаленні');
    }
}

searchBtn.addEventListener('click', () => {
    const tag = document.getElementById('searchTag').value;
    fetchEntries(tag ? `?tag=${tag}` : '');
});

filterBtn.addEventListener('click', () => {
    const date = document.getElementById('filterDate').value;
    fetchEntries(date ? `?date=${date}` : '');
});

resetBtn.addEventListener('click', () => {
    document.getElementById('searchTag').value = '';
    document.getElementById('filterDate').value = '';
    fetchEntries();
});

function filterByTag(tag) {
    document.getElementById('searchTag').value = tag;
    fetchEntries(`?tag=${tag}`);
}

exportBtn.addEventListener('click', async () => {
    try {
        const res = await apiRequest(`${API_URL}/export`);
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diary_export.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert('Помилка експорту');
    }
});

function resetForm() {
    entryForm.reset();
    document.getElementById('entryId').value = '';
    isEditing = false;
    document.getElementById('formTitle').innerText = 'Новий запис';
    document.getElementById('submitBtn').innerText = 'Зберегти';
    cancelBtn.classList.add('hidden');
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
}

cancelBtn.addEventListener('click', resetForm);

// Init
updateUI();
document.getElementById('date').value = new Date().toISOString().split('T')[0];
