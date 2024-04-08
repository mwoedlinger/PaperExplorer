let papersData = [];

document.addEventListener('DOMContentLoaded', function() {
    loadPapers();
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
    const sortOption = document.getElementById('sort-options').value;

    // Filter papers based on search text
    let filteredPapers = papersData.filter(paper =>
        paper.title.toLowerCase().includes(searchText) ||
        paper.authors.some(author => author.toLowerCase().includes(searchText)) ||
        paper.abstract.toLowerCase().includes(searchText)
    );

    // Sort the filtered papers based on the selected sort option
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
        element.innerHTML = `
            <h3>${paper.title}</h3>
            <p>${paper.authors.join(', ')}</p>
            <p>Published: ${paper.publication_date}</p>
            <p>Upvotes: ${paper.upvotes}</p>
            <p>Url: <a href=${paper.url}>${paper.url}</a></p>
            <p>${paper.abstract}</p>
            <hr>
        `;
        container.appendChild(element);
    });
}
