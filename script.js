let papersData = [];
let debounceTimer;
let currentPage = 1;
const papersPerPage = 50;
let totalPapers = 0;

window.onload = function() {
    loadPapers();
    setupEventListeners();
};

window.addEventListener('resize', debounce(adjustPapersContainer, 100));

function changePage(direction) {
    const totalPages = Math.ceil(totalPapers / papersPerPage);
    currentPage += direction;
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    displayPapers();
}

function setupEventListeners() {
    document.getElementById('start-date').addEventListener('change', displayPapers);
    document.getElementById('end-date').addEventListener('change', displayPapers);
    document.getElementById('sort-options').addEventListener('change', displayPapers);
    document.getElementById('search-box').addEventListener('input', function() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(displayPapers, 300);
    });
    document.getElementById('prev-page').addEventListener('click', changePage.bind(null, -1));
    document.getElementById('next-page').addEventListener('click', changePage.bind(null, 1));
}

function loadPapers() {
    const cachedData = localStorage.getItem('papersData');
    if (cachedData) {
        papersData = JSON.parse(cachedData);
        displayPapers();
    } else {
        fetch('papers.json')
            .then(response => response.json())
            .then(data => {
                papersData = Object.values(data);
                localStorage.setItem('papersData', JSON.stringify(papersData));
                displayPapers();
            })
            .catch(error => console.error('Error loading the papers:', error));
    }
}

function displayPapers() {
    const container = document.getElementById('papers-container');
    container.innerHTML = '';
    const papersToDisplay = getSortedAndFilteredPapers();
    totalPapers = papersToDisplay.length;
    const startIndex = (currentPage - 1) * papersPerPage;
    const endIndex = startIndex + papersPerPage;
    const paginatedPapers = papersToDisplay.slice(startIndex, endIndex);
    const fragment = document.createDocumentFragment();

    paginatedPapers.slice(0, papersPerPage).forEach(paper => {
        fragment.appendChild(createPaperElement(paper));
    });

    container.appendChild(fragment);
    updatePaginationControls();
    adjustPapersContainer(); // Adjust container size after display
}

function getSortedAndFilteredPapers() {
    const searchText = document.getElementById('search-box').value.toLowerCase();
    const searchTerms = searchText.split(';').map(term => term.trim());
    const sortOption = document.getElementById('sort-options').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    return papersData.filter(paper => {
        const paperDate = new Date(paper.publication_date);
        const start = startDate ? new Date(startDate) : new Date(-8640000000000000);
        const end = endDate ? new Date(endDate) : new Date(8640000000000000);
        const paperContent = paper.title.toLowerCase() + ' ' +
                             paper.authors.join(', ').toLowerCase() + ' ' +
                             paper.abstract.toLowerCase() + ' ' +
                             paper.tags.join(', ').toLowerCase();
        return searchTerms.every(term => paperContent.includes(term)) &&
               (paperDate >= start && paperDate <= end);
    })
    .sort((a, b) => {
        if (sortOption === 'date') {
            return new Date(b.publication_date) - new Date(a.publication_date);
        } else if (sortOption === 'upvotes') {
            return b.upvotes - a.upvotes;
        }
    });
}

function createPaperElement(paper) {
    const element = document.createElement('div');
    element.className = 'paper';
    element.innerHTML = `
        <a href="${paper.url}" target="_blank"><h3 class="paper-title">${paper.title}</h3></a>
        <div class="paper-authors">${paper.authors.map(author => `<span class="paper-author">${author}</span>`).join(', ')}</div>
        <div class="paper-tags">${paper.tags.map(tag => `<span class="paper-tag">${tag}</span>`).join(' ')}</div>
        <p class="paper-abstract">${paper.abstract}</p>
        <div class="paper-meta">
            <span class="meta-date">Date: ${paper.publication_date}</span>
            <span class="meta-upvotes">Votes: ${paper.upvotes}</span>
        </div>
    `;
    attachClickEventsToRefineSearch(element);
    return element;
}

function attachClickEventsToRefineSearch(element) {
    element.querySelectorAll('.paper-author, .paper-tag').forEach(item => {
        item.addEventListener('click', function() {
            refineSearchWithNewTerm(item.textContent);
        });
    });
}

function refineSearchWithNewTerm(term) {
    const currentSearch = document.getElementById('search-box').value;
    document.getElementById('search-box').value = currentSearch ? `${currentSearch}; ${term}` : term;
    displayPapers();
}

function adjustPapersContainer() {
    const searchContainer = document.getElementById('search-container');
    const paginationControls = document.getElementById('pagination-controls');
    const papersContainer = document.getElementById('papers-container');

    papersContainer.style.top = `${searchContainer.offsetHeight + 40}px`;
    papersContainer.style.bottom = `${paginationControls.offsetHeight + 30}px`;
}

function updatePaginationControls() {
    const totalPages = Math.ceil(totalPapers / papersPerPage);
    document.getElementById('current-page').textContent = `${currentPage} / ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

// Debounce function to optimize resize event handling
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}