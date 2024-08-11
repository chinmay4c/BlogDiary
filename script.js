// Initialize Dexie
const db = new Dexie('BlogDiaryDB');
db.version(1).stores({
    users: '++id, username, email',
    entries: '++id, userId, title, content, category, tags, date'
});

let currentUser = null;
let simplemde = null;

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const entryForm = document.getElementById('entry-form');
    const entryList = document.getElementById('entry-list');
    const searchInput = document.getElementById('search');
    const themeToggle = document.getElementById('theme-toggle');
    const logoutButton = document.getElementById('logout');
    const authForms = document.getElementById('auth-forms');
    const entrySection = document.getElementById('entry-section');
    const userInfo = document.getElementById('user-info');

    // Initialize SimpleMDE
    simplemde = new SimpleMDE({ element: document.getElementById('entry-content') });

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    entryForm.addEventListener('submit', handleNewEntry);
    searchInput.addEventListener('input', handleSearch);
    themeToggle.addEventListener('click', toggleTheme);
    logoutButton.addEventListener('click', handleLogout);

    
});