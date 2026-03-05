// API URL
const API_URL = 'http://localhost:4000';

// State management
let currentPage = 1;
let totalPages = 1;
let currentFilters = {
    search: '',
    category: '',
    sortBy: 'title',
    sortOrder: 'asc',
    minPrice: '',
    maxPrice: '',
    minRating: ''
};

// DOM Elements
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortBy = document.getElementById('sortBy');
const sortOrder = document.getElementById('sortOrder');
const minPrice = document.getElementById('minPrice');
const maxPrice = document.getElementById('maxPrice');
const minRating = document.getElementById('minRating');
const applyFiltersBtn = document.getElementById('applyFilters');
const resetFiltersBtn = document.getElementById('resetFilters');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const showingCount = document.getElementById('showingCount');
const totalCount = document.getElementById('totalCount');
const bookModal = document.getElementById('bookModal');
const bookDetails = document.getElementById('bookDetails');
const closeBtn = document.querySelector('.close');

// Quick access buttons
const topRatedBtn = document.getElementById('topRatedBtn');
const programmingBtn = document.getElementById('programmingBtn');
const fictionBtn = document.getElementById('fictionBtn');
const scienceBtn = document.getElementById('scienceBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadBooks();
    
    // Event listeners
    searchInput.addEventListener('input', debounce(handleSearch, 500));
    applyFiltersBtn.addEventListener('click', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    
    // Quick access buttons
    topRatedBtn.addEventListener('click', () => loadTopRatedBooks());
    programmingBtn.addEventListener('click', () => filterByCategory('Programming'));
    fictionBtn.addEventListener('click', () => filterByCategory('Fiction'));
    scienceBtn.addEventListener('click', () => filterByCategory('Science'));
    
    // Modal close
    closeBtn.addEventListener('click', () => {
        bookModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === bookModal) {
            bookModal.style.display = 'none';
        }
    });

    // Initialize search suggestions
    initializeSearchSuggestions();
});

