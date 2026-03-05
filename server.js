const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
const url = 'mongodb://localhost:27017';
const dbName = 'book_finder_db';
let db;

// Connect to MongoDB
MongoClient.connect(url, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        db = client.db(dbName);
        
        // Create indexes for better search performance
        db.collection('books').createIndex({ title: 'text', author: 'text' });
        db.collection('books').createIndex({ category: 1 });
        db.collection('books').createIndex({ price: 1 });
        db.collection('books').createIndex({ rating: -1 });
        
        console.log('Database indexes created');
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });

// Pagination configuration
const BOOKS_PER_PAGE = 6;

// Routes

// 1. Search Books by Title (with pagination)
app.get('/books/search', async (req, res) => {
    try {
        const { title, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * BOOKS_PER_PAGE;

        let query = {};
        if (title) {
            query = { 
                title: { $regex: title, $options: 'i' }
            };
        }

        const books = await db.collection('books')
            .find(query)
            .skip(skip)
            .limit(BOOKS_PER_PAGE)
            .toArray();

        const total = await db.collection('books').countDocuments(query);

        res.json({
            books,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / BOOKS_PER_PAGE),
            totalBooks: total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Filter Books by Category
app.get('/books/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * BOOKS_PER_PAGE;

        const books = await db.collection('books')
            .find({ category: { $regex: new RegExp(`^${category}$`, 'i') } })
            .skip(skip)
            .limit(BOOKS_PER_PAGE)
            .toArray();

        const total = await db.collection('books').countDocuments({ 
            category: { $regex: new RegExp(`^${category}$`, 'i') } 
        });

        res.json({
            books,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / BOOKS_PER_PAGE),
            totalBooks: total,
            category
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Sort Books (with pagination)
app.get('/books/sort/:field', async (req, res) => {
    try {
        const { field } = req.params;
        const { order = 'asc', page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * BOOKS_PER_PAGE;

        // Validate sort field
        const validFields = ['price', 'rating', 'title', 'year'];
        if (!validFields.includes(field)) {
            return res.status(400).json({ error: 'Invalid sort field' });
        }

        const sortOrder = order === 'desc' ? -1 : 1;
        const sortQuery = {};
        sortQuery[field] = sortOrder;

        const books = await db.collection('books')
            .find()
            .sort(sortQuery)
            .skip(skip)
            .limit(BOOKS_PER_PAGE)
            .toArray();

        const total = await db.collection('books').countDocuments();

        res.json({
            books,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / BOOKS_PER_PAGE),
            totalBooks: total,
            sortField: field,
            sortOrder: order
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Top Rated Books
app.get('/books/top', async (req, res) => {
    try {
        const { limit = 5, minRating = 4 } = req.query;

        const books = await db.collection('books')
            .find({ rating: { $gte: parseFloat(minRating) } })
            .sort({ rating: -1, year: -1 })
            .limit(parseInt(limit))
            .toArray();

        res.json({
            books,
            count: books.length,
            minRating: parseFloat(minRating),
            message: `Top ${books.length} books with rating ≥ ${minRating}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Main endpoint with all features combined
app.get('/books', async (req, res) => {
    try {
        const { 
            page = 1, 
            category, 
            search, 
            sortBy = 'title', 
            sortOrder = 'asc',
            minPrice,
            maxPrice,
            minRating
        } = req.query;

        const skip = (parseInt(page) - 1) * BOOKS_PER_PAGE;

        // Build query
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        if (minRating) {
            query.rating = { $gte: parseFloat(minRating) };
        }

        // Build sort
        const sortQuery = {};
        const validSortFields = ['title', 'author', 'price', 'rating', 'year'];
        if (validSortFields.includes(sortBy)) {
            sortQuery[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        // Execute query
        const books = await db.collection('books')
            .find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(BOOKS_PER_PAGE)
            .toArray();

        const total = await db.collection('books').countDocuments(query);

        // Get unique categories for filter dropdown
        const categories = await db.collection('books').distinct('category');

        res.json({
            books,
            filters: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / BOOKS_PER_PAGE),
                totalBooks: total,
                categories,
                appliedFilters: {
                    search: search || null,
                    category: category || null,
                    sortBy,
                    sortOrder,
                    minPrice: minPrice || null,
                    maxPrice: maxPrice || null,
                    minRating: minRating || null
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single book by ID
app.get('/books/:id', async (req, res) => {
    try {
        const book = await db.collection('books')
            .findOne({ _id: new ObjectId(req.params.id) });
        
        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ error: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});