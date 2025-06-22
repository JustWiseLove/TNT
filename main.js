// main.js

// Global variables and initialization
let sortedTopics = [];
let sortedPeople = [];
let sortedArticles = []; // Changed from sortedTruths to sortedArticles

try {
    sortedTopics = topics.slice().sort((a, b) => a.T.localeCompare(b.T));
    sortedPeople = people.slice().sort((a, b) => a.T.localeCompare(b.T));
    sortedArticles = articles.slice().sort((a, b) => a.title.localeCompare(b.title)); // Changed from truths to articles
} catch (e) {
    console.error('Error initializing sorted arrays:', e);
}

// Category mapping for easy access
const categories = {
    'topics': sortedTopics,
    'people': sortedPeople,
    'articles': sortedArticles // Changed from truths to articles
};

// Debounce timeout for search input
let debounceTimeout;

// Hamburger Menu Functions
function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    const hamburger = menuId === 'nav-menu-left' ? document.querySelector('.hamburger-left') : document.querySelector('.hamburger-right');
    if (menu && hamburger) {
        const isActive = menu.classList.contains('active');
        menu.classList.toggle('active', !isActive);
        hamburger.classList.toggle('active', !isActive);
        hamburger.setAttribute('aria-expanded', !isActive);
    }
}

// Closes hamburger menus when clicking outside
function closeMenusOnOutsideClick(event) {
    const menus = document.querySelectorAll('.nav-menu-left, .nav-menu-right');
    const hamburgers = document.querySelectorAll('.hamburger-left, .hamburger-right');
    let clickInside = false;
    hamburgers.forEach(hamburger => {
        if (hamburger.contains(event.target)) clickInside = true;
    });
    menus.forEach(menu => {
        if (!clickInside && !menu.contains(event.target)) {
            menu.classList.remove('active');
            const hamburger = menu.id === 'nav-menu-left' ? document.querySelector('.hamburger-left') : document.querySelector('.hamburger-right');
            if (hamburger) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        }
    });
}

// Navigation Functions
function goToHome() {
    window.location.href = 'index.html';
}

// Populate article list (replaces dropdown population)
function populateArticleList() { // Changed from populateTruthList to populateArticleList
    const container = document.getElementById('articles'); // Changed from truths to articles
    if (!container) return;
    container.innerHTML = '';
    sortedArticles.forEach((article, index) => { // Changed from truths to articles
        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'item';

        const itemButton = document.createElement('button');
        itemButton.className = 'item-button';
        itemButton.textContent = article.title; // Changed from truth to article

        const content = document.createElement('div');
        content.className = 'content';
        content.innerHTML = article.content || ''; // Changed from truth to article
        content.style.display = 'none';

        itemWrapper.appendChild(itemButton);
        itemWrapper.appendChild(content);
        container.appendChild(itemWrapper);

        itemButton.addEventListener('click', () => {
            console.log(`Clicked ${article.title}, isOpen: ${content.style.display === 'block'}`); // Changed from truth to article
            const isOpen = content.style.display === 'block';
            document.querySelectorAll('.content').forEach(c => c.style.display = 'none');
            content.style.display = isOpen ? 'none' : 'block';
        });
    });
}

// Display article list (no longer needed, handled by showTab)
function displayArticle() { // Changed from displayTruth to displayArticle
    // This function is no longer needed as articles are now toggled via showTab
}

