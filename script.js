let papersData = [];
let debounceTimer;
let currentPage = 1;
const papersPerPage = 50; // Adjust based on your preference
let totalPapers = 0;


document.addEventListener('DOMContentLoaded', function() {
    loadPapers();
    document.getElementById('start-date').addEventListener('change', displayPapers);
    document.getElementById('end-date').addEventListener('change', displayPapers);
});

document.getElementById('sort-options').addEventListener('change', function() {
    displayPapers();
});

document.getElementById('search-box').addEventListener('input', function() {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(displayPapers, 300); // Delay search to reduce load
});

function loadPapers() {
    // Check for cached data
    const cachedData = localStorage.getItem('papersData');
    if (cachedData) {
        papersData = JSON.parse(cachedData);
        displayPapers();
        return;
    }

    fetch('papers.json')
        .then(response => response.json())
        .then(data => {
            papersData = Object.values(data);
            // Cache the fetched data
            localStorage.setItem('papersData', JSON.stringify(papersData));
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

        const paperContent = paper.title.toLowerCase() + ' ' +
                             paper.authors.join(', ').toLowerCase() + ' ' +
                             paper.abstract.toLowerCase() + ' ' +
                             paper.tags.join(', ').toLowerCase();

        return searchTerms.every(term => paperContent.includes(term)) &&
               (paperDate >= start && paperDate <= end);
    });

    if (sortOption === 'date') {
        filteredPapers.sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
    } else if (sortOption === 'upvotes') {
        filteredPapers.sort((a, b) => b.upvotes - a.upvotes);
    }

    return filteredPapers;
}

function createPaperElement(paper) {
    const element = document.createElement('div');
    element.className = 'paper';

    let authorsHTML = paper.authors.map(author => `<span class="paper-author">${author}</span>`).join(', ');
    let tagsHTML = paper.tags.map(tag => `<span class="paper-tag">${tag}</span>`).join(' ');

    element.innerHTML = `
        <a href="${paper.url}" target="_blank"><h3 class="paper-title">${paper.title}</h3></a>
        <div class="paper-authors">${authorsHTML}</div>
        <div class="paper-tags">${tagsHTML}</div>
        <p class="paper-abstract">${paper.abstract}</p> <!-- Ensure this is not inside a clickable span -->
        <div class="paper-meta">
            <span class="meta-date">Date: ${paper.publication_date}</span>
            <span class="meta-upvotes">Votes: ${paper.upvotes}</span>
        </div>
    `;

    // Attach click event listeners for authors and tags to refine search
    attachClickEventsToRefineSearch(element, paper);

    return element;
}

function attachClickEventsToRefineSearch(element, paper) {
    const authors = element.querySelectorAll('.paper-author');
    const tags = element.querySelectorAll('.paper-tag');

    authors.forEach(authorElement => {
        authorElement.addEventListener('click', function() {
            const authorName = authorElement.textContent.slice(0, -2); // Remove the trailing comma and space
            refineSearchWithNewTerm(authorName);
        });
    });

    tags.forEach(tagElement => {
        tagElement.addEventListener('click', function() {
            refineSearchWithNewTerm(tagElement.textContent);
        });
    });
}

function refineSearchWithNewTerm(term) {
    const currentSearch = document.getElementById('search-box').value;
    document.getElementById('search-box').value = currentSearch ? `${currentSearch}; ${term}` : term;
    displayPapers();
}


function displayPapers() {
    const container = document.getElementById('papers-container');
    container.innerHTML = ''; // Clear current papers

    const papersToDisplay = getSortedAndFilteredPapers();
    totalPapers = papersToDisplay.length;
    const startIndex = (currentPage - 1) * papersPerPage;
    const endIndex = startIndex + papersPerPage;
    const paginatedPapers = papersToDisplay.slice(startIndex, endIndex);

    const fragment = document.createDocumentFragment();

    paginatedPapers.forEach(paper => {
        const element = createPaperElement(paper); // Assuming this function is defined as previously discussed
        fragment.appendChild(element);
    });

    container.appendChild(fragment);
    updatePaginationControls();
}

function updatePaginationControls() {
    const totalPages = Math.ceil(totalPapers / papersPerPage);
    document.getElementById('current-page').textContent = `${currentPage} / ${totalPages}`;

    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

document.getElementById('prev-page').addEventListener('click', function() {
    if (currentPage > 1) {
        currentPage--;
        displayPapers();
    }
});

document.getElementById('next-page').addEventListener('click', function() {
    const totalPages = Math.ceil(totalPapers / papersPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayPapers();
    }
});

function addClickEventsToRefineSearch(element) {
    const authors = element.querySelectorAll('.paper-author');
    const tags = element.querySelectorAll('.paper-tag');

    authors.forEach(author => {
        author.onclick = function() {
            const currentSearch = document.getElementById('search-box').value;
            const authorText = author.textContent.slice(0, -2); // Remove trailing comma and space
            document.getElementById('search-box').value = currentSearch ? `${currentSearch}; ${authorText}` : authorText;
            displayPapers();
        };
    });

    tags.forEach(tag => {
        tag.onclick = function() {
            const currentSearch = document.getElementById('search-box').value;
            document.getElementById('search-box').value = currentSearch ? `${currentSearch}; ${tag.textContent}` : tag.textContent;
            displayPapers(); 
        };
    });
}
