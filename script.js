let papersData = [];

document.addEventListener('DOMContentLoaded', function() {
    loadPapers();
    // Adding event listeners for the date inputs
    document.getElementById('start-date').addEventListener('change', displayPapers);
    document.getElementById('end-date').addEventListener('change', displayPapers);
});

document.getElementById('sort-options').addEventListener('change', function() {
    displayPapers();
});

document.getElementById('search-box').addEventListener('input', function() {
    displayPapers();
});

function loadPapers() {
    fetch('papers_old.json')
        .then(response => response.json())
        .then(data => {
            papersData = Object.values(data);
            displayPapers();
        })
        .catch(error => console.error('Error loading the papers:', error));
}

function getSortedAndFilteredPapers() {
    const searchText = document.getElementById('search-box').value.toLowerCase();
    const sortOption = document.getElementById('sort-options').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    let filteredPapers = papersData.filter(paper => {
        const paperDate = new Date(paper.publication_date);
        const start = startDate ? new Date(startDate) : new Date(-8640000000000000); // Min date if start date is not set
        const end = endDate ? new Date(endDate) : new Date(8640000000000000); // Max date if end date is not set

        return (paper.title.toLowerCase().includes(searchText) ||
                paper.authors.some(author => author.toLowerCase().includes(searchText)) ||
                paper.abstract.toLowerCase().includes(searchText)) &&
                (paperDate >= start && paperDate <= end);
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
        element.className = 'paper'; // Added a class for the entire paper element
        element.innerHTML = `
            <h3 class="paper-title">${paper.title}</h3>
            <p class="paper-authors">${paper.authors.join(', ')}</p>
            <p class="paper-abstract">${paper.abstract}</p>
            <div class="paper-meta"> <!-- Container for meta information -->
                <span>Published: ${paper.publication_date}</span>
                <span>Upvotes: ${paper.upvotes}</span>
                <span>Url: <a href=${paper.url} class="paper-url">${paper.url}</a></span>
            </div>
        `;
        container.appendChild(element);
    });
}

