const express = require('express');
const app = express();
const PORT = 3000;

// ================= GLOBAL MIDDLEWARE =================

// Middleware 1: Log request details
app.use((req, res, next) => {
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log(`Time: ${new Date().toISOString()}`);
    next(); // move to next middleware
});

// Middleware 2: Simple message
app.use((req, res, next) => {
    console.log("Second middleware executed");
    next();
});

// ================= ROUTE-LEVEL MIDDLEWARE =================

const checkAuth = (req, res, next) => {
    console.log("Route-level middleware (Auth check)");
    next();
};

// ================= ROUTES =================

// Home route (uses only global middleware)
app.get('/', (req, res) => {
    res.send("Home Page");
});

// Protected route (uses route-level middleware)
app.get('/admin', checkAuth, (req, res) => {
    res.send("Admin Page");
});

// ================= START SERVER =================
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});