// Tab Management Functions
function resetView() {
    console.log('Resetting view');
    const searchResults = document.getElementById('search-results');
    if (searchResults) searchResults.remove();
    const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';

    Object.keys(categories).forEach(category => {
        const itemList = document.getElementById(category);
        if (!itemList) return;
        itemList.innerHTML = '';
        categories[category].forEach(item => {
            if (!item || (!item.T && !item.title)) return;
            const itemWrapper = document.createElement('div');
            itemWrapper.className = 'item';

            const itemButton = document.createElement('button');
            itemButton.className = 'item-button';
            const title = item.T || item.title;
            itemButton.innerHTML = searchTerm ? 
                title.replace(new RegExp(`(${searchTerm})`, 'gi'), '<span class="highlight">$1</span>') : 
                title;

            const content = document.createElement('div');
            content.className = 'content';
            let contentHTML = '';
            if (category === 'articles') { // Changed from truths to articles
                contentHTML = item.content || '';
            } else {
                const scriptures = (item.S || []).map(scripture => 
                    searchTerm ? 
                        scripture.replace(new RegExp(`(${searchTerm})`, 'gi'), '<span class="highlight">$1</span>') : 
                        scripture
                );
                const description = searchTerm && item.D ? 
                    item.D.replace(new RegExp(`(${searchTerm})`, 'gi'), '<span class="highlight">$1</span>') : 
                    item.D || '';
                contentHTML = `
                    <div class="scripture-section"><ul>${scriptures.map(s => `<li>${s}</li>`).join('')}</ul></div>
                    <div class="description-section">${description}</div>
                `;
            }
            content.innerHTML = contentHTML;
            content.style.display = 'none';

            itemWrapper.appendChild(itemButton);
            itemWrapper.appendChild(content);
            itemList.appendChild(itemWrapper);

            itemButton.addEventListener('click', () => {
                console.log(`Clicked ${title}, isOpen: ${content.style.display === 'block'}`);
                const isOpen = content.style.display === 'block';
                document.querySelectorAll('.content').forEach(c => {
                    c.style.display = 'none';
                });
                if (!isOpen) {
                    content.style.display = 'block';
                }
            });
        });
    });

    document.querySelectorAll('.list').forEach(section => section.style.display = 'none');
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active', 'match-highlight'));
}

function showTab(category) {
    console.log(`Switching to tab: ${category}`);
    const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
    const searchResults = document.getElementById('search-results');

    if (searchTerm && searchResults) {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active', 'match-highlight'));
        const tabButton = document.querySelector(`[onclick="showTab('${category}')"]`);
        if (tabButton) tabButton.classList.add('active');
        highlightMatchingTabs(searchTerm);
        return;
    }

    document.querySelectorAll('.content').forEach(c => {
        c.style.display = 'none';
    });
    if (searchResults) searchResults.remove();

    // Toggle logic for people, topics, and articles
    if (category === 'people' || category === 'topics' || category === 'articles') { // Changed from truths to articles
        const selectedTab = document.getElementById(category);
        const otherTabs = ['people', 'topics', 'articles'].filter(c => c !== category).map(c => document.getElementById(c)); // Changed from truths to articles
        if (selectedTab) {
            const isVisible = selectedTab.style.display === 'flex';
            selectedTab.style.display = isVisible ? 'none' : 'flex';
            if (!isVisible) {
                otherTabs.forEach(tab => tab.style.display = 'none'); // Close other tabs
            }
        }
    }

    document.querySelectorAll('.list').forEach(section => {
        if (section.id !== category) {
            section.style.display = 'none'; // Ensure only the selected tab is visible
        }
    });
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active', 'match-highlight'));
    const tabButton = document.querySelector(`[onclick="showTab('${category}')"]`);
    if (tabButton) tabButton.classList.add('active');

    if (searchTerm) {
        highlightMatchingTabs(searchTerm);
    }
}

function highlightMatchingTabs(searchTerm) {
    const categoriesWithMatches = new Set();
    Object.keys(categories).forEach(cat => {
        const items = categories[cat];
        items.forEach(item => {
            if (!item || (!item.T && !item.title)) return;
            const title = item.T || item.title;
            const titleMatch = title.toLowerCase().includes(searchTerm);
            let contentMatch = false;
            if (cat === 'articles') { // Changed from truths to articles
                contentMatch = (item.content || '').toLowerCase().includes(searchTerm);
            } else {
                const scripturesText = (item.S || []).join(' ').toLowerCase();
                const descriptionText = (item.D || '').toLowerCase();
                contentMatch = scripturesText.includes(searchTerm) || descriptionText.includes(searchTerm);
            }
            if (titleMatch || contentMatch) {
                categoriesWithMatches.add(cat);
            }
        });
    });
    categoriesWithMatches.forEach(cat => {
        const tabButton = document.querySelector(`[onclick="showTab('${cat}')"]`);
        if (tabButton) tabButton.classList.add('match-highlight');
    });
}