// Debounce function for search input
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Load categories for filter dropdown
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/books?page=1`);
        if (!response.ok) throw new Error('Failed to load categories');
        
        const data = await response.json();
        const categories = data.filters.categories;
        
        categoryFilter.innerHTML = '<option value="">All Categories</option>' +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load books with current filters
async function loadBooks() {
    try {
        booksContainer.innerHTML = '<div class="loading">Loading books...</div>';
        
        // Build query string
        const params = new URLSearchParams({
            page: currentPage,
            sortBy: currentFilters.sortBy,
            sortOrder: currentFilters.sortOrder
        });
        
        if (currentFilters.search) params.append('search', currentFilters.search);
        if (currentFilters.category) params.append('category', currentFilters.category);
        if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice);
        if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);
        if (currentFilters.minRating) params.append('minRating', currentFilters.minRating);
        
        const response = await fetch(`${API_URL}/books?${params}`);
        if (!response.ok) throw new Error('Failed to load books');
        
        const data = await response.json();
        
        displayBooks(data.books);
        updatePagination(data.filters);
        updateStats(data.filters);
        
    } catch (error) {
        booksContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

// Display books in grid
function displayBooks(books) {
    if (books.length === 0) {
        booksContainer.innerHTML = '<div class="no-results">No books found matching your criteria</div>';
        return;
    }
    
    booksContainer.innerHTML = books.map(book => `
        <div class="book-card" onclick="showBookDetails('${book._id}')">
            <div class="book-cover">
                <i class="fas fa-book"></i>
            </div>
            <div class="book-info">
                <div class="book-title">${escapeHtml(book.title)}</div>
                <div class="book-author">
                    <i class="fas fa-user"></i> ${escapeHtml(book.author)}
                </div>
                <span class="book-category">${escapeHtml(book.category)}</span>
                <div class="book-meta">
                    <span class="book-price">₹${book.price}</span>
                    <div class="book-rating">
                        <span class="stars">
                            ${getStarRating(book.rating)}
                        </span>
                        <span class="rating-value">(${book.rating})</span>
                    </div>
                </div>
                <div class="book-year">
                    <i class="fas fa-calendar"></i> ${book.year}
                </div>
            </div>
        </div>
    `).join('');
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Generate star rating HTML
function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (halfStar ? '½' : '') + 
           '☆'.repeat(emptyStars);
}

// Show book details in modal
window.showBookDetails = async function(id) {
    try {
        const response = await fetch(`${API_URL}/books/${id}`);
        if (!response.ok) throw new Error('Failed to load book details');
        
        const book = await response.json();
        
        bookDetails.innerHTML = `
            <div class="detail-cover">
                <i class="fas fa-book"></i>
            </div>
            <div class="detail-title">${escapeHtml(book.title)}</div>
            <div class="detail-author">
                <i class="fas fa-user"></i> by ${escapeHtml(book.author)}
            </div>
            
            <div class="detail-info">
                <div class="info-item">
                    <span class="info-label">Category</span>
                    <span class="info-value">${escapeHtml(book.category)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Price</span>
                    <span class="info-value">₹${book.price}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Rating</span>
                    <span class="info-value">
                        ${getStarRating(book.rating)} (${book.rating})
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Year</span>
                    <span class="info-value">${book.year}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">ISBN</span>
                    <span class="info-value">${book.isbn || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Publisher</span>
                    <span class="info-value">${book.publisher || 'N/A'}</span>
                </div>
            </div>
        `;
        
        bookModal.style.display = 'block';
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
};

// Handle search input
function handleSearch() {
    currentFilters.search = searchInput.value;
    currentPage = 1;
    loadBooks();
}

// Apply all filters
function applyFilters() {
    currentFilters = {
        search: searchInput.value,
        category: categoryFilter.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        minPrice: minPrice.value,
        maxPrice: maxPrice.value,
        minRating: minRating.value
    };
    currentPage = 1;
    loadBooks();
}

// Reset all filters
function resetFilters() {
    searchInput.value = '';
    categoryFilter.value = '';
    sortBy.value = 'title';
    sortOrder.value = 'asc';
    minPrice.value = '';
    maxPrice.value = '';
    minRating.value = '';
    
    currentFilters = {
        search: '',
        category: '',
        sortBy: 'title',
        sortOrder: 'asc',
        minPrice: '',
        maxPrice: '',
        minRating: ''
    };
    currentPage = 1;
    loadBooks();
}

// Pagination functions
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadBooks();
    }
}

function goToNextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadBooks();
    }
}

// Update pagination UI
function updatePagination(filters) {
    totalPages = filters.totalPages;
    currentPage = filters.currentPage;
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

// Update statistics
function updateStats(filters) {
    const start = ((filters.currentPage - 1) * 6) + 1;
    const end = Math.min(filters.currentPage * 6, filters.totalBooks);
    
    showingCount.textContent = `${start}-${end}`;
    totalCount.textContent = filters.totalBooks;
}

// Load top rated books
async function loadTopRatedBooks() {
    try {
        booksContainer.innerHTML = '<div class="loading">Loading top rated books...</div>';
        
        const response = await fetch(`${API_URL}/books/top?limit=10`);
        if (!response.ok) throw new Error('Failed to load top rated books');
        
        const data = await response.json();
        
        displayBooks(data.books);
        
        // Update UI to show this is a special view
        document.querySelector('.stats').innerHTML = 
            `<i class="fas fa-star" style="color: #f39c12;"></i> Top ${data.books.length} Books with Rating ≥ ${data.minRating}`;
        
        // Disable pagination for this view
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
        pageInfo.textContent = 'Top Rated';
        
    } catch (error) {
        booksContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

// Filter by category
function filterByCategory(category) {
    categoryFilter.value = category;
    currentFilters.category = category;
    currentPage = 1;
    loadBooks();
}

// Sort by price (ascending)
window.sortByPriceAsc = function() {
    currentFilters.sortBy = 'price';
    currentFilters.sortOrder = 'asc';
    currentPage = 1;
    loadBooks();
};

// Sort by price (descending)
window.sortByPriceDesc = function() {
    currentFilters.sortBy = 'price';
    currentFilters.sortOrder = 'desc';
    currentPage = 1;
    loadBooks();
};

// Sort by rating (descending)
window.sortByRatingDesc = function() {
    currentFilters.sortBy = 'rating';
    currentFilters.sortOrder = 'desc';
    currentPage = 1;
    loadBooks();
};

// Search Suggestions Class
class SearchSuggestions {
    constructor(inputElement, onSelect) {
        this.input = inputElement;
        this.onSelect = onSelect;
        this.suggestionsContainer = this.createSuggestionsContainer();
        this.currentSuggestions = [];
        this.selectedIndex = -1;
        
        this.setupEventListeners();
    }
    
    createSuggestionsContainer() {
        const container = document.createElement('div');
        container.className = 'suggestions-container';
        container.style.display = 'none';
        this.input.parentNode.appendChild(container);
        return container;
    }
    
    setupEventListeners() {
        this.input.addEventListener('input', () => this.fetchSuggestions());
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }
    
    async fetchSuggestions() {
        const query = this.input.value.trim();
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/books/search?title=${encodeURIComponent(query)}&page=1`);
            if (!response.ok) throw new Error('Failed to fetch suggestions');
            
            const data = await response.json();
            this.currentSuggestions = data.books.slice(0, 5);
            this.showSuggestions();
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }
    
    showSuggestions() {
        if (this.currentSuggestions.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        this.suggestionsContainer.innerHTML = this.currentSuggestions
            .map((book, index) => `
                <div class="suggestion-item ${index === this.selectedIndex ? 'selected' : ''}" 
                     data-index="${index}">
                    <div class="suggestion-title">${escapeHtml(book.title)}</div>
                    <div class="suggestion-author">by ${escapeHtml(book.author)}</div>
                    <span class="suggestion-category">${escapeHtml(book.category)}</span>
                </div>
            `)
            .join('');
        
        this.suggestionsContainer.style.display = 'block';
        
        // Add click handlers
        this.suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.selectSuggestion(index);
            });
        });
    }
    
    hideSuggestions() {
        this.suggestionsContainer.style.display = 'none';
        this.selectedIndex = -1;
    }
    
    handleKeydown(e) {
        if (this.suggestionsContainer.style.display !== 'block') return;
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.currentSuggestions.length - 1);
                this.highlightSuggestion();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.highlightSuggestion();
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0) {
                    this.selectSuggestion(this.selectedIndex);
                }
                break;
                
            case 'Escape':
                this.hideSuggestions();
                break;
        }
    }
    
    highlightSuggestion() {
        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }
    
    selectSuggestion(index) {
        const book = this.currentSuggestions[index];
        this.input.value = book.title;
        this.hideSuggestions();
        
        // Trigger search with selected title
        currentFilters.search = book.title;
        currentPage = 1;
        loadBooks();
        
        if (this.onSelect) {
            this.onSelect(book);
        }
    }
}

