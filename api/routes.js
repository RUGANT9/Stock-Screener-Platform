const express = require('express');
const User = require('../backend/db/user.js');
const router = express.Router();

// Routes will be defined here

// GET request
router.get('/login', (req, res) => {
    // Handle the GET request for /users
    res.render("login");
});

// GET request
router.get('/dashboard', (req, res) => {
    // Handle the GET request for /users
    res.render("dashboard");
});

// GET request
router.get('/signup', (req, res) => {
    // Handle the GET request for /users
    res.render("signup");
});

// GET request
router.get('/about', (req, res) => {
    // Handle the GET request for /users
    res.render("about");
});

// GET request
router.get('/profile', async (req, res) => {
    // Handle the GET request for /users
    try {
        const profiles = await User.find({});
        if (!profiles) {
            console.error(err);
            res.send('Error fetching data');
        } else {
            // Render the EJS template with the fetched data
            console.log(profiles)
            res.render('profile', { profiles });
        }
    } catch (err) {
        console.error(err);
    }
});

// GET request
router.get('/positions', (req, res) => {
    // Handle the GET request for /users
    res.render("positions");
});

// POST request
router.post('/signup', async (req, res) => {
    const newUser = new User(
        req.body.user
    );
    try {
        const resultant = await newUser.save({});
        if (!resultant) {
            console.error(err);
            res.send('Error saving data');
        } else {
            console.log('Data saved successfully');
            res.redirect('/login');
        }
    } catch (err) {
        console.error(err);
    }
});

module.exports = router;