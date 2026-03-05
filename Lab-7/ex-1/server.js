const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB connection
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let db, notesCollection;

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db('student_notes_db');
        notesCollection = db.collection('notes');
        
        // Create index on created_date for better query performance
        await notesCollection.createIndex({ created_date: -1 });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

connectToMongoDB();

// Routes

// GET all notes
app.get('/notes', async (req, res) => {
    try {
        const notes = await notesCollection.find({})
            .sort({ created_date: -1 })
            .toArray();
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single note
app.get('/notes/:id', async (req, res) => {
    try {
        const note = await notesCollection.findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new note
app.post('/notes', async (req, res) => {
    try {
        const { title, subject, description } = req.body;
        
        // Validation
        if (!title || !subject || !description) {
            return res.status(400).json({ 
                error: 'Title, subject, and description are required' 
            });
        }

        const newNote = {
            title,
            subject,
            description,
            created_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        };

        const result = await notesCollection.insertOne(newNote);
        res.status(201).json({ 
            ...newNote, 
            _id: result.insertedId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update note
app.put('/notes/:id', async (req, res) => {
    try {
        const { title, description } = req.body;
        const noteId = req.params.id;

        // Validation
        if (!title || !description) {
            return res.status(400).json({ 
                error: 'Title and description are required' 
            });
        }

        const result = await notesCollection.updateOne(
            { _id: new ObjectId(noteId) },
            { 
                $set: { 
                    title, 
                    description,
                    updated_date: new Date().toISOString().split('T')[0]
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ 
            message: 'Note updated successfully',
            id: noteId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE note
app.delete('/notes/:id', async (req, res) => {
    try {
        const noteId = req.params.id;
        
        const result = await notesCollection.deleteOne({ 
            _id: new ObjectId(noteId) 
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ 
            message: 'Note deleted successfully',
            id: noteId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});