// Initialize search suggestions
function initializeSearchSuggestions() {
    new SearchSuggestions(document.getElementById('searchInput'), (book) => {
        // Optional: Show book details when suggestion is selected
        // Uncomment the line below if you want to show details immediately
        // showBookDetails(book._id);
    });
}

// Add CSS for suggestions dynamically (in case it's not in the CSS file)
function addSuggestionStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .suggestions-container {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 2px solid #e0e0e0;
            border-top: none;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .suggestion-item {
            padding: 12px 15px;
            cursor: pointer;
            transition: background-color 0.3s;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .suggestion-item:last-child {
            border-bottom: none;
        }
        
        .suggestion-item:hover,
        .suggestion-item.selected {
            background-color: #f5f5f5;
        }
        
        .suggestion-title {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 3px;
        }
        
        .suggestion-author {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 5px;
        }
        
        .suggestion-category {
            display: inline-block;
            padding: 2px 8px;
            background: #ecf0f1;
            border-radius: 12px;
            font-size: 0.8em;
            color: #2c3e50;
        }
        
        .search-box {
            position: relative;
        }
    `;
    document.head.appendChild(style);
}

// Call this to ensure styles are added
addSuggestionStyles();

// Export functions for global use
window.loadTopRatedBooks = loadTopRatedBooks;
window.filterByCategory = filterByCategory;
window.showBookDetails = showBookDetails;