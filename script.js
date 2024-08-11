document.addEventListener('DOMContentLoaded', () => {
    const entryForm = document.getElementById('entry-form');
    const entryList = document.getElementById('entry-list');
    const searchInput = document.getElementById('search');
    const themeToggle = document.getElementById('theme-toggle');

    let entries = JSON.parse(localStorage.getItem('blogEntries')) || [];

    // Initialize Quill rich text editor
    const quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['clean']
            ]
        }
    });

    displayEntries();

    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleInput = document.getElementById('entry-title');
        const categoryInput = document.getElementById('entry-category');
        const tagsInput = document.getElementById('entry-tags');
        const imageInput = document.getElementById('entry-image');

        const newEntry = {
            title: titleInput.value,
            category: categoryInput.value,
            content: quill.root.innerHTML,
            tags: tagsInput.value.split(',').map(tag => tag.trim()),
            date: new Date().toLocaleString(),
            image: null
        };

        if (imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                newEntry.image = e.target.result;
                saveNewEntry(newEntry);
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            saveNewEntry(newEntry);
        }
    });

    function saveNewEntry(newEntry) {
        entries.unshift(newEntry);
        saveEntries();
        displayEntries();

        // Reset form
        entryForm.reset();
        quill.setContents([]);
    }

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredEntries = entries.filter(entry =>
            entry.title.toLowerCase().includes(searchTerm) ||
            entry.content.toLowerCase().includes(searchTerm) ||
            entry.category.toLowerCase().includes(searchTerm) ||
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
                <div class="entry-meta">
                    <span class="entry-category">${entry.category}</span>
                    <small>${entry.date}</small>
                </div>
                <div class="entry-content">${entry.content}</div>
                ${entry.image ? `<img src="${entry.image}" alt="Entry image" class="entry-image">` : ''}
                <div class="entry-tags">
                    ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
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
        if (confirm('Are you sure you want to delete this entry?')) {
            entries.splice(index, 1);
            saveEntries();
            displayEntries();
        }
    };

    window.editEntry = (index) => {
        const entry = entries[index];
        const titleInput = document.getElementById('entry-title');
        const categoryInput = document.getElementById('entry-category');
        const tagsInput = document.getElementById('entry-tags');

        titleInput.value = entry.title;
        categoryInput.value = entry.category;
        quill.root.innerHTML = entry.content;
        tagsInput.value = entry.tags.join(', ');

        entries.splice(index, 1);
        saveEntries();
        displayEntries();

        window.scrollTo(0, 0);
    };
});