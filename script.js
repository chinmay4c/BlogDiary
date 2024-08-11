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

    // Check if user is already logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showLoggedInState();
    }

    async function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const user = await db.users.where('email').equals(email).first();
            if (user && user.password === password) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showLoggedInState();
            } else {
                alert('Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const existingUser = await db.users.where('email').equals(email).first();
            if (existingUser) {
                alert('Email already registered');
                return;
            }

            const userId = await db.users.add({
                username,
                email,
                password // Note: In a real application, you should hash the password
            });

            currentUser = { id: userId, username, email };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showLoggedInState();
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration');
        }
    }

    async function handleNewEntry(e) {
        e.preventDefault();
        const title = document.getElementById('entry-title').value;
        const category = document.getElementById('entry-category').value;
        const content = simplemde.value();
        const tags = document.getElementById('entry-tags').value.split(',').map(tag => tag.trim());

        try {
            await db.entries.add({
                userId: currentUser.id,
                title,
                content,
                category,
                tags,
                date: new Date().toISOString()
            });

            entryForm.reset();
            simplemde.value('');
            displayEntries();
            updateStatistics();
        } catch (error) {
            console.error('New entry error:', error);
            alert('An error occurred while saving the entry');
        }
    }

    async function displayEntries() {
        if (!currentUser) return;

        try {
            const entries = await db.entries.where('userId').equals(currentUser.id).reverse().toArray();
            entryList.innerHTML = '';

            entries.forEach(entry => {
                const entryElement = document.createElement('div');
                entryElement.classList.add('entry');
                entryElement.innerHTML = `
                    <h3>${entry.title}</h3>
                    <div class="entry-meta">
                        <span class="entry-category">${entry.category}</span>
                        <small>${new Date(entry.date).toLocaleString()}</small>
                    </div>
                    <div class="entry-content">${marked(entry.content)}</div>
                    <div class="entry-tags">
                        ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <button onclick="editEntry(${entry.id})">Edit</button>
                    <button onclick="deleteEntry(${entry.id})">Delete</button>
                `;
                entryList.appendChild(entryElement);
            });
        } catch (error) {
            console.error('Display entries error:', error);
            alert('An error occurred while fetching entries');
        }
    }

    async function handleSearch() {
        if (!currentUser) return;

        const searchTerm = searchInput.value.toLowerCase();
        try {
            const entries = await db.entries.where('userId').equals(currentUser.id).toArray();
            const filteredEntries = entries.filter(entry =>
                entry.title.toLowerCase().includes(searchTerm) ||
                entry.content.toLowerCase().includes(searchTerm) ||
                entry.category.toLowerCase().includes(searchTerm) ||
                entry.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );

            displayFilteredEntries(filteredEntries);
        } catch (error) {
            console.error('Search error:', error);
            alert('An error occurred while searching entries');
        }
    }

    function displayFilteredEntries(entries) {
        entryList.innerHTML = '';
        entries.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.classList.add('entry');
            entryElement.innerHTML = `
                <h3>${entry.title}</h3>
                <div class="entry-meta">
                    <span class="entry-category">${entry.category}</span>
                    <small>${new Date(entry.date).toLocaleString()}</small>
                </div>
                <div class="entry-content">${marked(entry.content)}</div>
                <div class="entry-tags">
                    ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <button onclick="editEntry(${entry.id})">Edit</button>
                <button onclick="deleteEntry(${entry.id})">Delete</button>
            `;
            entryList.appendChild(entryElement);
        });
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    }

    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showLoggedOutState();
    }

    function showLoggedInState() {
        authForms.style.display = 'none';
        entrySection.style.display = 'block';
        userInfo.style.display = 'block';
        logoutButton.style.display = 'inline-block';
        document.getElementById('username').textContent = currentUser.username;
        displayEntries();
        updateStatistics();
        displayCategories();
    }

    function showLoggedOutState() {
        authForms.style.display = 'block';
        entrySection.style.display = 'none';
        userInfo.style.display = 'none';
        logoutButton.style.display = 'none';
    }

    async function updateStatistics() {
        if (!currentUser) return;

        try {
            const entries = await db.entries.where('userId').equals(currentUser.id).toArray();
            const totalEntries = entries.length;
            const totalWords = entries.reduce((sum, entry) => sum + entry.content.split(/\s+/).length, 0);

            document.getElementById('total-entries').textContent = totalEntries;
            document.getElementById('total-words').textContent = totalWords;
        } catch (error) {
            console.error('Statistics update error:', error);
        }
    }

    async function displayCategories() {
        if (!currentUser) return;

        try {
            const entries = await db.entries.where('userId').equals(currentUser.id).toArray();
            const categories = [...new Set(entries.map(entry => entry.category))];

            const categoryList = document.getElementById('category-list');
            categoryList.innerHTML = '';

            categories.forEach(category => {
                const li = document.createElement('li');
                li.textContent = category;
                li.addEventListener('click', () => filterByCategory(category));
                categoryList.appendChild(li);
            });
        } catch (error) {
            console.error('Categories display error:', error);
        }
    }

    async function filterByCategory(category) {
        if (!currentUser) return;

        try {
            const entries = await db.entries.where('userId').equals(currentUser.id).toArray();
            const filteredEntries = entries.filter(entry => entry.category === category);
            displayFilteredEntries(filteredEntries);
        } catch (error) {
            console.error('Category filter error:', error);
            alert('An error occurred while filtering entries');
        }
    }

    window.editEntry = async (entryId) => {
        try {
            const entry = await db.entries.get(entryId);
            document.getElementById('entry-title').value = entry.title;
            document.getElementById('entry-category').value = entry.category;
            simplemde.value(entry.content);
            document.getElementById('entry-tags').value = entry.tags.join(', ');

            // Change form submission to update instead of add
            entryForm.onsubmit = async (e) => {
                e.preventDefault();
                entry.title = document.getElementById('entry-title').value;
                entry.category = document.getElementById('entry-category').value;
                entry.content = simplemde.value();
                entry.tags = document.getElementById('entry-tags').value.split(',').map(tag => tag.trim());

                await db.entries.update(entryId, entry);
                entryForm.reset();
                simplemde.value('');
                displayEntries();
                updateStatistics();
                // Reset form submission to add new entries
                entryForm.onsubmit = handleNewEntry;
            };
        } catch (error) {
            console.error('Edit entry error:', error);
            alert('An error occurred while editing the entry');
        }
    };

    window.deleteEntry = async (entryId) => {
        if (confirm('Are you sure you want to delete this entry?')) {
            try {
                await db.entries.delete(entryId);
                displayEntries();
                updateStatistics();
            } catch (error) {
                console.error('Delete entry error:', error);
                alert('An error occurred while deleting the entry');
            }
        }
    };
});