// Search Functions
function createSearchResults(input) {
    const allList = document.createElement('div');
    allList.className = 'list';
    allList.id = 'search-results';
    const main = document.querySelector('.main-content');
    const existingResults = document.getElementById('search-results');
    if (existingResults) existingResults.remove();
    
    const bearImage = main?.querySelector('.bear-image');
    if (bearImage && main) {
        main.insertBefore(allList, bearImage);
    } else {
        main?.appendChild(allList);
    }
    return allList;
}

function filterAndSortItems(input) {
    const categoriesWithMatches = new Set();
    const matchingItems = [];
    Object.keys(categories).forEach(category => {
        const items = categories[category];
        items.forEach(item => {
            if (!item || (!item.T && !item.title)) return;
            const title = item.T || item.title;
            const titleMatch = title.toLowerCase().includes(input);
            let contentMatch = false;
            let matchingScriptures = [];
            let matchingDescription = '';
            let matchingContent = '';

            if (category === 'articles') { // Changed from truths to articles
                contentMatch = (item.content || '').toLowerCase().includes(input);
                if (!titleMatch && contentMatch) {
                    const paragraphs = (item.content || '').split(/<\/p>\s*<p>/).filter(p => p.trim() !== '');
                    matchingContent = paragraphs
                        .filter(p => p.toLowerCase().includes(input))
                        .map(p => p.replace(/^<p>|<\/p>$/g, '')) // Remove <p> tags
                        .join('</p><p>');
                }
            } else {
                const scripturesText = (item.S || []).join(' ').toLowerCase();
                const descriptionText = (item.D || '').toLowerCase();
                contentMatch = scripturesText.includes(input) || descriptionText.includes(input);
                if (!titleMatch && contentMatch) {
                    matchingScriptures = (item.S || []).filter(s => s.toLowerCase().includes(input));
                    const paragraphs = (item.D || '').split('\n').filter(p => p.trim() !== '');
                    matchingDescription = paragraphs.filter(p => p.toLowerCase().includes(input)).join('\n');
                }
            }

            if (titleMatch || contentMatch) {
                categoriesWithMatches.add(category);
                matchingItems.push({ 
                    item, 
                    category, 
                    titleMatch, 
                    matchingScriptures, 
                    matchingDescription, 
                    matchingContent 
                });
            }
        });
        const itemList = document.getElementById(category);
        if (itemList) {
            itemList.querySelectorAll('.item').forEach(itemDiv => {
                const itemTitle = itemDiv.querySelector('.item-button')?.textContent;
                const item = categories[category].find(i => (i.T || i.title) === itemTitle);
                if (!item) return;
                const title = item.T || item.title;
                const titleMatch = title.toLowerCase().includes(input);
                let contentMatch = false;
                if (category === 'articles') { // Changed from truths to articles
                    contentMatch = (item.content || '').toLowerCase().includes(input);
                } else {
                    const scripturesText = (item.S || []).join(' ').toLowerCase();
                    const descriptionText = (item.D || '').toLowerCase();
                    contentMatch = scripturesText.includes(input) || descriptionText.includes(input);
                }
                itemDiv.style.display = (titleMatch || contentMatch) ? '' : 'none';
            });
        }
    });

    matchingItems.sort((a, b) => {
        const aTitle = a.item.T || a.item.title;
        const aText = a.item.content || `${a.item.T} ${(a.item.S || []).join(' ')} ${a.item.D || ''}`;
        const bTitle = b.item.T || b.item.title;
        const bText = b.item.content || `${b.item.T} ${(b.item.S || []).join(' ')} ${b.item.D || ''}`;
        const aIsExact = aText.toLowerCase() === input || aTitle.toLowerCase() === input || 
            (a.item.S || []).some(s => s.toLowerCase() === input) || (a.item.D || '').toLowerCase() === input || 
            (a.item.content || '').toLowerCase() === input;
        const bIsExact = bText.toLowerCase() === input || bTitle.toLowerCase() === input || 
            (b.item.S || []).some(s => s.toLowerCase() === input) || (b.item.D || '').toLowerCase() === input || 
            (b.item.content || '').toLowerCase() === input;
        if (aIsExact && !bIsExact) return -1;
        if (!aIsExact && bIsExact) return 1;
        return aTitle.localeCompare(bTitle);
    });

    return { matchingItems, categoriesWithMatches };
}

