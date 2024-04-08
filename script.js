let papersData = [];

document.addEventListener('DOMContentLoaded', function() {
    loadPapers();
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
    fetch('papers.json')
        .then(response => response.json())
        .then(data => {
            papersData = Object.values(data);
            displayPapers();
        })
        .catch(error => console.error('Error loading the papers:', error));
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
        const end = endDate ? new Date(endDate) : new Date(8640000000000000);

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
            <h3 class="paper-title">${paper.title}</h3>
            <div class="paper-authors"></div> <!-- Container for authors -->
            <div class="paper-tags"></div> <!-- Container for tags -->
            <p class="paper-abstract">${paper.abstract}</p>
            <div class="paper-meta">
                <span class="meta-date">Published: ${paper.publication_date}</span>
                <span class="meta-upvotes">Upvotes: ${paper.upvotes}</span>
                <span class="meta-url">Url: <a href=${paper.url} class="paper-url">${paper.url}</a></span>
            </div>
        `;
        const authorsContainer = element.querySelector('.paper-authors');
        paper.authors.forEach(author => {
            const authorElement = document.createElement('span');
            authorElement.className = 'paper-author';
            authorElement.textContent = author + ', ';
            authorElement.onclick = function() {
                const currentSearch = document.getElementById('search-box').value;
                document.getElementById('search-box').value = currentSearch ? `${currentSearch}; ${author}` : author;
                displayPapers();
            };
            authorsContainer.appendChild(authorElement);
        });

        const tagsContainer = element.querySelector('.paper-tags');
        paper.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'paper-tag';
            tagElement.textContent = tag;
            tagElement.onclick = function() {
                const currentSearch = document.getElementById('search-box').value;
                document.getElementById('search-box').value = currentSearch ? `${currentSearch}; ${tag}` : tag;
                displayPapers(); 
            };            
            tagsContainer.appendChild(tagElement);
        });

        container.appendChild(element);
    });
}