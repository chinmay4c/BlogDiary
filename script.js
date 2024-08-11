document.addEventListener('DOMContentLoaded', () => {
    const entryForm = document.getElementById('entry-form');
    const entryList = document.getElementById('entry-list');
    const searchInput = document.getElementById('search');
    const themeToggle = document.getElementById('theme-toggle');

    let entries = JSON.parse(localStorage.getItem('blogEntries')) || [];

    displayEntries();

    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleInput = document.getElementById('entry-title');
        const contentInput = document.getElementById('entry-content');
        const tagsInput = document.getElementById('entry-tags');

        const newEntry = {
            title: titleInput.value,
            content: contentInput.value,
            tags: tagsInput.value.split(',').map(tag => tag.trim()),
            date: new Date().toLocaleString()
        };

        entries.unshift(newEntry);
        saveEntries();
        displayEntries();

        titleInput.value = '';
        contentInput.value = '';
        tagsInput.value = '';
    });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredEntries = entries.filter(entry =>
            entry.title.toLowerCase().includes(searchTerm) ||
            entry.content.toLowerCase().includes(searchTerm) ||
            entry.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        displayEntries(filteredEntries);
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });

    function displayEntries(entriesToDisplay = entries) {
        entryList.innerHTML = '';
        entriesToDisplay.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.classList.add('entry');
            entryElement.innerHTML = `
                <h3>${entry.title}</h3>
                <p>${entry.content}</p>
                <div class="entry-tags">
                    ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <small>${entry.date}</small>
                <button onclick="deleteEntry(${index})">Delete</button>
                <button onclick="editEntry(${index})">Edit</button>
            `;
            entryList.appendChild(entryElement);
        });
    }

    function saveEntries() {
        localStorage.setItem('blogEntries', JSON.stringify(entries));
    }

    window.deleteEntry = (index) => {
        entries.splice(index, 1);
        saveEntries();
        displayEntries();
    };

    window.editEntry = (index) => {
        const entry = entries[index];
        const titleInput = document.getElementById('entry-title');
        const contentInput = document.getElementById('entry-content');
        const tagsInput = document.getElementById('entry-tags');

        titleInput.value = entry.title;
        contentInput.value = entry.content;
        tagsInput.value = entry.tags.join(', ');

        entries.splice(index, 1);
        saveEntries();
        displayEntries();
    };
});