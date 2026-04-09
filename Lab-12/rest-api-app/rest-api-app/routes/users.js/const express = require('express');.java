const express = require('express');
const router = express.Router();

// Sample data
let users = [
    { id: 1, name: "Ravi" },
    { id: 2, name: "Teja" }
];

// GET all users
router.get('/', (req, res) => {
    res.json(users);
});

// GET single user (route parameter)
router.get('/:id', (req, res) => {
    const user = users.find(u => u.id == req.params.id);
    res.json(user);
});

// POST create user
router.post('/', (req, res) => {
    const newUser = {
        id: users.length + 1,
        name: req.body.name
    };
    users.push(newUser);
    res.json(newUser);
});

// PUT update user
router.put('/:id', (req, res) => {
    const user = users.find(u => u.id == req.params.id);
    if (user) {
        user.name = req.body.name;
        res.json(user);
    } else {
        res.send("User not found");
    }
});

// DELETE user
router.delete('/:id', (req, res) => {
    users = users.filter(u => u.id != req.params.id);
    res.send("User deleted");
});

module.exports = router;