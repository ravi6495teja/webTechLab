const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'book_finder_db';

const sampleBooks = [
    // Programming Books
    {
        title: "JavaScript: The Good Parts",
        author: "Douglas Crockford",
        category: "Programming",
        price: 450,
        rating: 4.8,
        year: 2020,
        isbn: "978-0596517748",
        publisher: "O'Reilly Media"
    },
    {
        title: "Python Crash Course",
        author: "Eric Matthes",
        category: "Programming",
        price: 550,
        rating: 4.9,
        year: 2023,
        isbn: "978-1593279288",
        publisher: "No Starch Press"
    },
    {
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Programming",
        price: 650,
        rating: 4.9,
        year: 2021,
        isbn: "978-0132350884",
        publisher: "Prentice Hall"
    },
    {
        title: "Design Patterns",
        author: "Erich Gamma",
        category: "Programming",
        price: 750,
        rating: 4.7,
        year: 2022,
        isbn: "978-0201633610",
        publisher: "Addison-Wesley"
    },
    {
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen",
        category: "Programming",
        price: 1200,
        rating: 4.9,
        year: 2022,
        isbn: "978-0262033848",
        publisher: "MIT Press"
    },
    
    // Fiction Books
    {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        category: "Fiction",
        price: 350,
        rating: 4.5,
        year: 2020,
        isbn: "978-0743273565",
        publisher: "Scribner"
    },
    {
        title: "1984",
        author: "George Orwell",
        category: "Fiction",
        price: 400,
        rating: 4.8,
        year: 2021,
        isbn: "978-0451524935",
        publisher: "Signet Classic"
    },
    {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        category: "Fiction",
        price: 380,
        rating: 4.8,
        year: 2020,
        isbn: "978-0061120084",
        publisher: "Harper Perennial"
    },
    {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        category: "Fiction",
        price: 300,
        rating: 4.6,
        year: 2019,
        isbn: "978-0141439518",
        publisher: "Penguin Classics"
    },
    {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        category: "Fiction",
        price: 550,
        rating: 4.9,
        year: 2022,
        isbn: "978-0547928227",
        publisher: "Houghton Mifflin"
    },
    
    // Science Books
    {
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        category: "Science",
        price: 600,
        rating: 4.7,
        year: 2020,
        isbn: "978-0553380163",
        publisher: "Bantam"
    },
    {
        title: "The Selfish Gene",
        author: "Richard Dawkins",
        category: "Science",
        price: 520,
        rating: 4.6,
        year: 2021,
        isbn: "978-0199291151",
        publisher: "Oxford University Press"
    },
    {
        title: "Cosmos",
        author: "Carl Sagan",
        category: "Science",
        price: 580,
        rating: 4.9,
        year: 2022,
        isbn: "978-0345539434",
        publisher: "Ballantine Books"
    },
    {
        title: "The Elegant Universe",
        author: "Brian Greene",
        category: "Science",
        price: 650,
        rating: 4.5,
        year: 2023,
        isbn: "978-0393338102",
        publisher: "W. W. Norton"
    },
    
    // History Books
    {
        title: "Sapiens",
        author: "Yuval Noah Harari",
        category: "History",
        price: 700,
        rating: 4.8,
        year: 2021,
        isbn: "978-0062316097",
        publisher: "Harper"
    },
    {
        title: "Guns, Germs, and Steel",
        author: "Jared Diamond",
        category: "History",
        price: 650,
        rating: 4.6,
        year: 2020,
        isbn: "978-0393354324",
        publisher: "W. W. Norton"
    },
    
    // Business Books
    {
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        category: "Business",
        price: 400,
        rating: 4.7,
        year: 2022,
        isbn: "978-1583302877",
        publisher: "Ballantine Books"
    },
    {
        title: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        category: "Business",
        price: 450,
        rating: 4.5,
        year: 2023,
        isbn: "978-1612680194",
        publisher: "Plata Publishing"
    },
    
    // Biography
    {
        title: "Steve Jobs",
        author: "Walter Isaacson",
        category: "Biography",
        price: 550,
        rating: 4.8,
        year: 2021,
        isbn: "978-1451648539",
        publisher: "Simon & Schuster"
    },
    {
        title: "Einstein",
        author: "Walter Isaacson",
        category: "Biography",
        price: 500,
        rating: 4.7,
        year: 2020,
        isbn: "978-0743264747",
        publisher: "Simon & Schuster"
    }
];

async function seedDatabase() {
    try {
        const client = await MongoClient.connect(url, { useUnifiedTopology: true });
        console.log('Connected to MongoDB');
        
        const db = client.db(dbName);
        const collection = db.collection('books');
        
        // Clear existing data
        await collection.deleteMany({});
        console.log('Cleared existing books');
        
        // Insert sample data
        const result = await collection.insertMany(sampleBooks);
        console.log(`Inserted ${result.insertedCount} books`);
        
        // Create indexes
        await collection.createIndex({ title: 'text', author: 'text' });
        await collection.createIndex({ category: 1 });
        await collection.createIndex({ price: 1 });
        await collection.createIndex({ rating: -1 });
        console.log('Indexes created');
        
        // Display sample statistics
        const categories = await collection.distinct('category');
        console.log('\nCategories:', categories);
        
        const avgRating = await collection.aggregate([
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]).toArray();
        console.log('Average rating:', avgRating[0].avgRating.toFixed(2));
        
        const priceRange = await collection.aggregate([
            { $group: { 
                _id: null, 
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                avgPrice: { $avg: '$price' }
            } }
        ]).toArray();
        console.log('Price range:', priceRange[0]);
        
        await client.close();
        console.log('\nDatabase seeded successfully!');
        
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seedDatabase();