function populateSearchResults(allList, matchingItems, input) {
    if (!allList) return;
    matchingItems.forEach(({ item, category, titleMatch, matchingScriptures, matchingDescription, matchingContent }) => {
        if (!item || (!item.T && !item.title)) return;
        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'item';

        const itemButton = document.createElement('button');
        itemButton.className = 'item-button';
        const title = item.T || item.title;
        itemButton.innerHTML = title.replace(new RegExp(`(${input})`, 'gi'), '<span class="highlight">$1</span>');

        const content = document.createElement('div');
        content.className = 'content';
        let contentHTML = '';

        if (category === 'articles') { // Changed from truths to articles
            if (titleMatch) {
                contentHTML = (item.content || '').replace(new RegExp(`(${input})`, 'gi'), '<span class="highlight">$1</span>');
            } else {
                contentHTML = `<p>${matchingContent.replace(new RegExp(`(${input})`, 'gi'), '<span class="highlight">$1</span>')}</p>`;
            }
        } else {
            if (titleMatch) {
                const highlightedScriptures = (item.S || []).map(scripture =>
                    scripture.replace(new RegExp(`(${input})`, 'gi'), '<span class="highlight">$1</span>')
                );
                const highlightedDescription = (item.D || '').replace(new RegExp(`(${input})`, 'gi'), '<span class="highlight">$1</span>');
                contentHTML = `
                    <div class="scripture-section"><ul>${highlightedScriptures.map(s => `<li>${s}</li>`).join('')}</ul></div>
                    <div class="description-section">${highlightedDescription}</div>
                `;
            } else {
                const highlightedScriptures = matchingScriptures.map(scripture =>
                    scripture.replace(new RegExp(`(${input})`, 'gi'), '<span class="highlight">$1</span>')
                );
                const paragraphs = matchingDescription.split('\n').filter(p => p.trim() !== '');
                const highlightedDescription = paragraphs.map(p =>
                    p.replace(new RegExp(`(${input})`, 'gi'), '<span class="highlight">$1</span>')
                ).map(p => `<p>${p}</p>`).join('');
                contentHTML = `
                    ${highlightedScriptures.length ? `<div class="scripture-section"><ul>${highlightedScriptures.map(s => `<li>${s}</li>`).join('')}</ul></div>` : ''}
                    ${highlightedDescription ? `<div class="description-section">${highlightedDescription}</div>` : ''}
                `;
            }
        }

        content.innerHTML = contentHTML;
        content.style.display = 'block';
        itemWrapper.appendChild(itemButton);
        itemWrapper.appendChild(content);
        allList.appendChild(itemWrapper);

        itemButton.addEventListener('click', () => {
            console.log(`Clicked ${title}, isOpen: ${content.style.display === 'block'}`);
            const isOpen = content.style.display === 'block';
            document.querySelectorAll('.content').forEach(c => {
                c.style.display = 'none';
            });
            if (!isOpen) {
                content.style.display = 'block';
            }
        });
    });
}

function searchItems() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        const input = document.getElementById('search')?.value.toLowerCase() || '';
        console.log(`Searching for: ${input}`);
        if (!input) {
            resetView();
            return;
        }

        const allList = createSearchResults(input);
        const { matchingItems, categoriesWithMatches } = filterAndSortItems(input);
        populateSearchResults(allList, matchingItems, input);

        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('match-highlight'));
        categoriesWithMatches.forEach(category => {
            const tabButton = document.querySelector(`[onclick="showTab('${category}')"]`);
            if (tabButton) tabButton.classList.add('match-highlight');
        });

        document.querySelectorAll('.list').forEach(section => section.style.display = 'none');
        if (allList) allList.style.display = 'flex';
        if (!matchingItems.length) resetView();
    }, 300);
}

// Event Listeners
document.getElementById('search')?.addEventListener('input', searchItems);
document.addEventListener('click', closeMenusOnOutsideClick);
document.querySelector('.hamburger-left')?.addEventListener('click', () => toggleMenu('nav-menu-left'));
document.querySelector('.hamburger-right')?.addEventListener('click', () => toggleMenu('nav-menu-right'));

// Initialize the view on page load
window.onload = () => {
    resetView();
    populateArticleList(); // Changed from populateTruthList to populateArticleList
};
