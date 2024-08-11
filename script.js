document.addEventListener('DOMContentLoaded', () => {
    const entryForm = document.getElementById('entry-form');
    const entryList = document.getElementById('entry-list');

    // Load entries from local storage
    let entries = JSON.parse(localStorage.getItem('blogEntries')) || [];

    // Display existing entries
    displayEntries();

    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleInput = document.getElementById('entry-title');
        const contentInput = document.getElementById('entry-content');

        const newEntry = {
            title: titleInput.value,
            content: contentInput.value,
            date: new Date().toLocaleString()
        };

        entries.push(newEntry);
        saveEntries();
        displayEntries();

        // Clear form inputs
        titleInput.value = '';
        contentInput.value = '';
    });

    function displayEntries() {
        entryList.innerHTML = '';
        entries.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.classList.add('entry');
            entryElement.innerHTML = `
                <h3>${entry.title}</h3>
                <p>${entry.content}</p>
                <small>${entry.date}</small>
                <button onclick="deleteEntry(${index})">Delete</button>
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
});