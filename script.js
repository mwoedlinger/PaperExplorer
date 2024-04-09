let papersData = [];

document.addEventListener('DOMContentLoaded', function() {
    loadPapers();
    setupEventListeners();
});

function setupEventListeners() {
    const searchBox = document.getElementById('search-box');
    let debounceTimeout;
    searchBox.addEventListener('input', function() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            displayPapers();
        }, 300); // Debounce input to reduce frequent calls
    });

    document.getElementById('start-date').addEventListener('change', displayPapers);
    document.getElementById('end-date').addEventListener('change', displayPapers);
    document.getElementById('sort-options').addEventListener('change', displayPapers);
}

function loadPapers() {
    fetch('papers.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            papersData = Object.values(data);
            displayPapers();
        })
        .catch(error => {
            console.error('Error loading the papers:', error);
            // Implement user feedback here, for example, using a simple alert or a more sophisticated method
            alert('Failed to load papers. Please try again later.');
        });
}

function getSortedAndFilteredPapers() {
    const searchText = document.getElementById('search-box').value.toLowerCase();
    const searchTerms = searchText.split(';').map(term => term.trim());
    const sortOption = document.getElementById('sort-options').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    let filteredPapers = papersData.filter(paper => {
        const paperDate = new Date(paper.publication_date);
        const start = startDate ? new Date(startDate) : new Date(-8640000000000000);
        const end = endDate ? new Date(endDate) : new Date();

        return searchTerms.every(term =>
            paper.title.toLowerCase().includes(term) ||
            paper.authors.some(author => author.toLowerCase().includes(term)) ||
            paper.abstract.toLowerCase().includes(term) ||
            paper.tags.some(tag => tag.toLowerCase().includes(term))
        ) && (paperDate >= start && paperDate <= end);
    });

    if (sortOption === 'date') {
        filteredPapers.sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
    } else if (sortOption === 'upvotes') {
        filteredPapers.sort((a, b) => b.upvotes - a.upvotes);
    }

    return filteredPapers;
}

function displayPapers() {
    const container = document.getElementById('papers-container');
    container.innerHTML = '';

    const papersToDisplay = getSortedAndFilteredPapers();

    papersToDisplay.forEach(paper => {
        const element = document.createElement('div');
        element.className = 'paper';
        element.innerHTML = `
            <a href="${paper.url}"><h3 class="paper-title">${paper.title}</h3></a>
            <div class="paper-authors">${paper.authors.join(', ')}</div>
            <div class="paper-tags">${paper.tags.map(tag => `<span class="paper-tag">${tag}</span>`).join('')}</div>
            <p class="paper-abstract">${paper.abstract}</p>
            <div class="paper-meta">
                <span class="meta-date">Date: ${paper.publication_date}</span>
                <span class="meta-upvotes">Votes: ${paper.upvotes}</span>
            </div>
        `;
        container.appendChild(element);
    });
}
